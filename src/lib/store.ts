"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react";
import { create } from "zustand";

import { applyElkLayout, type LayoutDirection } from "@/lib/layout";
import { createEdgeId, createNodeId } from "@/lib/ids";
import {
  type FlowDocument,
  type FlowEdge,
  type FlowNode,
  type FlowNodeData,
} from "@/lib/schema";

const HISTORY_LIMIT = 50;
const NEW_NODE_OFFSET = { x: 48, y: 48 };

type SelectionState = {
  nodes: string[];
  edges: string[];
};

type HistoryState = {
  past: FlowDocument[];
  future: FlowDocument[];
};

interface FlowStoreState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selection: SelectionState;
  history: HistoryState;
  layoutDirection: LayoutDirection;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => FlowEdge | null;

  addNode: (position: XYPosition, data?: Partial<FlowNodeData>) => FlowNode;
  duplicateNode: (id: string) => FlowNode | null;
  updateNodeData: (
    id: string,
    updater: (data: FlowNodeData) => FlowNodeData,
  ) => void;
  deleteSelection: () => void;
  setSelection: (selection: SelectionState) => void;

  importDocument: (document: FlowDocument) => void;
  exportDocument: () => FlowDocument;
  reset: () => void;

  undo: () => void;
  redo: () => void;

  setLayoutDirection: (direction: LayoutDirection) => void;
  runLayout: (direction?: LayoutDirection) => Promise<void>;
}

function snapshotDocument(state: Pick<FlowStoreState, "nodes" | "edges">) {
  return {
    nodes: state.nodes.map((node) => ({
      ...node,
      type: "flowNode" as const,
      data: { ...node.data },
      position: { ...node.position },
    })),
    edges: state.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: typeof edge.label === "string" ? edge.label : undefined,
      type: edge.type,
    })),
  };
}

function pushHistory(history: HistoryState, snapshot: FlowDocument): HistoryState {
  const nextPast = [...history.past, snapshot];
  if (nextPast.length > HISTORY_LIMIT) {
    nextPast.shift();
  }
  return { past: nextPast, future: [] };
}

const initialState = {
  nodes: [] as FlowNode[],
  edges: [] as FlowEdge[],
  selection: { nodes: [] as string[], edges: [] as string[] },
  history: { past: [] as FlowDocument[], future: [] as FlowDocument[] },
  layoutDirection: "LR" as LayoutDirection,
};

export const useFlowStore = create<FlowStoreState>()((set, get) => ({
  ...initialState,

  onNodesChange: (changes) =>
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes) as FlowNode[];
      if (nextNodes === state.nodes) {
        return state;
      }

      const snapshot = snapshotDocument(state);
      const nextSelection: SelectionState = {
        nodes: state.selection.nodes.filter((id) =>
          nextNodes.some((node) => node.id === id),
        ),
        edges: state.selection.edges.filter((id) =>
          state.edges.some((edge) => edge.id === id),
        ),
      };

      return {
        ...state,
        nodes: nextNodes,
        selection: nextSelection,
        history: pushHistory(state.history, snapshot),
      };
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges) as FlowEdge[];
      if (nextEdges === state.edges) {
        return state;
      }

      return {
        ...state,
        edges: nextEdges,
        history: pushHistory(state.history, snapshotDocument(state)),
      };
    }),

  onConnect: (connection) => {
    if (!connection.source || !connection.target) {
      return null;
    }

    if (connection.source === connection.target) {
      return null;
    }

    const edges = get().edges;
    const exists = edges.some(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle,
    );
    if (exists) {
      return null;
    }

    const updatedEdges = addEdge(
      {
        ...connection,
        id: createEdgeId(),
      },
      edges,
    ) as FlowEdge[];

    set((state) => ({
      ...state,
      edges: updatedEdges,
      history: pushHistory(state.history, snapshotDocument(state)),
    }));

    return updatedEdges[updatedEdges.length - 1] ?? null;
  },

  addNode: (position, data) => {
    const id = createNodeId();
    const node: FlowNode = {
      id,
      type: "flowNode",
      position,
      data: {
        title: data?.title ?? "New box",
        description: data?.description,
      },
    };

    set((state) => ({
      ...state,
      nodes: [...state.nodes, node],
      selection: { nodes: [id], edges: [] },
      history: pushHistory(state.history, snapshotDocument(state)),
    }));

    return node;
  },

  duplicateNode: (id) => {
    const source = get().nodes.find((node) => node.id === id);
    if (!source) {
      return null;
    }

    return get().addNode(
      {
        x: source.position.x + NEW_NODE_OFFSET.x,
        y: source.position.y + NEW_NODE_OFFSET.y,
      },
      {
        title: `${source.data.title} Copy`,
        description: source.data.description,
      },
    );
  },

  updateNodeData: (id, updater) =>
    set((state) => {
      const index = state.nodes.findIndex((node) => node.id === id);
      if (index === -1) {
        return state;
      }

      const snapshot = snapshotDocument(state);
      const nextNodes = [...state.nodes] as FlowNode[];
      nextNodes[index] = {
        ...nextNodes[index],
        data: updater(nextNodes[index]!.data),
      };

      return {
        ...state,
        nodes: nextNodes,
        history: pushHistory(state.history, snapshot),
      };
    }),

  deleteSelection: () =>
    set((state) => {
      if (
        state.selection.nodes.length === 0 &&
        state.selection.edges.length === 0
      ) {
        return state;
      }

      const snapshot = snapshotDocument(state);
      const nodeIds = new Set(state.selection.nodes);
      const edgeIds = new Set(state.selection.edges);

      const remainingNodes = state.nodes.filter(
        (node) => !nodeIds.has(node.id),
      ) as FlowNode[];

      const remainingEdges = state.edges.filter(
        (edge) =>
          !edgeIds.has(edge.id) &&
          !nodeIds.has(edge.source) &&
          !nodeIds.has(edge.target),
      ) as FlowEdge[];

      return {
        ...state,
        nodes: remainingNodes,
        edges: remainingEdges,
        selection: { nodes: [], edges: [] },
        history: pushHistory(state.history, snapshot),
      };
    }),

  setSelection: (selection) =>
    set((state) => ({
      ...state,
      selection,
    })),

  importDocument: (document) =>
    set((state) => ({
      ...state,
      nodes: document.nodes as FlowNode[],
      edges: document.edges as FlowEdge[],
      selection: { nodes: [], edges: [] },
      history: { past: [], future: [] },
    })),

  exportDocument: () => snapshotDocument(get()),

  reset: () =>
    set((state) => ({
      ...state,
      nodes: [],
      edges: [],
      selection: { nodes: [], edges: [] },
      history: pushHistory(state.history, snapshotDocument(state)),
    })),

  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) {
        return state;
      }

      const previous = state.history.past[state.history.past.length - 1];
      const restPast = state.history.past.slice(0, -1);
      const currentSnapshot = snapshotDocument(state);

      return {
        ...state,
        nodes: previous.nodes as FlowNode[],
        edges: previous.edges as FlowEdge[],
        selection: { nodes: [], edges: [] },
        history: {
          past: restPast,
          future: [currentSnapshot, ...state.history.future].slice(
            0,
            HISTORY_LIMIT,
          ),
        },
      };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) {
        return state;
      }

      const [next, ...restFuture] = state.history.future;
      const currentSnapshot = snapshotDocument(state);

      return {
        ...state,
        nodes: next.nodes as FlowNode[],
        edges: next.edges as FlowEdge[],
        selection: { nodes: [], edges: [] },
        history: {
          past: [...state.history.past, currentSnapshot].slice(
            -HISTORY_LIMIT,
          ),
          future: restFuture,
        },
      };
    }),

  setLayoutDirection: (direction) =>
    set((state) => ({
      ...state,
      layoutDirection: direction,
    })),

  runLayout: async (direction) => {
    const currentDirection = direction ?? get().layoutDirection;
    const snapshot = snapshotDocument(get());
    const laidOut = await applyElkLayout(
      snapshot.nodes as FlowNode[],
      snapshot.edges as FlowEdge[],
      currentDirection,
    );

    set((state) => ({
      ...state,
      nodes: laidOut,
      history: pushHistory(state.history, snapshot),
    }));
  },
}));

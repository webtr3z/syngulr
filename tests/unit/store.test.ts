import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Connection } from "@xyflow/react";

vi.mock("@/lib/layout", () => ({
  applyElkLayout: vi.fn(async (nodes: unknown) => nodes),
}));

import { useFlowStore } from "@/lib/store";

const resetStore = () => {
  useFlowStore.setState((state) => ({
    ...state,
    nodes: [],
    edges: [],
    selection: { nodes: [], edges: [] },
    history: { past: [], future: [] },
    layoutDirection: "LR",
  }));
};

describe("flow store", () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  it("adds nodes with default data", () => {
    const node = useFlowStore.getState().addNode({ x: 10, y: 20 });
    const { nodes } = useFlowStore.getState();
    expect(nodes).toHaveLength(1);
    expect(node.data.title).toBe("New box");
  });

  it("updates node data and supports undo/redo", () => {
    const store = useFlowStore.getState();
    const node = store.addNode({ x: 0, y: 0 });
    useFlowStore.getState().updateNodeData(node.id, (data) => ({
      ...data,
      title: "Updated",
    }));

    expect(useFlowStore.getState().nodes[0]?.data.title).toBe("Updated");

    useFlowStore.getState().undo();
    expect(useFlowStore.getState().nodes[0]?.data.title).toBe("New box");

    useFlowStore.getState().redo();
    expect(useFlowStore.getState().nodes[0]?.data.title).toBe("Updated");
  });

  it("creates edges and prevents self connections", () => {
    const store = useFlowStore.getState();
    const first = store.addNode({ x: 0, y: 0 });
    const second = store.addNode({ x: 200, y: 0 });

    const connection: Connection = {
      source: first.id,
      target: second.id,
      sourceHandle: `${first.id}-source`,
      targetHandle: `${second.id}-target`,
    };

    const edge = useFlowStore.getState().onConnect(connection);

    expect(edge).not.toBeNull();
    expect(useFlowStore.getState().edges).toHaveLength(1);

    const selfEdge = useFlowStore.getState().onConnect({
      source: first.id,
      target: first.id,
      sourceHandle: `${first.id}-source`,
      targetHandle: `${first.id}-target`,
    });

    expect(selfEdge).toBeNull();
    expect(useFlowStore.getState().edges).toHaveLength(1);
  });

  it("deletes selected nodes and edges", () => {
    const store = useFlowStore.getState();
    const first = store.addNode({ x: 0, y: 0 });
    const second = store.addNode({ x: 200, y: 0 });
    useFlowStore.getState().onConnect({
      source: first.id,
      target: second.id,
      sourceHandle: `${first.id}-source`,
      targetHandle: `${second.id}-target`,
    });

    useFlowStore
      .getState()
      .setSelection({ nodes: [first.id], edges: [] });
    useFlowStore.getState().deleteSelection();

    const { nodes, edges } = useFlowStore.getState();
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
  });
});

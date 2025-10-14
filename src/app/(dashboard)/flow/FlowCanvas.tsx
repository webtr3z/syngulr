"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { FlowNode } from "@/components/nodes/FlowNode";
import { Inspector } from "@/components/panels/Inspector";
import { Toolbar } from "@/components/Toolbar";
import { loadDiagram, resetDiagram, saveDiagram } from "@/lib/persist";
import {
  documentSchema,
  type FlowEdge as FlowEdgeType,
  type FlowNode as FlowNodeType,
  type FlowNodeData,
} from "@/lib/schema";
import { useFlowStore } from "@/lib/store";
import { toMermaid } from "@/lib/mermaid";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

const nodeTypes = {
  flowNode: FlowNode,
};

function FlowCanvasInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();
  const inspectorPanelRef = useRef<ImperativePanelHandle | null>(null);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const {
    nodes,
    edges,
    selection,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelection,
    deleteSelection,
    importDocument,
    exportDocument,
    undo,
    redo,
    runLayout,
    layoutDirection,
    setLayoutDirection,
  } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      selection: state.selection,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      addNode: state.addNode,
      setSelection: state.setSelection,
      deleteSelection: state.deleteSelection,
      importDocument: state.importDocument,
      exportDocument: state.exportDocument,
      undo: state.undo,
      redo: state.redo,
      runLayout: state.runLayout,
      layoutDirection: state.layoutDirection,
      setLayoutDirection: state.setLayoutDirection,
    }))
  );

  const selectedNode: FlowNodeType | undefined = useMemo(() => {
    if (selection.nodes.length === 0) {
      return undefined;
    }
    return nodes.find((node) => node.id === selection.nodes[0]);
  }, [nodes, selection.nodes]);

  useEffect(() => {
    loadDiagram().then((stored) => {
      if (stored) {
        importDocument(stored);
      }
    });
  }, [importDocument]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const unsubscribe = useFlowStore.subscribe((state) => {
      const doc = {
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
      saveDiagram(doc);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isTextInputFocused = () => {
    const active = document.activeElement as HTMLElement | null;
    if (!active) {
      return false;
    }
    return (
      active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable
    );
  };

  const handleAddNode = useCallback(
    (variant: FlowNodeData["variant"] = "standard") => {
      const viewportBounds = wrapperRef.current?.getBoundingClientRect();
      const clientCenter = {
        x:
          (viewportBounds?.left ?? 0) +
          (viewportBounds?.width ?? window.innerWidth) / 2,
        y:
          (viewportBounds?.top ?? 0) +
          (viewportBounds?.height ?? window.innerHeight) / 2,
      };
      const basePosition = rf.screenToFlowPosition(clientCenter);
      const offsetFactor = nodes.length;
      const adjustedPosition = {
        x: basePosition.x + offsetFactor * 80,
        y: basePosition.y + offsetFactor * 40,
      };
      addNode(adjustedPosition, { variant });
    },
    [addNode, nodes.length, rf],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge = onConnect(connection);
      if (!edge) {
        toast.error("No se puede crear esa conexión.");
      }
    },
    [onConnect]
  );

  const handleAutoLayout = useCallback(() => {
    runLayout()
      .then(() => {
        toast.success("Diseño aplicado");
        requestAnimationFrame(() => {
          rf.fitView({ duration: 500, padding: 0.2 });
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudo aplicar el diseño");
      });
  }, [rf, runLayout]);

  const handleExport = useCallback(() => {
    const doc = exportDocument();
    const json = JSON.stringify(doc, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow-diagram.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Diagrama exportado");
  }, [exportDocument]);

  const handleExportMermaid = useCallback(() => {
    const doc = exportDocument();
    const mermaid = toMermaid(doc, layoutDirection);
    const blob = new Blob([mermaid], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow-diagram.mmd";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Diagrama Mermaid exportado");
  }, [exportDocument, layoutDirection]);

  const handleImport = useCallback(
    (payload: string) => {
      const parsed = documentSchema.safeParse(JSON.parse(payload));
      if (!parsed.success) {
        toast.error("No se pudo importar: JSON inválido");
        return;
      }
      importDocument(parsed.data);
      requestAnimationFrame(() => {
        rf.fitView({ duration: 400, padding: 0.2 });
      });
      toast.success("Diagrama importado");
    },
    [importDocument, rf]
  );

  const handleReset = useCallback(() => {
    resetDiagram()
      .then(() => {
        importDocument({ nodes: [], edges: [] });
        toast.success("Diagrama reiniciado");
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudo reiniciar el diagrama");
      });
  }, [importDocument]);

  const handleSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: {
      nodes: FlowNodeType[];
      edges: FlowEdgeType[];
    }) => {
      setSelection({
        nodes: selectedNodes.map((node) => node.id),
        edges: selectedEdges.map((edge) => edge.id),
      });
    },
    [setSelection]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTextInputFocused()) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleAddNode();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        rf.fitView({ duration: 300, padding: 0.2 });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelection, handleAddNode, redo, rf, undo]);

  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const handleToggleInspector = useCallback(() => {
    const panel = inspectorPanelRef.current;
    if (!panel) {
      return;
    }
    if (inspectorCollapsed) {
      panel.expand();
      setInspectorCollapsed(false);
    } else {
      panel.collapse();
      setInspectorCollapsed(true);
    }
  }, [inspectorCollapsed]);

  return (
    <div className="relative flex h-full min-h-dvh bg-background">
      <PanelGroup
        autoSaveId="flow-layout"
        direction="horizontal"
        className="flex h-full w-full"
      >
      <Panel defaultSize={72} minSize={40} className="relative">
        <div className="relative h-full" ref={wrapperRef}>
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap gap-2">
            <div className="pointer-events-auto">
              <Toolbar
                onAddNode={handleAddNode}
                onAutoLayout={handleAutoLayout}
                onFitView={() => rf.fitView({ duration: 300, padding: 0.2 })}
                onUndo={undo}
                onRedo={redo}
                onExport={handleExport}
                onExportMermaid={handleExportMermaid}
                onImport={handleImport}
                onReset={handleReset}
                onToggleDirection={() =>
                  setLayoutDirection(layoutDirection === "LR" ? "TB" : "LR")
                }
                layoutDirection={layoutDirection}
              />
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            fitView
            fitViewOptions={{ duration: 300 }}
            nodeTypes={nodeTypes}
            onSelectionChange={handleSelectionChange}
            selectionOnDrag
            multiSelectionKeyCode="Shift"
            panOnDrag
            zoomOnDoubleClick={false}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap
              pannable
              zoomable
              className="!rounded-lg !border !border-border !bg-background/90 !text-foreground !shadow-md"
              maskColor="rgba(10, 10, 10, 0.45)"
            />
            <Controls
              showInteractive={false}
              className="!rounded-lg !border !border-border !bg-background/90 !text-foreground !shadow-md [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-md [&>button]:border [&>button]:border-border [&>button]:bg-transparent [&>button]:text-foreground hover:[&>button]:bg-muted/70 focus-visible:[&>button]:ring-2 focus-visible:[&>button]:ring-ring focus-visible:[&>button]:ring-offset-2 focus-visible:[&>button]:ring-offset-background"
            />
            <Background
              color="var(--border)"
              gap={16}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>

          {nodes.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
              <div className="pointer-events-auto rounded-lg border bg-background/80 px-6 py-4 text-center shadow-lg">
                <h2 className="text-lg font-semibold">Comienza tu flujo</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Haz clic en &ldquo;Agregar bloque&rdquo; o presiona N para crear la primera caja.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
      <PanelResizeHandle
        className={cn(
          "relative flex w-2 items-center justify-center bg-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          inspectorCollapsed && "bg-transparent hover:bg-transparent",
        )}
      >
        <button
          type="button"
          onClick={handleToggleInspector}
          ref={toggleButtonRef}
          className="pointer-events-auto absolute -left-14 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={inspectorCollapsed ? "Expandir panel lateral" : "Contraer panel lateral"}
        >
          {inspectorCollapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </button>
        <div
          className={cn(
            "h-10 w-0.5 rounded-full bg-border transition-opacity",
            inspectorCollapsed && "opacity-0",
          )}
        />
      </PanelResizeHandle>
      <Panel
        ref={inspectorPanelRef}
        defaultSize={28}
        minSize={inspectorCollapsed ? 0 : 20}
        collapsedSize={0}
        collapsible
        onCollapse={() => setInspectorCollapsed(true)}
        onExpand={() => setInspectorCollapsed(false)}
        className={cn(
          "border-l border-border bg-background/90 p-4 transition-all duration-200",
          inspectorCollapsed && "!pointer-events-none !border-transparent !bg-transparent !p-0 opacity-0",
        )}
      >
        <Inspector node={selectedNode} />
      </Panel>
      </PanelGroup>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

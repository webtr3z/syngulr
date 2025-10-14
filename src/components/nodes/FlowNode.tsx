"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { FlowNodeData } from "@/lib/schema";
import { useFlowStore } from "@/lib/store";
import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { memo, useCallback } from "react";
import { FileText, GitBranch } from "lucide-react";

function FlowNodeComponent({ id, data, selected }: NodeProps) {
  const setSelection = useFlowStore((state) => state.setSelection);
  const deleteSelection = useFlowStore((state) => state.deleteSelection);
  const duplicateNode = useFlowStore((state) => state.duplicateNode);
  const nodeData = data as FlowNodeData;
  const variant = nodeData.variant ?? "standard";
  const VariantIcon = variant === "condition" ? GitBranch : FileText;

  const handleFocusInspector = useCallback(() => {
    setSelection({ nodes: [id], edges: [] });
  }, [id, setSelection]);

  const handleDelete = useCallback(() => {
    setSelection({ nodes: [id], edges: [] });
    deleteSelection();
  }, [deleteSelection, id, setSelection]);

  const handleDuplicate = useCallback(() => {
    setSelection({ nodes: [id], edges: [] });
    duplicateNode(id);
  }, [duplicateNode, id, setSelection]);

  return (
    <>
      <Handle
        id={`${id}-target`}
        position={Position.Left}
        type="target"
        className="size-3 rounded-full border border-border bg-background"
        data-testid={`${id}-handle-target`}
      />
      <ContextMenu>
        <ContextMenuTrigger onDoubleClick={handleFocusInspector}>
          <Card
            className={cn(
              "relative min-w-[220px] cursor-pointer border transition-shadow",
              selected ? "ring-2 ring-ring shadow-lg" : "",
            )}
            onDoubleClick={handleFocusInspector}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <VariantIcon className="h-4 w-4 text-muted-foreground" />
                <span>{nodeData.title}</span>
              </CardTitle>
              {nodeData.description ? (
                <CardDescription className="whitespace-pre-wrap">
                  {nodeData.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Haz clic derecho para ver acciones
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => handleFocusInspector()}>
            Editar
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => handleDuplicate()}>
            Duplicar
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => handleDelete()}
            className="text-destructive focus:text-destructive"
          >
            Eliminar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {variant === "condition" ? (
        <>
          <Handle
            id={`${id}-source-true`}
            position={Position.Right}
            type="source"
            className="size-3 rounded-full border border-border bg-background"
            data-testid={`${id}-handle-source-true`}
            style={{ top: "35%" }}
          />
          <Handle
            id={`${id}-source-false`}
            position={Position.Right}
            type="source"
            className="size-3 rounded-full border border-border bg-background"
            data-testid={`${id}-handle-source-false`}
            style={{ top: "65%" }}
          />
        </>
      ) : (
        <Handle
          id={`${id}-source`}
          position={Position.Right}
          type="source"
          className="size-3 rounded-full border border-border bg-background"
          data-testid={`${id}-handle-source`}
        />
      )}
    </>
  );
}

export const FlowNode = memo(FlowNodeComponent);

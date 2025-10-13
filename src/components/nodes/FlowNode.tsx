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

function FlowNodeComponent({ id, data, selected }: NodeProps) {
  const setSelection = useFlowStore((state) => state.setSelection);
  const deleteSelection = useFlowStore((state) => state.deleteSelection);
  const duplicateNode = useFlowStore((state) => state.duplicateNode);
  const nodeData = data as FlowNodeData;

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
              "min-w-[220px] cursor-pointer border transition-shadow",
              selected ? "ring-2 ring-ring shadow-lg" : "",
            )}
            onDoubleClick={handleFocusInspector}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">{nodeData.title}</CardTitle>
              {nodeData.description ? (
                <CardDescription className="whitespace-pre-wrap">
                  {nodeData.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Right-click for actions
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => handleFocusInspector()}>
            Edit
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => handleDuplicate()}>
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => handleDelete()}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Handle
        id={`${id}-source`}
        position={Position.Right}
        type="source"
        className="size-3 rounded-full border border-border bg-background"
        data-testid={`${id}-handle-source`}
      />
    </>
  );
}

export const FlowNode = memo(FlowNodeComponent);

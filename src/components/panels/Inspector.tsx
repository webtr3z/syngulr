"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toMermaid } from "@/lib/mermaid";
import type { FlowDocument, FlowNode } from "@/lib/schema";
import { useFlowStore } from "@/lib/store";

interface InspectorProps {
  node?: FlowNode;
}

export function Inspector({ node }: InspectorProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const layoutDirection = useFlowStore((state) => state.layoutDirection);
  const { nodes, edges } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  const [title, setTitle] = useState(node?.data.title ?? "");
  const [description, setDescription] = useState(node?.data.description ?? "");
  const [previewTab, setPreviewTab] = useState<"json" | "mermaid">("json");
  const [inspectorTab, setInspectorTab] = useState<"details" | "chat">("details");

  useEffect(() => {
    setTitle(node?.data.title ?? "");
    setDescription(node?.data.description ?? "");
  }, [node]);

  const snapshot = useMemo<FlowDocument>(
    () => ({
      nodes: nodes.map((node) => ({
        ...node,
        type: "flowNode",
        data: { ...node.data },
        position: { ...node.position },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? undefined,
        targetHandle: edge.targetHandle ?? undefined,
        label: typeof edge.label === "string" ? edge.label : undefined,
        type: edge.type,
      })),
    }),
    [nodes, edges],
  );

  const jsonPreview = useMemo(
    () => JSON.stringify(snapshot, null, 2),
    [snapshot],
  );
  const mermaidPreview = useMemo(
    () => toMermaid(snapshot, layoutDirection),
    [snapshot, layoutDirection],
  );

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy");
    }
  };

  const inspectorContent = node ? (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inspector-title">Title</Label>
        <Input
          id="inspector-title"
          value={title}
          onChange={(event) => {
            const value = event.target.value;
            setTitle(value);
            if (value.trim().length > 0) {
              updateNodeData(node.id, (data) => ({
                ...data,
                title: value,
              }));
            }
          }}
          onBlur={() => {
            if (title.trim().length === 0) {
              const fallback = "Untitled";
              setTitle(fallback);
              updateNodeData(node.id, (data) => ({
                ...data,
                title: fallback,
              }));
            }
          }}
          placeholder="Name this box"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inspector-description">Description</Label>
        <Textarea
          id="inspector-description"
          value={description}
          onChange={(event) => {
            const value = event.target.value;
            setDescription(value);
            updateNodeData(node.id, (data) => ({
              ...data,
              description: value.length > 0 ? value : undefined,
            }));
          }}
          placeholder="Optional details"
          rows={4}
        />
      </div>
      <PreviewPanel
        previewTab={previewTab}
        onPreviewTabChange={setPreviewTab}
        jsonPreview={jsonPreview}
        mermaidPreview={mermaidPreview}
        onCopy={handleCopy}
      />
    </div>
  ) : (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select a box to edit its title and description.
      </p>
      <PreviewPanel
        previewTab={previewTab}
        onPreviewTabChange={setPreviewTab}
        jsonPreview={jsonPreview}
        mermaidPreview={mermaidPreview}
        onCopy={handleCopy}
      />
    </div>
  );

  return (
    <Tabs
      value={inspectorTab}
      onValueChange={(value) => setInspectorTab(value as "details" | "chat")}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Inspector</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="mt-4">
        <Card className="w-full">
          <CardContent className="space-y-4 pt-6">{inspectorContent}</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chat" className="mt-4">
        <Card className="w-full">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Chat with Assistant (coming soon). We&apos;ll connect this panel to OpenAI to help you generate or modify flows conversationally.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-input">Message</Label>
              <Textarea
                id="chat-input"
                placeholder="Describe what you would like to build..."
                rows={4}
                className="resize-y"
              />
              <Button size="sm" className="mt-2" disabled>
                Send (coming soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

interface PreviewPanelProps {
  previewTab: "json" | "mermaid";
  onPreviewTabChange: (value: "json" | "mermaid") => void;
  jsonPreview: string;
  mermaidPreview: string;
  onCopy: (value: string) => void;
}

function PreviewPanel({
  previewTab,
  onPreviewTabChange,
  jsonPreview,
  mermaidPreview,
  onCopy,
}: PreviewPanelProps) {
  return (
    <Card className="w-full border bg-muted/30">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Code Preview</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(previewTab === "json" ? jsonPreview : mermaidPreview)}
          >
            Copy
          </Button>
        </div>
        <Tabs value={previewTab} onValueChange={(value) => onPreviewTabChange(value as "json" | "mermaid")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="mermaid">Mermaid</TabsTrigger>
          </TabsList>
          <TabsContent value="json">
            <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-background/80 p-3 text-left text-xs leading-relaxed text-foreground">
              {jsonPreview}
            </pre>
          </TabsContent>
          <TabsContent value="mermaid">
            <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-background/80 p-3 text-left text-xs leading-relaxed text-foreground">
              {mermaidPreview}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

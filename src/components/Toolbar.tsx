"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LayoutDirection } from "@/lib/layout";

interface ToolbarProps {
  onAddNode: () => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onExportMermaid: () => void;
  onImport: (payload: string) => void;
  onReset: () => void;
  onToggleDirection: () => void;
  layoutDirection: LayoutDirection;
}

export function Toolbar({
  onAddNode,
  onAutoLayout,
  onFitView,
  onUndo,
  onRedo,
  onExport,
  onExportMermaid,
  onImport,
  onReset,
  onToggleDirection,
  layoutDirection,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    onImport(text);
    event.target.value = "";
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-2 rounded-lg border bg-card/80 p-2 shadow-sm backdrop-blur">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAddNode} size="sm">
              Add Box
            </Button>
          </TooltipTrigger>
          <TooltipContent>N — Add node near center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAutoLayout} size="sm" variant="outline">
              Auto-layout ({layoutDirection})
            </Button>
          </TooltipTrigger>
          <TooltipContent>Run ELK layout for current graph</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onToggleDirection} size="sm" variant="ghost">
              Direction
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle layout direction between LR and TB
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onFitView} size="sm" variant="outline">
              Fit
            </Button>
          </TooltipTrigger>
          <TooltipContent>F — Fit diagram to viewport</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onUndo} size="sm" variant="ghost">
              Undo
            </Button>
          </TooltipTrigger>
          <TooltipContent>⌘/Ctrl + Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onRedo} size="sm" variant="ghost">
              Redo
            </Button>
          </TooltipTrigger>
          <TooltipContent>⌘/Ctrl + Shift + Z</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onExport} size="sm" variant="outline">
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download JSON</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onExportMermaid} size="sm" variant="outline">
              Mermaid
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download Mermaid flowchart</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleImportClick} size="sm" variant="outline">
              Import
            </Button>
          </TooltipTrigger>
          <TooltipContent>Load diagram from JSON</TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onReset} size="sm" variant="destructive">
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear diagram and storage</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

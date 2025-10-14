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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LayoutDirection } from "@/lib/layout";
import type { FlowNodeData } from "@/lib/schema";
import {
  FileDown,
  GitBranch,
  ImportIcon,
  Layers,
  Maximize,
  Redo,
  Trash2,
  Undo,
  ArrowLeftRight,
} from "lucide-react";

interface ToolbarProps {
  onAddNode: (variant: FlowNodeData["variant"]) => void;
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
      <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible rounded-lg border bg-card/80 p-2 shadow-sm backdrop-blur">
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="size-9 p-0" aria-label="Agregar bloque">
                  <GitBranch className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="start" className="z-50">
              <DropdownMenuItem onSelect={() => onAddNode("standard")}>
                Caja vacía
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAddNode("condition")}>
                Caja if/else
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent className="z-50">
            N — Agrega un nodo cerca del centro
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onAutoLayout}
              size="sm"
              variant="outline"
              className="size-9 p-0"
              aria-label={`Autoorganizar (${layoutDirection})`}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            Ejecuta el layout ELK para el diagrama
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleDirection}
              size="sm"
              variant="ghost"
              className="size-9 p-0"
              aria-label="Cambiar dirección"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            Alterna la dirección del layout entre LR y TB
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onFitView}
              size="sm"
              variant="outline"
              className="size-9 p-0"
              aria-label="Ajustar vista"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            F — Ajusta el diagrama a la pantalla
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onUndo}
              size="sm"
              variant="ghost"
              className="size-9 p-0"
              aria-label="Deshacer"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">⌘/Ctrl + Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRedo}
              size="sm"
              variant="ghost"
              className="size-9 p-0"
              aria-label="Rehacer"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">⌘/Ctrl + Shift + Z</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-9 p-0"
                  aria-label="Exportar"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="start" className="z-50">
              <DropdownMenuItem onSelect={() => onExport()}>
                Exportar JSON
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onExportMermaid()}>
                Exportar Mermaid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent className="z-50">
            Descarga el diagrama
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleImportClick}
              size="sm"
              variant="outline"
              className="size-9 p-0"
              aria-label="Importar"
            >
              <ImportIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            Carga un diagrama desde JSON
          </TooltipContent>
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
            <Button
              onClick={onReset}
              size="sm"
              variant="destructive"
              className="size-9 p-0"
              aria-label="Reiniciar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            Limpia el diagrama y el almacenamiento
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

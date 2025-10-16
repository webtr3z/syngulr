"use client";

import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotionPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export function NotionPromptModal({
  open,
  onOpenChange,
  title,
  content,
}: NotionPromptModalProps) {
  const copyDisabled =
    !content ||
    content === "Cargando contenido..." ||
    content === "No se pudo cargar el contenido.";

  const copyAsMarkdown = async () => {
    if (copyDisabled) {
      return;
    }
    try {
      const markdown = `# ${title}\n\n${content}`.trim();
      await navigator.clipboard.writeText(markdown);
      toast.success("Copiado como Markdown");
    } catch (error) {
      console.error("Error al copiar markdown", error);
      toast.error("No se pudo copiar el contenido");
    }
  };

  const copyAsRawText = async () => {
    if (copyDisabled) {
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copiado como texto");
    } catch (error) {
      console.error("Error al copiar texto", error);
      toast.error("No se pudo copiar el contenido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Contenido del prompt desde Notion
              </DialogDescription>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyAsMarkdown}
                      disabled={copyDisabled}
                      aria-label="Copiar como Markdown"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar como Markdown</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyAsRawText}
                      disabled={copyDisabled}
                      aria-label="Copiar como texto"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar texto</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {content || "Sin contenido disponible"}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

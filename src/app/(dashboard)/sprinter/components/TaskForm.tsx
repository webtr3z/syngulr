"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSprinterStore } from "../store/sprinter-store";
import { Plus, X } from "lucide-react";

const newTaskSchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    "componente",
    "pagina",
    "widget",
    "estilos",
    "diseno",
    "api",
    "configuracion",
    "documentacion",
  ]),
  description: z.string().optional(),
});

export function TaskForm() {
  const addTask = useSprinterStore((s) => s.addTask);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] =
    useState<z.infer<typeof newTaskSchema>["type"]>("componente");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setType("componente");
    setDescription("");
  };

  const handleSubmit = () => {
    const parsed = newTaskSchema.safeParse({
      title,
      type,
      description: description || undefined,
    });
    if (!parsed.success) return;
    addTask(parsed.data);
    resetForm();
    setIsExpanded(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="mb-4 w-full gap-2"
        aria-label="Crear nueva tarea"
      >
        <Plus className="h-4 w-4" />
        Crear tarea
      </Button>
    );
  }

  return (
    <div className="mb-4 space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Nueva tarea</h4>
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Cancelar"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Nueva tarea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Título de la tarea"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={type}
            onChange={(e) =>
              setType(e.target.value as z.infer<typeof newTaskSchema>["type"])
            }
            aria-label="Tipo de tarea"
          >
            <option value="componente">Componente</option>
            <option value="pagina">Página</option>
            <option value="widget">Widget</option>
            <option value="estilos">Estilos</option>
            <option value="diseno">Diseño</option>
            <option value="api">API</option>
            <option value="configuracion">Configuración</option>
            <option value="documentacion">Documentación</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Detalles breves..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Descripción de la tarea"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            Crear
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

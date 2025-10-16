import type { ColumnId } from "@/types/sprinter";

export const COLUMNS: Array<{
  id: ColumnId;
  title: string;
  description: string;
  color: string;
  allowCreate: boolean;
}> = [
  {
    id: "todo",
    title: "TO-DO",
    description: "Tareas pendientes por iniciar",
    color: "bg-background",
    allowCreate: true,
  },
  {
    id: "in-progress",
    title: "EN DESARROLLO",
    description: "Tareas en progreso",
    color: "bg-background",
    allowCreate: false,
  },
  {
    id: "testing",
    title: "PROBANDO",
    description: "En proceso de testing/QA",
    color: "bg-background",
    allowCreate: false,
  },
  {
    id: "completed",
    title: "COMPLETADO",
    description: "Tareas finalizadas",
    color: "bg-background",
    allowCreate: false,
  },
];

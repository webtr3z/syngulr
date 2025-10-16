import { z } from "zod";

export const taskTypeSchema = z.enum([
  "componente",
  "pagina",
  "widget",
  "estilos",
  "diseno",
  "api",
  "configuracion",
  "documentacion",
]);

export const columnIdSchema = z.enum([
  "todo",
  "in-progress",
  "testing",
  "completed",
]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "El título es requerido"),
  type: taskTypeSchema,
  description: z.string().optional(),
  column: columnIdSchema,
  position: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: columnIdSchema,
});

export const taskArraySchema = z.array(taskSchema);

export type Task = z.infer<typeof taskSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type ColumnId = z.infer<typeof columnIdSchema>;

// Eventos de timeline / historial
export const taskEventTypeSchema = z.enum([
  "created",
  "moved",
  "updated",
  "deleted",
  "status-changed",
]);

export const taskEventSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  taskTitle: z.string(),
  eventType: taskEventTypeSchema,
  timestamp: z.date(),
  details: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
      field: z.string().optional(),
      oldValue: z.string().optional(),
      newValue: z.string().optional(),
    })
    .optional(),
  userId: z.string().optional(),
});

export const taskEventArraySchema = z.array(taskEventSchema);

export type TaskEvent = z.infer<typeof taskEventSchema>;
export type TaskEventType = z.infer<typeof taskEventTypeSchema>;

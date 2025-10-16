# PROMPT: Mejoras del Sistema Sprinter - Timeline Interactivo y Corrección de Duplicación

## Contexto del Proyecto

Este proyecto es una aplicación Next.js 15 con el siguiente stack:

- **Arquitectura**: Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui
- **Estado**: Zustand para gestión global
- **Persistencia**: IndexedDB vía idb-keyval
- **Drag & Drop**: @hello-pangea/dnd
- **Convenciones**: Ver `AGENTS.md` y `.cursorrules` para reglas del proyecto

**Sistema actual**: Sprinter en `/sprinter` - Sistema Kanban con 4 columnas (TO-DO, EN DESARROLLO, PROBANDO, COMPLETADO) y vista de timeline básica.

---

## Objetivos de esta Implementación

1. **Corregir duplicación de tareas** al mover entre columnas
2. **Implementar timeline interactivo** usando shadcn-timeline
3. **Registrar historial completo** de cambios y movimientos de tareas

---

## TAREA 1: Corregir Duplicación de Tareas al Mover Entre Columnas

### Problema Actual

Las tareas pueden aparecer duplicadas cuando se mueven de una columna a otra. Debe verificarse que el movimiento sea atómico y que la tarea solo exista en la columna destino.

### Diagnóstico Requerido

**Paso 1**: Verificar la lógica de `moveTask` en el store

**Archivo**: `src/app/(dashboard)/sprinter/store/sprinter-store.ts`

**Análisis actual**:

```typescript
moveTask: (taskId, targetColumn, position) =>
  set((state) => {
    const src = state.tasks.find((t) => t.id === taskId);
    if (!src) return state;

    // Esta lógica debe decrementar posiciones en columna origen
    const decSrc = state.tasks.map((t) =>
      t.column === src.column && t.position > src.position
        ? { ...t, position: t.position - 1 }
        : t
    );

    // Filtrar tareas de columna destino
    const dstTasks = decSrc.filter((t) => t.column === targetColumn);
    const shiftedDst = dstTasks.map((t) =>
      t.position >= position ? { ...t, position: t.position + 1 } : t
    );

    // VERIFICAR: ¿Se están combinando correctamente?
    const others = decSrc.filter((t) => t.column !== targetColumn);
    const combined = [
      ...others,
      ...shiftedDst,
      {
        ...src,
        column: targetColumn,
        status: targetColumn,
        position,
        updatedAt: new Date(),
      },
    ];

    const normalized = normalizePositions(combined);
    queueSave(normalized);
    return {
      tasks: normalized,
      history: pushHistory(state.history, state.tasks),
    };
  }),
```

**Problema identificado**: La lógica actual puede incluir la tarea original en `others` si no se filtró correctamente.

### Solución Implementar

**Refactorizar `moveTask`** para garantizar que la tarea se remueva de la columna origen:

```typescript
moveTask: (taskId, targetColumn, position) =>
  set((state) => {
    const taskToMove = state.tasks.find((t) => t.id === taskId);
    if (!taskToMove) return state;

    // Si ya está en la columna destino, solo reordenar
    if (taskToMove.column === targetColumn) {
      return state; // Dejar que reorderTaskInColumn maneje esto
    }

    // 1. Remover la tarea de todas las listas
    const withoutMovedTask = state.tasks.filter((t) => t.id !== taskId);

    // 2. Normalizar posiciones en la columna origen (llenar el hueco)
    const normalizedSource = withoutMovedTask.map((t) =>
      t.column === taskToMove.column && t.position > taskToMove.position
        ? { ...t, position: t.position - 1 }
        : t
    );

    // 3. Hacer espacio en la columna destino
    const withSpaceInDestination = normalizedSource.map((t) =>
      t.column === targetColumn && t.position >= position
        ? { ...t, position: t.position + 1 }
        : t
    );

    // 4. Insertar la tarea movida en la columna destino
    const movedTask: Task = {
      ...taskToMove,
      column: targetColumn,
      status: targetColumn,
      position,
      updatedAt: new Date(),
    };

    const nextTasks = [...withSpaceInDestination, movedTask];
    const normalized = normalizePositions(nextTasks);

    queueSave(normalized);
    return {
      tasks: normalized,
      history: pushHistory(state.history, state.tasks),
    };
  }),
```

### Validación

**Checklist de pruebas**:

- [ ] Mover tarea de TO-DO a EN DESARROLLO → no aparece duplicada
- [ ] Mover tarea entre cualquier par de columnas → sin duplicación
- [ ] Las posiciones en ambas columnas se mantienen correctas
- [ ] La persistencia guarda el estado correcto
- [ ] Refrescar la página mantiene el estado sin duplicaciones

---

## TAREA 2: Implementar Timeline Interactivo con Historial de Cambios

### Contexto y Referencias

**Componente a usar**: shadcn-timeline

- URL demo: https://shadcn-timeline.vercel.app/
- GitHub: https://github.com/timDeHof/shadcn-timeline

**Objetivo**: Reemplazar la vista de timeline actual (tabla estática) con un timeline interactivo que muestre el historial completo de cambios de todas las tareas.

### Paso 1: Instalar shadcn-timeline

```bash
pnpm add @/components/ui/timeline
# O si está disponible como paquete
pnpm add shadcn-timeline
```

**Nota**: Si el componente no está disponible como paquete, copiar el código fuente del componente Timeline desde el repositorio de GitHub y adaptarlo al proyecto.

### Paso 2: Extender el Schema de Tipos

**Archivo**: `src/types/sprinter.ts`

**Agregar nuevo tipo para eventos de timeline**:

```typescript
import { z } from "zod";

// ... tipos existentes ...

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
      from: z.string().optional(), // Columna origen
      to: z.string().optional(), // Columna destino
      field: z.string().optional(), // Campo modificado
      oldValue: z.string().optional(),
      newValue: z.string().optional(),
    })
    .optional(),
  userId: z.string().optional(), // Para futuro multiusuario
});

export const taskEventArraySchema = z.array(taskEventSchema);

export type TaskEvent = z.infer<typeof taskEventSchema>;
export type TaskEventType = z.infer<typeof taskEventTypeSchema>;
```

### Paso 3: Actualizar el Store para Registrar Eventos

**Archivo**: `src/app/(dashboard)/sprinter/store/sprinter-store.ts`

**Agregar estado de eventos**:

```typescript
import type { ColumnId, Task, TaskType, TaskEvent } from "@/types/sprinter";
import { nanoid } from "nanoid";

interface SprinterStore {
  tasks: Task[];
  events: TaskEvent[]; // NUEVO
  history: History;

  // ... métodos existentes ...

  // NUEVOS métodos
  addEvent: (event: Omit<TaskEvent, "id" | "timestamp">) => void;
  getEventsForTask: (taskId: string) => TaskEvent[];
  getAllEvents: () => TaskEvent[];
}

export const useSprinterStore = create<SprinterStore>((set, get) => ({
  tasks: [],
  events: [], // NUEVO
  history: { past: [], future: [] },

  // Método para registrar eventos
  addEvent: (event) => {
    const newEvent: TaskEvent = {
      ...event,
      id: nanoid(),
      timestamp: new Date(),
    };
    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },

  // Obtener eventos de una tarea específica
  getEventsForTask: (taskId) => {
    return get().events.filter((e) => e.taskId === taskId);
  },

  // Obtener todos los eventos ordenados
  getAllEvents: () => {
    return get().events.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  },

  // MODIFICAR addTask para registrar evento
  addTask: ({ title, type, description }) =>
    set((state) => {
      const now = new Date();
      const taskId = nanoid();
      const next: Task[] = [
        ...state.tasks,
        {
          id: taskId,
          title,
          type,
          description,
          column: "todo",
          position: state.tasks.filter((t) => t.column === "todo").length,
          createdAt: now,
          updatedAt: now,
          status: "todo",
        },
      ];

      // REGISTRAR EVENTO
      const event: TaskEvent = {
        id: nanoid(),
        taskId,
        taskTitle: title,
        eventType: "created",
        timestamp: now,
        details: {
          to: "todo",
        },
      };

      queueSave(next);
      return {
        tasks: next,
        events: [...state.events, event],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  // MODIFICAR moveTask para registrar evento
  moveTask: (taskId, targetColumn, position) =>
    set((state) => {
      const taskToMove = state.tasks.find((t) => t.id === taskId);
      if (!taskToMove) return state;
      if (taskToMove.column === targetColumn) return state;

      // ... lógica de movimiento (ver Tarea 1) ...

      // REGISTRAR EVENTO DE MOVIMIENTO
      const event: TaskEvent = {
        id: nanoid(),
        taskId,
        taskTitle: taskToMove.title,
        eventType: "moved",
        timestamp: new Date(),
        details: {
          from: taskToMove.column,
          to: targetColumn,
        },
      };

      queueSave(normalized);
      return {
        tasks: normalized,
        events: [...state.events, event],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  // MODIFICAR updateTask para registrar evento
  updateTask: (id, updates) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const next = state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      );

      // REGISTRAR EVENTO POR CADA CAMPO MODIFICADO
      const events: TaskEvent[] = [];
      Object.keys(updates).forEach((field) => {
        if (field !== "updatedAt") {
          events.push({
            id: nanoid(),
            taskId: id,
            taskTitle: task.title,
            eventType: "updated",
            timestamp: new Date(),
            details: {
              field,
              oldValue: String(task[field as keyof Task] ?? ""),
              newValue: String(updates[field as keyof Task] ?? ""),
            },
          });
        }
      });

      queueSave(next);
      return {
        tasks: next,
        events: [...state.events, ...events],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  // MODIFICAR deleteTask para registrar evento
  deleteTask: (id) =>
    set((state) => {
      const deleted = state.tasks.find((t) => t.id === id);
      if (!deleted) return state;

      const next = state.tasks
        .filter((t) => t.id !== id)
        .map((t) =>
          t.column === deleted.column && t.position > deleted.position
            ? { ...t, position: t.position - 1 }
            : t
        );

      // REGISTRAR EVENTO
      const event: TaskEvent = {
        id: nanoid(),
        taskId: id,
        taskTitle: deleted.title,
        eventType: "deleted",
        timestamp: new Date(),
        details: {
          from: deleted.column,
        },
      };

      queueSave(next);
      return {
        tasks: next,
        events: [...state.events, event],
        history: pushHistory(state.history, state.tasks),
      };
    }),
}));
```

### Paso 4: Actualizar Persistencia

**Archivo**: `src/lib/sprinter-persist.ts`

**Agregar persistencia de eventos**:

```typescript
import { del, get, set } from "idb-keyval";
import {
  taskArraySchema,
  taskEventArraySchema,
  type Task,
  type TaskEvent,
} from "@/types/sprinter";

const SPRINTER_TASKS_KEY = "syngulr-sprinter-tasks";
const SPRINTER_EVENTS_KEY = "syngulr-sprinter-events";

export async function loadSprinterData(): Promise<Task[] | null> {
  try {
    const stored = await get(SPRINTER_TASKS_KEY);
    if (!stored) return null;
    return taskArraySchema.parse(stored);
  } catch {
    return null;
  }
}

export async function saveSprinterData(tasks: Task[]): Promise<void> {
  try {
    await set(SPRINTER_TASKS_KEY, tasks);
  } catch {
    // noop
  }
}

export async function loadSprinterEvents(): Promise<TaskEvent[] | null> {
  try {
    const stored = await get(SPRINTER_EVENTS_KEY);
    if (!stored) return null;
    return taskEventArraySchema.parse(stored);
  } catch {
    return null;
  }
}

export async function saveSprinterEvents(events: TaskEvent[]): Promise<void> {
  try {
    await set(SPRINTER_EVENTS_KEY, events);
  } catch {
    // noop
  }
}

export async function resetSprinterData(): Promise<void> {
  try {
    await del(SPRINTER_TASKS_KEY);
    await del(SPRINTER_EVENTS_KEY);
  } catch {
    // noop
  }
}
```

### Paso 5: Crear Componente de Timeline Interactivo

**Archivo**: `src/app/(dashboard)/sprinter/components/InteractiveTimeline.tsx`

```tsx
"use client";

import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, ArrowRight, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSprinterStore } from "../store/sprinter-store";
import { loadSprinterEvents, saveSprinterEvents } from "@/lib/sprinter-persist";
import type { TaskEvent } from "@/types/sprinter";

// Componente Timeline (adaptar desde shadcn-timeline)
// Estructura básica para referencia
interface TimelineItemProps {
  event: TaskEvent;
  isLast: boolean;
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  const getIcon = () => {
    switch (event.eventType) {
      case "created":
        return <Plus className="h-4 w-4" />;
      case "moved":
        return <ArrowRight className="h-4 w-4" />;
      case "updated":
        return <Edit className="h-4 w-4" />;
      case "deleted":
        return <Trash2 className="h-4 w-4" />;
      case "status-changed":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = () => {
    switch (event.eventType) {
      case "created":
        return "bg-green-500";
      case "moved":
        return "bg-blue-500";
      case "updated":
        return "bg-yellow-500";
      case "deleted":
        return "bg-red-500";
      case "status-changed":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventDescription = () => {
    switch (event.eventType) {
      case "created":
        return `Tarea creada en ${event.details?.to?.toUpperCase()}`;
      case "moved":
        return `Movida de ${event.details?.from?.toUpperCase()} → ${event.details?.to?.toUpperCase()}`;
      case "updated":
        return `Campo "${event.details?.field}" actualizado`;
      case "deleted":
        return `Tarea eliminada de ${event.details?.from?.toUpperCase()}`;
      default:
        return "Cambio registrado";
    }
  };

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Línea vertical */}
      {!isLast && (
        <div className="absolute left-5 top-5 h-full w-[2px] bg-border" />
      )}

      {/* Icono */}
      <div
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${getEventColor()} text-white`}
      >
        {getIcon()}
      </div>

      {/* Contenido */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-medium">
                {event.taskTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getEventDescription()}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {format(event.timestamp, "PPp", { locale: es })}
            </Badge>
          </div>
        </CardHeader>

        {event.details && (
          <CardContent className="pb-3 pt-0">
            <div className="text-xs text-muted-foreground space-y-1">
              {event.details.field && (
                <div>
                  <span className="font-medium">Campo:</span>{" "}
                  {event.details.field}
                </div>
              )}
              {event.details.oldValue && (
                <div>
                  <span className="font-medium">Valor anterior:</span>{" "}
                  {event.details.oldValue}
                </div>
              )}
              {event.details.newValue && (
                <div>
                  <span className="font-medium">Nuevo valor:</span>{" "}
                  {event.details.newValue}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export function InteractiveTimeline() {
  const events = useSprinterStore((s) => s.getAllEvents());

  useEffect(() => {
    // Cargar eventos al montar
    (async () => {
      const stored = await loadSprinterEvents();
      if (stored) {
        useSprinterStore.setState({ events: stored });
      }
    })();
  }, []);

  useEffect(() => {
    // Guardar eventos cuando cambien
    if (events.length > 0) {
      saveSprinterEvents(events);
    }
  }, [events]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, TaskEvent[]> = {};
    events.forEach((event) => {
      const dateKey = format(event.timestamp, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return groups;
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No hay eventos registrados</p>
        <p className="text-sm text-muted-foreground">
          Crea, mueve o modifica tareas para ver su historial aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Historial de Cambios</h2>
          <p className="text-sm text-muted-foreground">
            {events.length} evento{events.length !== 1 ? "s" : ""} registrado
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedEvents)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                {format(new Date(dateKey), "PPPP", { locale: es })}
              </h3>
              <div className="space-y-4">
                {dayEvents.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={index === dayEvents.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

### Paso 6: Actualizar la Vista de Timeline en SprinterTabs

**Archivo**: `src/app/(dashboard)/sprinter/components/Timeline.tsx`

**Reemplazar el contenido actual** con:

```tsx
"use client";

import { InteractiveTimeline } from "./InteractiveTimeline";

export function Timeline() {
  return <InteractiveTimeline />;
}
```

O mejor aún, eliminar `Timeline.tsx` y actualizar `SprinterTabs.tsx` para importar directamente `InteractiveTimeline`.

**Archivo**: `src/app/(dashboard)/sprinter/SprinterTabs.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Board = dynamic(() => import("./components/Board").then((m) => m.Board), {
  ssr: false,
});

const InteractiveTimeline = dynamic(
  () =>
    import("./components/InteractiveTimeline").then(
      (m) => m.InteractiveTimeline
    ),
  { ssr: false }
);

export function SprinterTabs() {
  return (
    <Tabs defaultValue="board" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="board" className="gap-2">
          Tablero
        </TabsTrigger>
        <TabsTrigger value="timeline" className="gap-2">
          Historial
        </TabsTrigger>
      </TabsList>

      <TabsContent value="board" className="mt-0">
        <Board />
      </TabsContent>

      <TabsContent value="timeline" className="mt-0">
        <InteractiveTimeline />
      </TabsContent>
    </Tabs>
  );
}
```

---

## TAREA 3: Características Interactivas y Dinámicas del Timeline

### Funcionalidades Adicionales a Implementar

#### 1. Filtrado de Eventos

Agregar controles para filtrar por tipo de evento:

```tsx
// En InteractiveTimeline.tsx
const [filter, setFilter] = useState<TaskEventType | "all">("all");

const filteredEvents = useMemo(() => {
  if (filter === "all") return events;
  return events.filter((e) => e.eventType === filter);
}, [events, filter]);

// UI de filtros
<div className="flex gap-2 mb-4">
  <Button
    variant={filter === "all" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("all")}
  >
    Todos
  </Button>
  <Button
    variant={filter === "created" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("created")}
  >
    Creados
  </Button>
  <Button
    variant={filter === "moved" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("moved")}
  >
    Movidos
  </Button>
  {/* ... más filtros ... */}
</div>;
```

#### 2. Búsqueda de Tareas

Agregar input de búsqueda por título de tarea:

```tsx
const [searchQuery, setSearchQuery] = useState("");

const searchedEvents = useMemo(() => {
  if (!searchQuery) return filteredEvents;
  return filteredEvents.filter((e) =>
    e.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [filteredEvents, searchQuery]);

// UI
<Input
  placeholder="Buscar por tarea..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="max-w-sm"
/>;
```

#### 3. Expandir/Colapsar Detalles

Hacer que cada evento sea expandible para ver más detalles:

```tsx
const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

const toggleExpand = (eventId: string) => {
  setExpandedEvents((prev) => {
    const next = new Set(prev);
    if (next.has(eventId)) {
      next.delete(eventId);
    } else {
      next.add(eventId);
    }
    return next;
  });
};

// En TimelineItem
<CardContent className="cursor-pointer" onClick={() => toggleExpand(event.id)}>
  {expandedEvents.has(event.id) && (
    <div className="mt-2 space-y-1">{/* Detalles expandidos */}</div>
  )}
</CardContent>;
```

#### 4. Animaciones

Agregar animaciones con Framer Motion (opcional):

```bash
pnpm add framer-motion
```

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
>
  <TimelineItem ... />
</motion.div>
```

---

## Validación y Testing

### Checklist de Funcionalidad

**Corrección de Duplicación**:

- [ ] Las tareas no se duplican al mover entre columnas
- [ ] Las posiciones se actualizan correctamente
- [ ] La persistencia guarda el estado correcto

**Timeline Interactivo**:

- [ ] Se registran eventos al crear tareas
- [ ] Se registran eventos al mover tareas
- [ ] Se registran eventos al actualizar tareas
- [ ] Se registran eventos al eliminar tareas
- [ ] Los eventos se persisten en IndexedDB
- [ ] Los eventos se muestran en orden cronológico inverso
- [ ] Los eventos se agrupan por día
- [ ] Los iconos y colores son apropiados para cada tipo de evento
- [ ] El timeline es responsive (móvil, tablet, desktop)

**Interactividad**:

- [ ] Filtrado por tipo de evento funciona
- [ ] Búsqueda por tarea funciona
- [ ] Expandir/colapsar detalles funciona (si implementado)
- [ ] Animaciones son suaves (si implementado)

### Comandos de Validación

```bash
# Verificar tipos
pnpm typecheck

# Verificar linting
pnpm lint

# Probar en desarrollo
pnpm dev
```

### Escenarios de Prueba

1. **Crear tarea** → Verificar evento "created" en timeline
2. **Mover tarea** de TO-DO a EN DESARROLLO → Verificar evento "moved"
3. **Actualizar título** de tarea → Verificar evento "updated"
4. **Eliminar tarea** → Verificar evento "deleted"
5. **Refrescar página** → Verificar que eventos persisten
6. **Filtrar por "moved"** → Solo ver movimientos
7. **Buscar tarea** → Filtrar eventos por título

---

## Consideraciones de Diseño

### Principios a Seguir

1. **Consistencia**: Usar componentes shadcn/ui existentes
2. **No hard-coded colors**: Usar CSS variables (`bg-background`, `text-foreground`, etc.)
3. **Accesibilidad**: aria-labels, navegación por teclado, focus visible
4. **Responsive**: Mobile-first, funcional en todas las pantallas
5. **Performance**: Memoización con useMemo, virtualización si >100 eventos

### Estilo Visual

- **Timeline vertical** con línea conectora
- **Iconos** visuales para cada tipo de evento
- **Colores** semánticos pero usando variables CSS
- **Agrupación** por día para mejor organización
- **Badges** para timestamps relativos ("hace 5 minutos")

---

## Resultado Esperado

### Antes:

- ✗ Tareas duplicadas al mover entre columnas
- ✗ Timeline estático tipo tabla
- ✗ Sin historial de cambios

### Después:

- ✓ Movimiento atómico de tareas sin duplicación
- ✓ Timeline interactivo con eventos visuales
- ✓ Historial completo de cambios y movimientos
- ✓ Filtrado y búsqueda de eventos
- ✓ Persistencia completa de eventos
- ✓ UX dinámica y profesional

---

## Referencias

- **Proyecto**: `AGENTS.md` - Convenciones y stack
- **Código**: `.cursorrules` - Guías de desarrollo
- **shadcn-timeline**: https://shadcn-timeline.vercel.app/
- **GitHub**: https://github.com/timDeHof/shadcn-timeline
- **Componentes**: `src/components/ui/` - shadcn/ui
- **Store**: `src/app/(dashboard)/sprinter/store/sprinter-store.ts`
- **Tipos**: `src/types/sprinter.ts`

---

**¡Importante!**: Seguir estrictamente las convenciones del proyecto. Usar Server Components donde sea posible, Client Components solo cuando sea necesario (`"use client"`). No introducir nuevas dependencias sin justificación. Mantener el código DRY, legible y bien tipado.

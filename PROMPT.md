# PROMPT: Implementación de Sprinter - Sistema de Gestión de Proyectos

## Objetivo Principal

Crear un sistema completo de gestión de proyectos tipo Kanban board (similar a ClickUp/Asana) con capacidades de drag-and-drop y vista de timeline, integrado en la aplicación Next.js 15 existente.

## PASO 1: Documentación y Verificación de Fuentes

### Instrucciones Críticas

1. **ANTES DE PROCEDER**, debes estudiar y documentarte sobre react-beautiful-dnd:

   - Repositorio oficial: https://github.com/atlassian/react-beautiful-dnd
   - Storybook interactivo: https://react-beautiful-dnd.netlify.app/?path=/story/single-vertical-list--basic

2. **VERIFICACIÓN OBLIGATORIA**:

   - Si NO puedes acceder o leer cualquiera de las fuentes anteriores
   - DETÉN la operación inmediatamente
   - NOTIFICA al usuario con mensaje claro: "⚠️ No se puede acceder a las fuentes de documentación requeridas. Por favor verifica la conectividad o proporciona documentación alternativa."
   - NO continúes con la implementación

3. **NOTA IMPORTANTE**: react-beautiful-dnd está archivado. Como alternativa moderna, considera usar:
   - @dnd-kit/core (recomendado para proyectos nuevos)
   - @hello-pangea/dnd (fork mantenido de react-beautiful-dnd)
   - Documenta tu elección y justificación al usuario

## PASO 2: Creación de la Ruta /sprinter

### Ubicación y Estructura

```
src/app/(dashboard)/sprinter/
├── page.tsx              # Página principal con sistema de tabs
├── components/
│   ├── Board.tsx         # Componente del tablero Kanban
│   ├── Column.tsx        # Columna individual (TO-DO, etc.)
│   ├── TaskCard.tsx      # Tarjeta de tarea con drag-and-drop
│   ├── TaskForm.tsx      # Formulario para crear tareas
│   ├── Timeline.tsx      # Vista de línea de tiempo horizontal
│   └── TimelineTask.tsx  # Tarea en la vista de timeline
└── store/
    └── sprinter-store.ts # Zustand store para gestión de estado
```

## PASO 3: Especificaciones del Sistema Sprinter

### 3.1 Persistencia de Datos

**CRÍTICO**: El sistema DEBE persistir datos durante la sesión usando el mismo patrón que el flowchart existente:

```typescript
// Usar idb-keyval para IndexedDB (ver src/lib/persist.ts como referencia)
import { del, get, set } from "idb-keyval";

const SPRINTER_STORAGE_KEY = "syngulr-sprinter-tasks";

// Implementar funciones similares a:
// - loadSprinterData()
// - saveSprinterData()
// - resetSprinterData()
```

### 3.2 Gestión de Estado con Zustand

Crear un store similar a `src/lib/store.ts` pero adaptado para tareas:

```typescript
interface Task {
  id: string;
  title: string;
  type: TaskType;
  description?: string;
  column: ColumnId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  status: "todo" | "in-progress" | "testing" | "completed";
}

type TaskType =
  | "componente"
  | "pagina"
  | "widget"
  | "estilos"
  | "diseno"
  | "api"
  | "configuracion"
  | "documentacion";

type ColumnId = "todo" | "in-progress" | "testing" | "completed";

interface SprinterStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetColumn: ColumnId, position: number) => void;
  reorderTaskInColumn: (taskId: string, newPosition: number) => void;
  // Undo/Redo functionality similar to flow store
  undo: () => void;
  redo: () => void;
}
```

## PASO 4: Las Cuatro Columnas del Tablero

### Configuración de Columnas

```typescript
const COLUMNS = [
  {
    id: "todo" as const,
    title: "TO-DO",
    description: "Tareas pendientes por iniciar",
    color: "bg-slate-100 dark:bg-slate-900",
    allowCreate: true, // Solo esta columna permite creación directa
  },
  {
    id: "in-progress" as const,
    title: "EN DESARROLLO",
    description: "Tareas en progreso",
    color: "bg-blue-50 dark:bg-blue-950",
    allowCreate: false,
  },
  {
    id: "testing" as const,
    title: "PROBANDO",
    description: "En proceso de testing/QA",
    color: "bg-yellow-50 dark:bg-yellow-950",
    allowCreate: false,
  },
  {
    id: "completed" as const,
    title: "COMPLETADO",
    description: "Tareas finalizadas",
    color: "bg-green-50 dark:bg-green-950",
    allowCreate: false,
  },
] as const;
```

### Estilo Minimalista

- Usar shadcn/ui Card components
- Espaciado consistente: gap-4 entre columnas, gap-2 entre tareas
- Tipografía: column titles text-lg font-medium, task titles text-sm
- Colores: usar CSS variables de shadcn (no hex hard-coded)

## PASO 5: Especificaciones de las Tareas

### 5.1 Creación de Tareas (Solo en TO-DO)

```typescript
// TaskForm.tsx - Solo visible en columna TO-DO
interface TaskFormProps {
  onSubmit: (task: NewTask) => void;
}

interface NewTask {
  title: string; // Input text, required
  type: TaskType; // Select dropdown, required
  description?: string; // Textarea, optional
}
```

### 5.2 Componente TaskCard

```tsx
<Card className="group relative">
  <CardHeader className="p-3">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-sm font-medium truncate">
          {task.title}
        </CardTitle>
        <Badge variant="outline" className="mt-1 text-xs">
          {task.type}
        </Badge>
      </div>

      {/* Botón eliminar - visible en hover */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => deleteTask(task.id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  </CardHeader>

  {task.description && (
    <CardContent className="p-3 pt-0">
      <p className="text-xs text-muted-foreground line-clamp-2">
        {task.description}
      </p>
    </CardContent>
  )}
</Card>
```

## PASO 6: Drag and Drop entre Columnas y Filas

### Implementación con DnD Library

```typescript
// Usar DragDropContext, Droppable, Draggable
<DragDropContext onDragEnd={handleDragEnd}>
  <div className="grid grid-cols-4 gap-4">
    {COLUMNS.map((column) => (
      <Droppable key={column.id} droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "rounded-lg border p-4 min-h-[500px]",
              column.color,
              snapshot.isDraggingOver && "ring-2 ring-primary"
            )}
          >
            <h3 className="text-lg font-medium mb-4">{column.title}</h3>

            {/* Formulario solo en TO-DO */}
            {column.allowCreate && <TaskForm onSubmit={addTask} />}

            {/* Lista de tareas */}
            <div className="space-y-2">
              {getTasksForColumn(column.id).map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "opacity-50" : ""}
                    >
                      <TaskCard task={task} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    ))}
  </div>
</DragDropContext>
```

### Lógica de handleDragEnd

```typescript
const handleDragEnd = (result: DropResult) => {
  const { destination, source, draggableId } = result;

  if (!destination) return;

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return; // No movement
  }

  // Mover entre columnas
  if (destination.droppableId !== source.droppableId) {
    moveTask(
      draggableId,
      destination.droppableId as ColumnId,
      destination.index
    );
  } else {
    // Reordenar dentro de la misma columna
    reorderTaskInColumn(draggableId, destination.index);
  }
};
```

## PASO 7: Eliminación de Tareas

### Icon Button para Eliminar

- Usar Trash2 icon de lucide-react
- Visible solo en hover de la tarjeta
- Confirmar eliminación con diálogo (opcional pero recomendado)

```tsx
// Opcional: Diálogo de confirmación
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon">
      <Trash2 className="h-3 w-3" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => deleteTask(task.id)}>
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## PASO 8: Sistema de Tabs (Tablero y Línea de Tiempo)

### Implementación de Tabs

```tsx
// page.tsx principal
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SprinterPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Sprinter
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tus tareas y proyectos de forma visual
        </p>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="board" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Tablero
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Línea de Tiempo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-0">
          <Board />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <Timeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## PASO 9: Línea de Tiempo Horizontal

### Especificaciones de la Timeline

```typescript
// Timeline.tsx
interface TimelineProps {
  tasks: Task[];
  viewMode: "day" | "week" | "month"; // Selector de granularidad
  startDate: Date;
  endDate: Date;
}
```

### Componente Timeline

```tsx
<div className="space-y-6">
  {/* Controles de vista */}
  <div className="flex items-center justify-between">
    <div className="flex gap-2">
      <Button
        variant={viewMode === "day" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("day")}
      >
        Día
      </Button>
      <Button
        variant={viewMode === "week" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("week")}
      >
        Semana
      </Button>
      <Button
        variant={viewMode === "month" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("month")}
      >
        Mes
      </Button>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={previousPeriod}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={nextPeriod}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>

  {/* Timeline Grid */}
  <div className="relative overflow-x-auto">
    {/* Header con fechas */}
    <div className="flex border-b">
      {timelineSegments.map((segment) => (
        <div
          key={segment.date.toISOString()}
          className="min-w-[100px] flex-1 p-2 text-center text-xs font-medium border-r"
        >
          {formatDate(segment.date, viewMode)}
        </div>
      ))}
    </div>

    {/* Filas de tareas */}
    <div className="space-y-1">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center h-12 border-b">
          {/* Nombre de tarea */}
          <div className="min-w-[200px] p-2 text-sm font-medium truncate border-r">
            {task.title}
            <Badge variant="outline" className="ml-2 text-xs">
              {getStatusBadge(task.status)}
            </Badge>
          </div>

          {/* Barra de progreso en la timeline */}
          <div className="flex-1 relative">
            <TimelineTaskBar
              task={task}
              startDate={timelineStart}
              endDate={timelineEnd}
              viewMode={viewMode}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### TimelineTaskBar Component

```tsx
// Calcula posición y ancho basado en fechas
const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({
  task,
  startDate,
  endDate,
  viewMode,
}) => {
  const { left, width } = calculatePosition(
    task.startDate,
    task.endDate,
    startDate,
    endDate
  );

  const statusColors = {
    todo: "bg-slate-400",
    "in-progress": "bg-blue-500",
    testing: "bg-yellow-500",
    completed: "bg-green-500",
  };

  return (
    <div
      className={cn(
        "absolute h-6 rounded-md cursor-pointer transition-all hover:opacity-80",
        statusColors[task.status]
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      title={`${task.title} - ${task.status}`}
    >
      <div className="px-2 py-1 text-xs text-white truncate">{task.title}</div>
    </div>
  );
};
```

### Información Mostrada en Timeline

- **Nombre de la tarea**: truncado si es muy largo
- **Fechas de ejecución**: startDate y endDate (si están definidas)
- **Estado actual**: representado por color de la barra
  - TO-DO: gris (slate)
  - EN DESARROLLO: azul (blue)
  - PROBANDO: amarillo (yellow)
  - COMPLETADO: verde (green)
- **Tipo de tarea**: mostrado en badge junto al nombre

## Requerimientos Técnicos

### Dependencias a Instalar

```bash
# Si usas @hello-pangea/dnd (fork mantenido)
pnpm add @hello-pangea/dnd

# O si usas @dnd-kit (recomendado moderno)
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Para persistencia (ya instalado)
# idb-keyval

# Para gestión de estado (ya instalado)
# zustand

# Para validación
pnpm add zod

# Para manejo de fechas
pnpm add date-fns
```

### TypeScript Types

```typescript
// src/types/sprinter.ts
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

export type Task = z.infer<typeof taskSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type ColumnId = z.infer<typeof columnIdSchema>;
```

## Principios de Diseño y UX

### Minimalismo y Elegancia

1. **Espaciado consistente**: Usar escala 2,3,4,6,8,10,12
2. **Tipografía clara**:
   - Títulos de página: text-2xl md:text-3xl font-semibold
   - Títulos de sección: text-lg font-medium
   - Cuerpo: text-sm md:text-base
3. **Colores**: Solo CSS variables de shadcn, NO hex hard-coded
4. **Feedback visual**:
   - Hover states en todos los elementos interactivos
   - Drag preview con opacidad reducida
   - Drop zones destacados durante drag
5. **Responsive**: Mobile-first, funcional en todas las pantallas

### Accesibilidad

- Todos los botones con aria-label apropiado
- Navegación por teclado en formularios
- Focus visible en todos los elementos interactivos
- Screen reader friendly

### Performance

- Usar React.memo en TaskCard para evitar re-renders innecesarios
- Virtualización si hay >100 tareas (react-window)
- Debounce en auto-save (300ms)
- Optimistic UI updates

## Testing y Validación

### Casos de Prueba Esenciales

1. ✅ Crear tarea en TO-DO con todos los campos
2. ✅ Mover tarea entre columnas con drag-and-drop
3. ✅ Reordenar tareas dentro de la misma columna
4. ✅ Eliminar tarea con confirmación
5. ✅ Persistencia: refrescar página y verificar datos
6. ✅ Cambiar entre tabs Tablero/Timeline
7. ✅ Timeline muestra tareas con fechas correctamente
8. ✅ Cambiar vista de timeline (día/semana/mes)
9. ✅ Navegación temporal en timeline (anterior/siguiente)
10. ✅ Responsive en móvil y tablet

## Entregables

### Archivos a Crear

1. `src/app/(dashboard)/sprinter/page.tsx` - Página principal con tabs
2. `src/app/(dashboard)/sprinter/components/Board.tsx` - Tablero Kanban
3. `src/app/(dashboard)/sprinter/components/Column.tsx` - Columna individual
4. `src/app/(dashboard)/sprinter/components/TaskCard.tsx` - Tarjeta de tarea
5. `src/app/(dashboard)/sprinter/components/TaskForm.tsx` - Formulario de creación
6. `src/app/(dashboard)/sprinter/components/Timeline.tsx` - Vista de timeline
7. `src/app/(dashboard)/sprinter/components/TimelineTaskBar.tsx` - Barra de tarea en timeline
8. `src/app/(dashboard)/sprinter/store/sprinter-store.ts` - Zustand store
9. `src/lib/sprinter-persist.ts` - Funciones de persistencia
10. `src/types/sprinter.ts` - TypeScript types y schemas

### Documentación Adicional

- Comentarios JSDoc en funciones complejas
- README.md en la carpeta sprinter explicando arquitectura
- Ejemplos de uso del store
- Guía de estilos aplicados

## Checklist Final

Antes de considerar la tarea completa, verifica:

- [ ] react-beautiful-dnd (o alternativa) documentado y comprendido
- [ ] Ruta /sprinter creada y accesible desde navegación
- [ ] Las 4 columnas funcionan correctamente
- [ ] Creación de tareas solo en TO-DO
- [ ] Drag-and-drop funcional entre columnas y dentro de columnas
- [ ] Eliminación de tareas con botón de icono
- [ ] Sistema de tabs implementado (Tablero y Línea de Tiempo)
- [ ] Timeline horizontal con fechas, estados y tipos visibles
- [ ] Persistencia de datos funcionando con IndexedDB
- [ ] Estado global con Zustand funcionando
- [ ] Diseño minimalista usando shadcn/ui
- [ ] Responsive en móvil, tablet y desktop
- [ ] TypeScript sin errores
- [ ] Accesibilidad básica implementada
- [ ] Performance optimizada (memo, debounce)

## Notas Adicionales

### Integración con Navegación

Actualizar `src/components/sidebar/MainNav.tsx` para incluir enlace a Sprinter:

```tsx
const navItems = [
  // ... items existentes
  {
    title: "Sprinter",
    href: "/sprinter",
    icon: KanbanSquare, // de lucide-react
    description: "Gestiona tus proyectos",
  },
];
```

### Metadata de la Página

```typescript
export const metadata: Metadata = {
  title: "Sprinter - Gestión de Proyectos",
  description:
    "Sistema de gestión de tareas con tablero Kanban y línea de tiempo",
};
```

---

## Conclusión

Este prompt debe ser ejecutado secuencialmente, validando cada paso antes de continuar al siguiente. La implementación debe ser incremental, probando cada componente de forma aislada antes de integrarlo al sistema completo.

**RECORDATORIO FINAL**: Si en cualquier momento no puedes acceder a la documentación requerida o encuentras limitaciones técnicas, DETÉN la implementación y notifica al usuario inmediatamente.

¡Éxito con la implementación! 🚀

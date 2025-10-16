"use client";

import { useEffect } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { useSprinterStore } from "../store/sprinter-store";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { COLUMNS } from "./constants";
import { loadSprinterData } from "@/lib/sprinter-persist";

export function Board() {
  const tasks = useSprinterStore((s) => s.tasks);
  const moveTask = useSprinterStore((s) => s.moveTask);
  const reorderTaskInColumn = useSprinterStore((s) => s.reorderTaskInColumn);
  const importTasks = useSprinterStore((s) => s.importTasks);

  useEffect(() => {
    (async () => {
      const stored = await loadSprinterData();
      if (stored) importTasks(stored);
    })();
  }, [importTasks]);

  const getTasksForColumn = (id: (typeof COLUMNS)[number]["id"]) =>
    tasks
      .filter((t) => t.column === id)
      .sort((a, b) => a.position - b.position);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (destination.droppableId !== source.droppableId) {
      moveTask(
        draggableId,
        destination.droppableId as (typeof COLUMNS)[number]["id"],
        destination.index
      );
    } else {
      reorderTaskInColumn(draggableId, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "min-h-[500px] rounded-lg border p-4",
                  column.color,
                  snapshot.isDraggingOver && "ring-2 ring-primary"
                )}
              >
                <h3 className="mb-4 text-lg font-medium">{column.title}</h3>

                {column.allowCreate && <TaskForm />}

                <div className="space-y-2">
                  {getTasksForColumn(column.id).map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
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
  );
}

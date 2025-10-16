"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { saveSprinterData } from "@/lib/sprinter-persist";
import type { ColumnId, Task, TaskType, TaskEvent } from "@/types/sprinter";

type History = { past: Task[][]; future: Task[][] };

interface SprinterStore {
  tasks: Task[];
  events: TaskEvent[];
  history: History;
  addTask: (payload: {
    title: string;
    type: TaskType;
    description?: string;
  }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetColumn: ColumnId, position: number) => void;
  reorderTaskInColumn: (taskId: string, newPosition: number) => void;
  undo: () => void;
  redo: () => void;
  importTasks: (tasks: Task[]) => void;
  exportTasks: () => Task[];
  addEvent: (event: Omit<TaskEvent, "id" | "timestamp">) => void;
  getEventsForTask: (taskId: string) => TaskEvent[];
  getAllEvents: () => TaskEvent[];
}

const pushHistory = (history: History, snapshot: Task[]): History => ({
  past: [...history.past, snapshot].slice(-50),
  future: [],
});

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export const useSprinterStore = create<SprinterStore>((set, get) => ({
  tasks: [],
  events: [],
  history: { past: [], future: [] },

  addEvent: (event) => {
    const newEvent: TaskEvent = {
      ...event,
      id: nanoid(),
      timestamp: new Date(),
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

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
      queueSave(next);
      const createdEvent: TaskEvent = {
        id: nanoid(),
        taskId,
        taskTitle: title,
        eventType: "created",
        timestamp: now,
        details: { to: "todo" },
      };
      return {
        tasks: next,
        events: [...state.events, createdEvent],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  updateTask: (id, updates) =>
    set((state) => {
      const next = state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      );
      queueSave(next);
      const task = state.tasks.find((t) => t.id === id);
      const eventsToAdd: TaskEvent[] = [];
      if (task) {
        Object.keys(updates).forEach((field) => {
          if (field !== "updatedAt") {
            eventsToAdd.push({
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
      }
      return {
        tasks: next,
        events: [...state.events, ...eventsToAdd],
        history: pushHistory(state.history, state.tasks),
      };
    }),

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
      queueSave(next);
      const event: TaskEvent = {
        id: nanoid(),
        taskId: id,
        taskTitle: deleted.title,
        eventType: "deleted",
        timestamp: new Date(),
        details: { from: deleted.column },
      };
      return {
        tasks: next,
        events: [...state.events, event],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  moveTask: (taskId, targetColumn, position) =>
    set((state) => {
      const taskToMove = state.tasks.find((t) => t.id === taskId);
      if (!taskToMove) return state;
      if (taskToMove.column === targetColumn) return state;

      // 1) Remove the task from the list entirely
      const withoutMovedTask = state.tasks.filter((t) => t.id !== taskId);

      // 2) Close the gap in the source column
      const normalizedSource = withoutMovedTask.map((t) =>
        t.column === taskToMove.column && t.position > taskToMove.position
          ? { ...t, position: t.position - 1 }
          : t
      );

      // 3) Make space in destination column
      const withSpaceInDestination = normalizedSource.map((t) =>
        t.column === targetColumn && t.position >= position
          ? { ...t, position: t.position + 1 }
          : t
      );

      // 4) Insert moved task into destination
      const movedTask: Task = {
        ...taskToMove,
        column: targetColumn,
        status: targetColumn,
        position,
        updatedAt: new Date(),
      };

      const nextTasks = [...withSpaceInDestination, movedTask];
      const normalized = normalizePositions(nextTasks);

      const event: TaskEvent = {
        id: nanoid(),
        taskId,
        taskTitle: taskToMove.title,
        eventType: "moved",
        timestamp: new Date(),
        details: { from: taskToMove.column, to: targetColumn },
      };

      queueSave(normalized);
      return {
        tasks: normalized,
        events: [...state.events, event],
        history: pushHistory(state.history, state.tasks),
      };
    }),

  reorderTaskInColumn: (taskId, newPosition) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const sameCol = state.tasks.filter((t) => t.column === task.column);
      const maxIndex = sameCol.length - 1;
      const to = Math.max(0, Math.min(newPosition, maxIndex));

      const moved = sameCol
        .filter((t) => t.id !== taskId)
        .sort((a, b) => a.position - b.position);
      moved.splice(to, 0, { ...task, position: to });

      const relabeled = moved.map((t, i) =>
        t.id === taskId
          ? { ...t, position: i, updatedAt: new Date() }
          : { ...t, position: i }
      );

      const next = [
        ...state.tasks.filter((t) => t.column !== task.column),
        ...relabeled,
      ];
      queueSave(next);
      return { tasks: next, history: pushHistory(state.history, state.tasks) };
    }),

  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state;
      const past = [...state.history.past];
      const prev = past.pop()!;
      const future = [state.tasks, ...state.history.future].slice(0, 50);
      queueSave(prev);
      return { tasks: prev, history: { past, future } };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state;
      const [next, ...future] = state.history.future;
      const past = [...state.history.past, state.tasks].slice(-50);
      queueSave(next);
      return { tasks: next, history: { past, future } };
    }),

  importTasks: (tasks) =>
    set(() => {
      queueSave(tasks);
      return { tasks, history: { past: [], future: [] } };
    }),

  exportTasks: () => get().tasks,
  getEventsForTask: (taskId) => get().events.filter((e) => e.taskId === taskId),
  getAllEvents: () =>
    [...get().events].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    ),
}));

function normalizePositions(tasks: Task[]): Task[] {
  const byCol: Record<string, Task[]> = {};
  for (const t of tasks) {
    byCol[t.column] ??= [];
    byCol[t.column].push(t);
  }
  const out: Task[] = [];
  for (const col of Object.keys(byCol)) {
    byCol[col]
      .sort((a, b) => a.position - b.position)
      .forEach((t, i) => out.push({ ...t, position: i }));
  }
  return out;
}

function queueSave(tasks: Task[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveSprinterData(tasks), 300);
}

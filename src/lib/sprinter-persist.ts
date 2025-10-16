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

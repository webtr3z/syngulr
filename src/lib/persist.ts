import { del, get, set } from "idb-keyval";

import { documentSchema, type FlowDocument } from "@/lib/schema";

const STORAGE_KEY = "acme-next-flow-document";

function isBrowser() {
  return typeof window !== "undefined";
}

export async function loadDiagram(): Promise<FlowDocument | null> {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = await get(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    return documentSchema.parse(stored);
  } catch (error) {
    console.error("Failed to load diagram", error);
    return null;
  }
}

export async function saveDiagram(document: FlowDocument): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  try {
    await set(STORAGE_KEY, document);
  } catch (error) {
    console.error("Failed to save diagram", error);
  }
}

export async function resetDiagram(): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  try {
    await del(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset diagram", error);
  }
}

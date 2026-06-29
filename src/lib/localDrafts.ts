import type { SavedDraft } from "./types";

const STORAGE_KEY = "pingpilot_drafts";

export function getDrafts(): SavedDraft[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SavedDraft[];
  } catch {
    return [];
  }
}

export function saveDraft(draft: SavedDraft) {
  const drafts = getDrafts();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([draft, ...drafts]));
}

export function deleteDraft(id: string) {
  const drafts = getDrafts().filter((draft) => draft.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

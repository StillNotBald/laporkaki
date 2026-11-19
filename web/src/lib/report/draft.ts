/**
 * draft.ts — transient report handoff between /report and /report/confirm.
 * CONTRACT §4: sessionStorage key "laporkaki.draft"; never a saved ticket.
 */
import type { Draft } from "@/lib/store/types";

const KEY = "laporkaki.draft";

function isCoords(value: unknown): value is { lat: number; lng: number } {
  if (typeof value !== "object" || value === null) return false;
  const { lat, lng } = value as { lat?: unknown; lng?: unknown };
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
}

/** Save the transient draft. Storage failures are silent: the form still works. */
export function saveDraft(d: Draft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // Quota or privacy mode: the draft is best-effort, never a hard failure.
  }
}

/** Read the draft once. Returns null when absent or unreadable. */
export function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const r = parsed as Record<string, unknown>;
  const draft: Draft = {};
  if (typeof r.photo === "string" && r.photo !== "") draft.photo = r.photo;
  if (typeof r.note === "string" && r.note !== "") draft.note = r.note;
  if (typeof r.place === "string" && r.place !== "") draft.place = r.place;
  if (isCoords(r.coords)) draft.coords = r.coords;
  if (typeof r.agencyId === "string" && r.agencyId !== "") {
    draft.agencyId = r.agencyId;
  }
  return Object.keys(draft).length > 0 ? draft : null;
}

/** Discard the draft on send or cancel. */
export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}
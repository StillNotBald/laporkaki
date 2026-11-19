// Ticket store (CONTRACT §3). Client-only, no deps, never throws to the UI.
//
// Seeds (content/seed-tickets.ts) are the base dataset. localStorage holds
// new tickets plus patches (status/agency/fixedAt) to any ticket; the two
// are merged on every read. On QuotaExceededError we retry without photos
// and keep the ticket. If storage is unavailable entirely, an in-memory
// copy keeps the session working. Mutations fire a CustomEvent, and other
// tabs are heard via the window storage event (see subscribe).

import { AGENCIES, agencyById } from "@/content/agencies";
import { SEED_TICKETS } from "@/content/seed-tickets";
import type { AgencyStats, Ticket, TicketStatus } from "@/lib/store/types";

const STORE_KEY = "laporkaki.tickets.v1";
const PLEDGE_KEY = "laporkaki.pledges.v1";
const VOLUNTEER_KEY = "laporkaki.volunteer.v1";
const CHANGE_EVENT = "laporkaki:change";
const MAX_PLEDGE_RM = 1000;

type Patch = Partial<Pick<Ticket, "status" | "agencyId" | "fixedAt" | "updatedAt">>;

interface LocalData {
  added: Ticket[];
  patches: Record<string, Patch>;
}

// Session fallback when storage is missing or refuses every write.
let memory: LocalData = { added: [], patches: {} };
let memoryOnly = false;
let pledgeMemory = 0;
let volunteerMemory = false;

function storage(): Storage | null {
  try {
    const s = (globalThis as { localStorage?: Storage }).localStorage;
    if (s && typeof s.getItem === "function" && typeof s.setItem === "function") return s;
  } catch {
    // Access can throw (privacy mode, sandboxed frame). Fall back to memory.
  }
  return null;
}

function emptyData(): LocalData {
  return { added: [], patches: {} };
}

/** Tolerate malformed stored JSON: keep only well-formed entries. */
function normalize(raw: unknown): LocalData {
  const out = emptyData();
  if (!raw || typeof raw !== "object") return out;
  const data = raw as { added?: unknown; patches?: unknown };
  if (Array.isArray(data.added)) {
    out.added = data.added.filter(
      (t): t is Ticket =>
        !!t && typeof t === "object" && typeof (t as Ticket).id === "string" &&
        typeof (t as Ticket).createdAt === "string" && typeof (t as Ticket).status === "string",
    );
  }
  if (data.patches && typeof data.patches === "object" && !Array.isArray(data.patches)) {
    for (const [id, p] of Object.entries(data.patches as Record<string, unknown>)) {
      if (p && typeof p === "object") out.patches[id] = p as Patch;
    }
  }
  return out;
}

function readLocal(): LocalData {
  if (memoryOnly) return memory;
  const s = storage();
  if (!s) {
    memoryOnly = true;
    return memory;
  }
  try {
    const raw = s.getItem(STORE_KEY);
    memory = raw ? normalize(JSON.parse(raw)) : emptyData();
    return memory;
  } catch {
    memoryOnly = true;
    return memory;
  }
}

/** Persist; on quota, drop photos and retry once; keep the ticket either way. */
function writeLocal(next: LocalData): LocalData {
  memory = next;
  if (memoryOnly) return memory;
  const s = storage();
  if (!s) {
    memoryOnly = true;
    return memory;
  }
  try {
    s.setItem(STORE_KEY, JSON.stringify(next));
    return memory;
  } catch {
    // QuotaExceededError (or any storage failure): retry without photos.
    const slim: LocalData = {
      added: next.added.map((t) => {
        if (!t.photo) return t;
        const { photo: _photo, ...rest } = t;
        return rest;
      }),
      patches: next.patches,
    };
    try {
      s.setItem(STORE_KEY, JSON.stringify(slim));
      memory = slim;
    } catch {
      memoryOnly = true; // keep the session alive in memory
    }
    return memory;
  }
}

/** Seeds + local tickets + patches, newest first. */
function merged(): Ticket[] {
  const local = readLocal();
  const byId = new Map<string, Ticket>();
  for (const t of SEED_TICKETS) byId.set(t.id, t);
  for (const t of local.added) byId.set(t.id, t);
  for (const [id, patch] of Object.entries(local.patches)) {
    const base = byId.get(id);
    if (base) byId.set(id, { ...base, ...patch });
  }
  return [...byId.values()].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id),
  );
}

function notify(): void {
  try {
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    }
  } catch {
    // Never let a notification failure reach the UI.
  }
}

function newId(): string {
  return `LK-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// --- Public API (exact signatures from CONTRACT §3) -------------------------

export function listTickets(): Ticket[] {
  return merged();
}

export function getTicket(id: string): Ticket | undefined {
  return merged().find((t) => t.id === id);
}

export function addTicket(
  input: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt" | "fixedAt">,
): Ticket {
  const now = new Date().toISOString();
  const ticket: Ticket = { ...input, id: newId(), status: "sent", createdAt: now, updatedAt: now };
  const local = readLocal();
  const saved = writeLocal({ ...local, added: [...local.added, ticket] });
  notify();
  // Return what was actually kept (photo may have been dropped on quota).
  return saved.added.find((t) => t.id === ticket.id) ?? ticket;
}

// Lifecycle only moves forward: sent → in_progress → fixed (FLOW §3).
const NEXT_STATUS: Record<TicketStatus, TicketStatus | null> = {
  sent: "in_progress",
  in_progress: "fixed",
  fixed: null,
};

export function setStatus(id: string, status: TicketStatus): Ticket | undefined {
  const current = getTicket(id);
  if (!current) return undefined;
  if (current.status === status) return current; // idempotent, no mutation
  if (NEXT_STATUS[current.status] !== status) return undefined;
  const now = new Date().toISOString();
  const patch: Patch = { status, updatedAt: now };
  if (status === "fixed") patch.fixedAt = now;
  const local = readLocal();
  writeLocal({ ...local, patches: { ...local.patches, [id]: { ...local.patches[id], ...patch } } });
  notify();
  return getTicket(id);
}

export function setAgency(id: string, agencyId: string): Ticket | undefined {
  if (!agencyById(agencyId)) return undefined;
  const current = getTicket(id);
  // Fixed is the end of the demo lifecycle; corrections happen before it.
  if (!current || current.status === "fixed") return undefined;
  if (current.agencyId === agencyId) return current;
  const local = readLocal();
  const patch: Patch = { agencyId, updatedAt: new Date().toISOString() };
  writeLocal({ ...local, patches: { ...local.patches, [id]: { ...local.patches[id], ...patch } } });
  notify();
  return getTicket(id);
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return () => {};
  }
  const onChange = () => cb();
  const onStorage = (e: StorageEvent) => {
    // key === null means storage.clear() in another tab.
    if (!e.key || e.key.startsWith("laporkaki.")) cb();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const m = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(m * 10) / 10;
}

export function agencyStats(): AgencyStats[] {
  const tickets = merged();
  return AGENCIES.map((agency) => {
    const mine = tickets.filter((t) => t.agencyId === agency.id);
    const fixed = mine.filter((t) => t.status === "fixed" && t.fixedAt);
    const days = fixed.map(
      (t) => (Date.parse(t.fixedAt as string) - Date.parse(t.createdAt)) / 86_400_000,
    );
    return { agency, raised: mine.length, solved: fixed.length, medianDaysToFix: median(days) };
  });
}

// --- Pledges and volunteer interest (local demo metadata, not statuses) ----

function readNumber(key: string, fallback: number): number {
  if (memoryOnly) return fallback;
  const s = storage();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

function writeKey(key: string, value: string): void {
  if (memoryOnly) return;
  const s = storage();
  if (!s) return;
  try {
    s.setItem(key, value);
  } catch {
    // Non-critical metadata; the in-memory value still serves this session.
  }
}

export function addPledge(amountRm: number): { totalRm: number } {
  if (!Number.isFinite(amountRm) || amountRm <= 0) return { totalRm: pledgeTotalRm() };
  const amount = Math.min(amountRm, MAX_PLEDGE_RM); // cap per pledge
  pledgeMemory = pledgeTotalRm() + amount;
  writeKey(PLEDGE_KEY, String(pledgeMemory));
  notify();
  return { totalRm: pledgeMemory };
}

export function pledgeTotalRm(): number {
  const stored = readNumber(PLEDGE_KEY, pledgeMemory);
  pledgeMemory = stored;
  return stored;
}

export function setVolunteerInterest(on: boolean): boolean {
  volunteerMemory = on;
  writeKey(VOLUNTEER_KEY, on ? "1" : "0");
  notify();
  return on;
}

export function volunteerInterest(): boolean {
  if (memoryOnly) return volunteerMemory;
  const s = storage();
  if (!s) return volunteerMemory;
  try {
    const raw = s.getItem(VOLUNTEER_KEY);
    if (raw === null) return volunteerMemory;
    volunteerMemory = raw === "1";
    return volunteerMemory;
  } catch {
    return volunteerMemory;
  }
}
// Store tests (CONTRACT §3): fake localStorage, node environment.
// Each test gets a fresh module instance (module-level memory fallback)
// and a fresh fake storage via vi.stubGlobal.

import { afterEach, describe, expect, it, vi } from "vitest";
import { SEED_TICKETS, VOLUNTEER_TICKET_ID } from "@/content/seed-tickets";
import type { Ticket } from "@/lib/store/types";

type Store = typeof import("./tickets");

const STORE_KEY = "laporkaki.tickets.v1";

class FakeStorage implements Storage {
  protected map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
}

/** Throws QuotaExceededError when a value is too big. */
class QuotaStorage extends FakeStorage {
  constructor(private maxChars: number) {
    super();
  }
  override setItem(key: string, value: string): void {
    if (value.length > this.maxChars) {
      const err = new Error("quota exceeded");
      err.name = "QuotaExceededError";
      throw err;
    }
    super.setItem(key, value);
  }
}

/** Refuses every write and every read. */
class BrokenStorage extends FakeStorage {
  override getItem(): string | null {
    throw new Error("storage blocked");
  }
  override setItem(): void {
    throw new Error("storage blocked");
  }
}

async function fresh(
  storage: FakeStorage = new FakeStorage(),
): Promise<{ store: Store; storage: FakeStorage }> {
  vi.resetModules();
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", new EventTarget());
  const store = await import("./tickets");
  return { store, storage };
}

function input(
  overrides: Partial<Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt" | "fixedAt">> = {},
): Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt" | "fixedAt"> {
  return {
    title: "Test pothole",
    category: "pothole",
    severity: "medium",
    description: "A test hole.",
    suggestedFix: "",
    place: "Test lane",
    agencyId: "mbsj",
    aiSuggested: false,
    ...overrides,
  };
}

function stored(storage: FakeStorage): { added: Ticket[]; patches: Record<string, object> } {
  return JSON.parse(storage.getItem(STORE_KEY) as string);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.useRealTimers();
});

describe("seeds and reads", () => {
  it("lists all 60 seeds, newest first, across all 8 agencies", async () => {
    const { store } = await fresh();
    const list = store.listTickets();
    expect(list).toHaveLength(60);
    for (let i = 1; i < list.length; i++) {
      expect(Date.parse(list[i - 1].createdAt) >= Date.parse(list[i].createdAt)).toBe(true);
    }
    expect(new Set(list.map((t) => t.agencyId)).size).toBe(8);
  });

  it("serves the featured volunteer ticket D-021", async () => {
    const { store } = await fresh();
    const t = store.getTicket(VOLUNTEER_TICKET_ID);
    expect(t).toBeDefined();
    expect(t?.id).toBe("D-021");
    expect(t?.status).toBe("sent");
    expect(t?.agencyId).toBe("mbsj");
    expect(t?.category).toBe("rubbish");
    expect(t?.place).toContain("SS15");
    expect(store.getTicket("nope")).toBeUndefined();
  });

  it("merges pre-existing local tickets and patches on read", async () => {
    const storage = new FakeStorage();
    const local: Ticket = {
      ...input({ title: "Local report" }),
      id: "LK-preexisting",
      status: "sent",
      createdAt: "2026-11-18T10:00:00+08:00",
      updatedAt: "2026-11-18T10:00:00+08:00",
    };
    storage.setItem(
      STORE_KEY,
      JSON.stringify({
        added: [local],
        patches: { "D-007": { status: "in_progress", updatedAt: "2026-11-18T11:00:00+08:00" } },
      }),
    );
    const { store } = await fresh(storage);
    expect(store.listTickets()).toHaveLength(61);
    expect(store.getTicket("LK-preexisting")?.title).toBe("Local report");
    expect(store.getTicket("D-007")?.status).toBe("in_progress");
    // The seed itself is untouched in the source array.
    expect(SEED_TICKETS.find((t) => t.id === "D-007")?.status).toBe("sent");
  });

  it("survives malformed stored JSON without throwing", async () => {
    const storage = new FakeStorage();
    storage.setItem(STORE_KEY, "{not json");
    const { store } = await fresh(storage);
    expect(store.listTickets()).toHaveLength(60);
  });
});

describe("addTicket", () => {
  it("creates an LK- id, status sent, ISO timestamps, and persists it", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T10:00:00+08:00"));
    const { store, storage } = await fresh();
    const t = store.addTicket(input({ note: "hello", photo: "data:image/svg+xml;utf8,x" }));
    expect(t.id).toMatch(/^LK-[a-z0-9]+$/);
    expect(t.status).toBe("sent");
    expect(t.createdAt).toBe(t.updatedAt);
    expect(Number.isNaN(Date.parse(t.createdAt))).toBe(false);
    expect(t.fixedAt).toBeUndefined();
    expect(t.note).toBe("hello");
    // Newest first: the new ticket leads the list.
    expect(store.listTickets()[0].id).toBe(t.id);
    expect(stored(storage).added.map((x) => x.id)).toContain(t.id);
  });
});

describe("lifecycle", () => {
  it("only allows sent → in_progress → fixed, never skips or backwards", async () => {
    const { store, storage } = await fresh();
    // No skipping sent → fixed.
    expect(store.setStatus("D-007", "fixed")).toBeUndefined();
    expect(store.getTicket("D-007")?.status).toBe("sent");
    // Forward one step.
    const ip = store.setStatus("D-007", "in_progress");
    expect(ip?.status).toBe("in_progress");
    // No backwards.
    expect(store.setStatus("D-007", "sent")).toBeUndefined();
    expect(store.getTicket("D-007")?.status).toBe("in_progress");
    // Forward to fixed sets fixedAt and updatedAt.
    const fixed = store.setStatus("D-007", "fixed");
    expect(fixed?.status).toBe("fixed");
    expect(fixed?.fixedAt).toBeDefined();
    expect(fixed?.updatedAt).not.toBe(fixed?.createdAt);
    // Fixed is terminal.
    expect(store.setStatus("D-007", "in_progress")).toBeUndefined();
    expect(store.setStatus("D-007", "sent")).toBeUndefined();
    expect(store.getTicket("D-007")?.status).toBe("fixed");
    // Unknown id.
    expect(store.setStatus("nope", "in_progress")).toBeUndefined();
    // Seed patches are stored as patches, not copied seeds.
    const data = stored(storage);
    expect(data.added).toHaveLength(0);
    expect(data.patches["D-007"]).toMatchObject({ status: "fixed" });
    expect(store.listTickets()).toHaveLength(60);
  });

  it("is idempotent for the same status", async () => {
    const { store } = await fresh();
    const before = store.getTicket("D-021");
    const again = store.setStatus("D-021", "sent");
    expect(again).toEqual(before);
  });

  it("moves a locally added ticket through the lifecycle too", async () => {
    const { store } = await fresh();
    const t = store.addTicket(input());
    expect(store.setStatus(t.id, "fixed")).toBeUndefined();
    expect(store.setStatus(t.id, "in_progress")?.status).toBe("in_progress");
    expect(store.setStatus(t.id, "fixed")?.status).toBe("fixed");
    expect(store.getTicket(t.id)?.fixedAt).toBeDefined();
  });
});

describe("setAgency", () => {
  it("corrects the body on open tickets only, and validates the id", async () => {
    const { store } = await fresh();
    expect(store.setAgency("D-021", "mbpj")?.agencyId).toBe("mbpj");
    expect(store.getTicket("D-021")?.agencyId).toBe("mbpj");
    expect(store.setAgency("D-021", "not-a-body")).toBeUndefined();
    expect(store.setAgency("nope", "mbpj")).toBeUndefined();
    // Fixed is the end of the lifecycle.
    expect(store.setAgency("D-001", "mbpj")).toBeUndefined();
    expect(store.getTicket("D-001")?.agencyId).toBe("mbsj");
  });
});

describe("agencyStats", () => {
  it("computes raised, solved and median days per council", async () => {
    const { store } = await fresh();
    const stats = store.agencyStats();
    expect(stats).toHaveLength(8);
    const by = (id: string) => stats.find((s) => s.agency.id === id);
    expect(by("mbsj")).toMatchObject({ raised: 13, solved: 7, medianDaysToFix: 2 });
    expect(by("mbpj")).toMatchObject({ raised: 10, solved: 7, medianDaysToFix: 6 });
    expect(by("dbkl")).toMatchObject({ raised: 11, solved: 7, medianDaysToFix: 4 });
    expect(by("mbdk")).toMatchObject({ raised: 7, solved: 4, medianDaysToFix: 14 });
    expect(by("mpaj")?.medianDaysToFix).toBe(9);
    expect(by("jkr")?.medianDaysToFix).toBe(3);
    expect(by("tnb")?.medianDaysToFix).toBe(1);
    // No completed tickets → null, not 0.
    expect(by("air-selangor")).toMatchObject({ raised: 3, solved: 0, medianDaysToFix: null });
    expect(stats.reduce((n, s) => n + s.raised, 0)).toBe(60);
  });

  it("includes local tickets in the median (even-count case)", async () => {
    vi.useFakeTimers();
    const t0 = new Date("2026-11-19T09:00:00+08:00");
    vi.setSystemTime(t0);
    const { store } = await fresh();
    const a = store.addTicket(input({ agencyId: "air-selangor", category: "water" }));
    const b = store.addTicket(input({ agencyId: "air-selangor", category: "water" }));
    vi.setSystemTime(new Date(t0.getTime() + 2 * 86_400_000));
    store.setStatus(a.id, "in_progress");
    store.setStatus(a.id, "fixed");
    vi.setSystemTime(new Date(t0.getTime() + 6 * 86_400_000));
    store.setStatus(b.id, "in_progress");
    store.setStatus(b.id, "fixed");
    const s = store.agencyStats().find((x) => x.agency.id === "air-selangor");
    expect(s).toMatchObject({ raised: 5, solved: 2, medianDaysToFix: 4 });
  });
});

describe("pledges", () => {
  it("adds valid amounts, caps each pledge at 1000, ignores invalid ones", async () => {
    const { store } = await fresh();
    expect(store.pledgeTotalRm()).toBe(0);
    expect(store.addPledge(50)).toEqual({ totalRm: 50 });
    expect(store.addPledge(25.5)).toEqual({ totalRm: 75.5 });
    expect(store.addPledge(5000)).toEqual({ totalRm: 1075.5 }); // capped at 1000
    expect(store.addPledge(0)).toEqual({ totalRm: 1075.5 });
    expect(store.addPledge(-3)).toEqual({ totalRm: 1075.5 });
    expect(store.addPledge(Number.NaN)).toEqual({ totalRm: 1075.5 });
    expect(store.pledgeTotalRm()).toBe(1075.5);
  });

  it("persists the total across a reload (same storage)", async () => {
    const storage = new FakeStorage();
    const first = await fresh(storage);
    first.store.addPledge(40);
    const second = await fresh(storage);
    expect(second.store.pledgeTotalRm()).toBe(40);
  });
});

describe("volunteer interest", () => {
  it("defaults off, toggles, and persists", async () => {
    const storage = new FakeStorage();
    const { store } = await fresh(storage);
    expect(store.volunteerInterest()).toBe(false);
    expect(store.setVolunteerInterest(true)).toBe(true);
    expect(store.volunteerInterest()).toBe(true);
    const reloaded = await fresh(storage);
    expect(reloaded.store.volunteerInterest()).toBe(true);
    expect(reloaded.store.setVolunteerInterest(false)).toBe(false);
    expect(reloaded.store.volunteerInterest()).toBe(false);
  });
});

describe("storage failures", () => {
  it("on quota, drops the photo but keeps the ticket", async () => {
    const storage = new QuotaStorage(2000);
    const { store } = await fresh(storage);
    const bigPhoto = `data:image/png;base64,${"A".repeat(5000)}`;
    const t = store.addTicket(input({ photo: bigPhoto, note: "keep me" }));
    expect(t.photo).toBeUndefined();
    expect(t.note).toBe("keep me");
    expect(t.status).toBe("sent");
    expect(store.getTicket(t.id)?.title).toBe("Test pothole");
    const data = stored(storage);
    expect(data.added).toHaveLength(1);
    expect(data.added[0].photo).toBeUndefined();
    expect(data.added[0].id).toBe(t.id);
  });

  it("never throws when storage is fully blocked; keeps the session in memory", async () => {
    const { store } = await fresh(new BrokenStorage());
    expect(store.listTickets()).toHaveLength(60);
    const t = store.addTicket(input());
    expect(store.getTicket(t.id)?.id).toBe(t.id);
    expect(store.setStatus(t.id, "in_progress")?.status).toBe("in_progress");
    expect(store.addPledge(10)).toEqual({ totalRm: 10 });
    expect(store.setVolunteerInterest(true)).toBe(true);
    expect(store.volunteerInterest()).toBe(true);
  });
});

describe("subscribe", () => {
  it("fires on mutations, stops after unsubscribe, and hears other tabs", async () => {
    const { store } = await fresh();
    const cb = vi.fn();
    const unsubscribe = store.subscribe(cb);
    const t = store.addTicket(input());
    expect(cb).toHaveBeenCalledTimes(1);
    store.setStatus(t.id, "in_progress");
    expect(cb).toHaveBeenCalledTimes(2);
    store.setAgency(t.id, "mbpj");
    expect(cb).toHaveBeenCalledTimes(3);
    store.addPledge(5);
    expect(cb).toHaveBeenCalledTimes(4);
    store.setVolunteerInterest(true);
    expect(cb).toHaveBeenCalledTimes(5);
    // Another tab writes: the window storage event reaches subscribers.
    window.dispatchEvent(Object.assign(new Event("storage"), { key: STORE_KEY }));
    expect(cb).toHaveBeenCalledTimes(6);
    // Unrelated keys are ignored.
    window.dispatchEvent(Object.assign(new Event("storage"), { key: "something-else" }));
    expect(cb).toHaveBeenCalledTimes(6);
    unsubscribe();
    store.addTicket(input());
    expect(cb).toHaveBeenCalledTimes(6);
  });
});
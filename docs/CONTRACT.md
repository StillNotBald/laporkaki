# Build contract — LaporKaki (owner-approved 2026-11-19 ~12:15 MYT)

Authority: `proposal/FLOW.md` (approved seven screens, `sent → in_progress → fixed`), `docs/SUBMISSION.md`.
This file is the shared interface. **Code against these signatures exactly.** Do not edit files owned by another worker; import them. If a signature here is wrong for your screen, report it — do not change the contract yourself.

Stack: Next.js 16.4 App Router, `cacheComponents: true` (never `export const dynamic`; use `await connection()` in routes), React 19.3, Tailwind 4, vitest 5, Node 24. Read `web/AGENTS.md` and the relevant guide in `web/node_modules/next/dist/docs/` before writing Next code.

Look (every screen): white background, black text, glass panels, ONE macOS-blue accent (#0A84FF family), never white text, no pink, ≤4 type sizes, compact header, few words, plain language. Phone first at 390px, then desktop. Reuse `web/src/components/ui` (Button, Card, Pill, Field, EmptyState) and tokens in `globals.css`. No tool/model/studio names in product copy. Every screen that shows data carries a quiet "Demo data" notice.

## 1. Types — `web/src/lib/store/types.ts` (owner: worker A)

```ts
export type TicketStatus = "sent" | "in_progress" | "fixed";
export type Severity = "low" | "medium" | "high";
export type Category =
  | "pothole" | "streetlight" | "drain" | "rubbish" | "dumping"
  | "tree" | "road-markings" | "playground" | "flooding"
  | "abandoned-vehicle" | "traffic-light" | "water" | "sewerage" | "other";

export interface Agency {
  id: string;        // "mbsj" | "mbpj" | "dbkl" | "mbdk" | "mpaj" | "jkr" | "tnb" | "air-selangor"
  short: string;     // "MBSJ"
  name: string;      // "Majlis Bandaraya Subang Jaya"
  area: string;      // "Subang Jaya, Puchong, Seri Kembangan"
  kind: "council" | "utility" | "works";
}

export interface Ticket {
  id: string;                    // seeds "D-001"…; new "LK-" + base36 timestamp + random
  title: string;
  category: Category;
  severity: Severity;
  description: string;
  suggestedFix: string;          // may be "" — never blocks sending
  place: string;                 // human place label, editable
  coords?: { lat: number; lng: number };
  agencyId: string;
  status: TicketStatus;
  createdAt: string;             // ISO
  updatedAt: string;             // ISO
  fixedAt?: string;              // ISO, set when status becomes fixed
  photo?: string;                // data URL; may be dropped on storage quota
  note?: string;                 // citizen's optional note
  aiSuggested: boolean;          // true when AI filled the fields
}

export interface AgencyStats {
  agency: Agency;
  raised: number;
  solved: number;
  medianDaysToFix: number | null; // null → show "No completed tickets"
}

export interface Draft {          // transient, sessionStorage only, never persisted as a ticket
  photo?: string;
  note?: string;
  place?: string;
  coords?: { lat: number; lng: number };
  agencyId?: string;
}
```

## 2. Content — `web/src/content/` (owner: worker A)

- `agencies.ts`: `export const AGENCIES: Agency[]` — the 8 ids above, names/areas from `research/03-routing.md` §1. `export function agencyById(id: string): Agency | undefined`. `export const DEFAULT_AGENCY_ID = "mbsj"`.
- `routing.ts`: `export const CATEGORY_LABELS: Record<Category, string>` (plain English, e.g. "Pothole", "Broken streetlight"); `export function suggestAgency(category: Category, currentId: string): string` — category defaults from the routing table v1 (streetlight→tnb, water→air-selangor, sewerage→"air-selangor" is WRONG: sewerage has no agency in our 8, keep current; traffic-light→jkr; everything else keeps the place-based council). Suggestion only, always editable.
- `seed-tickets.ts`: `export const SEED_TICKETS: Ticket[]` — ~30 tickets across all 8 agencies, mixed statuses (roughly half fixed, some in_progress, rest sent), realistic Oct–Nov 2026 dates, varied median fix speeds per council so the dashboard tells a story. **No real people's names or photos.** Photos: tiny inline SVG data-URL placeholders (simple shapes, grey/blue), not real images. Includes `D-021`: litter-pick at an SS15 park path, MBSJ, status `sent`, the featured volunteer example. `export const VOLUNTEER_TICKET_ID = "D-021"; export const PLEDGE_GOAL_RM = 100;`

## 3. Store — `web/src/lib/store/tickets.ts` (owner: worker A)

Client-only (`"use client"` safe; guard `typeof window`), no deps. Seeds are the base dataset; localStorage holds new tickets plus patches (status/agency/fixedAt) to any ticket. Merge on read. Exact API:

```ts
export function listTickets(): Ticket[];            // seeds + local, newest first
export function getTicket(id: string): Ticket | undefined;
export function addTicket(input: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt" | "fixedAt">): Ticket; // status "sent"
export function setStatus(id: string, status: TicketStatus): Ticket | undefined; // only sent→in_progress→fixed; sets updatedAt, fixedAt on fixed
export function setAgency(id: string, agencyId: string): Ticket | undefined;
export function subscribe(cb: () => void): () => void; // fires on any mutation (CustomEvent + storage event); returns unsubscribe
export function agencyStats(): AgencyStats[];        // per agency: raised, solved, median elapsed days sent→fixed (fixed only), null when none
export function addPledge(amountRm: number): { totalRm: number }; // local only, amount > 0, cap 1000 per pledge
export function pledgeTotalRm(): number;
export function setVolunteerInterest(on: boolean): boolean;
export function volunteerInterest(): boolean;
```

On `QuotaExceededError` when saving a photo: retry without the `photo` field, keep the ticket. Never throw to the UI. Tests in `web/src/lib/store/tickets.test.ts` (fake localStorage): lifecycle order enforced, merge of seeds+patches, median math, pledge cap, quota fallback.

## 4. Draft handoff — `web/src/lib/report/draft.ts` (owner: worker B)

`saveDraft(d: Draft)`, `readDraft(): Draft | null`, `clearDraft()` over sessionStorage key `laporkaki.draft`. Report screen saves, confirmation screen reads once, send or cancel clears.

## 5. Analyse route — `web/src/app/api/report/analyse/route.ts` (owner: worker B)

`POST { photo: string, place?: string, coords?: {lat,lng} }` → `200 { ai: true, title, category, severity, description, suggestedFix, agencyId }` or `200 { ai: false }` on any failure (never 5xx for AI failure — the client falls back to manual fields). `await connection()`; `export const maxDuration = 60;`. Validate photo with `checkImage` from `web/src/lib/ai/image.ts` (import only). One `chat()` call from `web/src/lib/ai/qwen.ts` with `fast: true`, JSON mode, `enable_thinking: false`, system prompt asking for exactly those fields, category from the §1 union, agencyId from the 8 ids, given the routing hints. Timeout + one retry already live in `chat()`. No key or raw upstream error text in the response.

## 6. Routes and file ownership

| Route | Screen (FLOW §4) | Owner | Files (create/edit only these) |
|---|---|---|---|
| `/` | Home | D | `web/src/app/page.tsx` (replace placeholder) |
| `/report` | Report-photo | B | `web/src/app/report/page.tsx`, `web/src/lib/report/draft.ts` |
| `/report/confirm` | AI confirmation | B | `web/src/app/report/confirm/page.tsx`, `web/src/app/api/report/analyse/route.ts`, `web/src/lib/report/analyse-client.ts` (+its test) |
| `/ticket/[id]` | Ticket | C | `web/src/app/ticket/[id]/page.tsx` |
| `/inbox` | Council inbox + inline detail | C | `web/src/app/inbox/page.tsx` |
| `/dashboard` | Public dashboard | D | `web/src/app/dashboard/page.tsx` |
| `/volunteer` | Volunteer + pledge | E | `web/src/app/volunteer/page.tsx` |
| — | AI review fixes | F | `web/src/app/api/ai/chat/route.ts`, `web/src/lib/ai/qwen.ts`, `web/src/lib/ai/image.ts`, `web/src/lib/ai/useChatStream.ts`, `web/src/lib/ai/qwen.test.ts` |
| — | Store + content | A | `web/src/lib/store/types.ts`, `web/src/lib/store/tickets.ts`, `web/src/lib/store/tickets.test.ts`, `web/src/content/agencies.ts`, `web/src/content/routing.ts`, `web/src/content/seed-tickets.ts` |

Lead owns: `web/e2e/routes.ts`, `docs/CONTRACT.md`, manifest/icons, all git. Workers never touch `package.json`, `submission.ts`, `e2e/routes.ts`, `globals.css`, or another worker's files. Workers never run git or installs.

Screen behaviour lives in `proposal/FLOW.md` §2 journeys and §4 table — read them. All screens are client components reading the store via `subscribe` (seed data renders immediately; no loading spinner needed for local data). Navigation: compact header with the screen title and a back link; Home links to all six other screens. GPS: `navigator.geolocation` with a typed-place fallback that never traps the user; reverse geocoding via `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=..&lon=..` with a 5 s timeout and typed-place fallback on any failure (send a descriptive `User-Agent` is not possible from the browser — accept possible rejection and fall back silently).

## 7. Gates (lead, after the wave)

`npx vitest run --maxWorkers=2`, `npm run typecheck`, `npm run build` in `web/`, then `npm run shots` and open every PNG at desktop and 390px. Workers run only their own scoped tests + typecheck and report results honestly.
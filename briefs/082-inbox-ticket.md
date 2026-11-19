Read `AGENTS.md`, `web/AGENTS.md`, `docs/CONTRACT.md` (§1–§3, rows C in §6), `docs/SUBMISSION.md`, `proposal/FLOW.md` §2 officer journey + §4 screens 4–5 first. Use the impeccable skill and follow `.qoder/rules/skills.md` (read `craft-floor.md` before any UI edit).

## Job
Two screens: the citizen's ticket view `/ticket/[id]` and the demo council inbox `/inbox` with inline detail (no separate detail route, no login).

## Files you own (create only these)
- `web/src/app/ticket/[id]/page.tsx` — client component; Next 16: `params` is a Promise, `use()` it or read via `useParams`. Show photo (or a quiet placeholder when absent), title, category label, severity Pill, place, agency short+name, status Pill ("Sent" / "In progress" / "Fixed"), status history from createdAt/updatedAt/fixedAt, suggested fix labelled "Possible fix — not vetted", note if present, "Demo inbox only — nothing goes to a real council." Links: dashboard, and volunteer screen when id === VOLUNTEER_TICKET_ID. Unknown id → EmptyState with a link home. Live-update via `subscribe`.
- `web/src/app/inbox/page.tsx` — client component. Agency filter (All + the 8 from `AGENCIES`), list newest first: title, place, status Pill, age. Tap a row → detail panel WITHIN this screen (phone: replaces the list, back returns; desktop: side panel). Detail: photo, fields, editable agency select (`setAgency`), "Mark in progress" then "Mark fixed" (`setStatus`, only the legal next step shown). Quiet "Demo officer view — updates stay in this browser" notice. Empty state per filter. Live-update via `subscribe`.

## Parallel note
Worker A is creating `@/lib/store/tickets`, `@/lib/store/types`, `@/content/agencies`, `@/content/routing`, `@/content/seed-tickets` right now. Import per the CONTRACT signatures exactly. If typecheck fails ONLY on those missing modules, say so — do NOT create stubs outside your ownership.

## Rules
Look per AGENTS.md: white, black text, glass, one blue accent, ≤4 type sizes, 390px first, few words. Reuse `@/components/ui`. No tool/model names in copy. No git, no installs, no other files. Run `npm run typecheck` in `web/`; report honestly. End under 150 words.
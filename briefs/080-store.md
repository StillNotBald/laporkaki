Read `AGENTS.md`, `web/AGENTS.md`, `docs/CONTRACT.md` (your contract: §1–§3, row A in §6), `docs/SUBMISSION.md`, `research/03-routing.md` and `proposal/FLOW.md` §3 first. This is data-layer work, no UI.

## Job
Implement the LaporKaki ticket store and content exactly per CONTRACT §1–§3: types, agencies, routing labels/suggestion, ~30 seed tickets, localStorage store with the exact exported signatures, plus tests.

## Files you own (create only these)
- `web/src/lib/store/types.ts` — exactly CONTRACT §1.
- `web/src/content/agencies.ts`, `web/src/content/routing.ts`, `web/src/content/seed-tickets.ts` — per CONTRACT §2. Seed story: ~30 tickets, all 8 agencies, roughly half fixed / some in_progress / rest sent, Oct–Nov 2026 dates, different median fix speeds per council (e.g. MBSJ fast, another slow) so the dashboard has a narrative. D-021 = litter-pick, SS15 park path, MBSJ, sent. No real people, no real photos: tiny inline SVG data-URL placeholders only.
- `web/src/lib/store/tickets.ts` — per CONTRACT §3. Seeds + localStorage patches merged on read; lifecycle only sent→in_progress→fixed; quota fallback drops photo, keeps ticket; never throws to the UI; `subscribe` via CustomEvent + window storage event.
- `web/src/lib/store/tickets.test.ts` — vitest with a fake localStorage: lifecycle order enforced (no sent→fixed, no backwards), seed+patch merge, addTicket id/status/timestamps, median-days math incl. null case, pledge cap and total, volunteer interest, quota fallback.

## Rules
Exact signatures from the contract — five other workers import them in parallel. No git, no installs, no other files. Node 24. Run `npx vitest run src/lib/store --maxWorkers=2` and `npm run typecheck` in `web/`; report results honestly. End with a report under 150 words.
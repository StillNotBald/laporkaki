Read `AGENTS.md`, `web/AGENTS.md`, `docs/CONTRACT.md` (§1–§3, row E in §6), `docs/SUBMISSION.md`, `proposal/FLOW.md` §1 third story + §2 volunteer journey + §4 screen 7 first. Use the impeccable skill and follow `.qoder/rules/skills.md` (read `craft-floor.md` before any UI edit).

## Job
ONE combined volunteer + pledge screen at `/volunteer`. Pledges only — no money moves, ever.

## Files you own (create only these)
- `web/src/app/volunteer/page.tsx` — client component. Reads the featured ticket via `getTicket(VOLUNTEER_TICKET_ID)` from `@/lib/store/tickets` (seed D-021: litter-pick, SS15 park path, MBSJ). Show: issue title/place/body, a safety note ("Unsafe work stays with the responsible body. This is a council-approved demo example."), "Volunteer / Sukarelawan" interest toggle (`setVolunteerInterest`/`volunteerInterest`), pledge amount input + "Pledge / Janji" button (`addPledge`, validate > 0, plain inline error otherwise), local total against `PLEDGE_GOAL_RM` with a simple progress bar, inline acknowledgement on the same screen after pledging. Fixed line: "Demo pledge — no money moves." No checkout, no payment link, no extra screens. Live-update via `subscribe`.

## Parallel note
Worker A is creating `@/lib/store/tickets`, `@/lib/store/types`, `@/content/seed-tickets` right now. Import per CONTRACT signatures exactly. If typecheck fails ONLY on those missing modules, say so — do NOT create stubs outside your ownership.

## Rules
Look per AGENTS.md: white, black text, glass, one blue accent, ≤4 type sizes, 390px first, few words. Reuse `@/components/ui`. No tool/model names in copy. No git, no installs, no other files. Run `npm run typecheck` in `web/`; report honestly. End under 150 words.
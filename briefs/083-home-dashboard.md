Read `AGENTS.md`, `web/AGENTS.md`, `docs/CONTRACT.md` (§1–§3, rows D in §6), `docs/SUBMISSION.md`, `proposal/FLOW.md` §4 screens 1 and 6 + §8 (the 90-second wow) first. Use the impeccable skill and follow `.qoder/rules/skills.md` (read `craft-floor.md` before any UI edit).

## Job
Home `/` (replace the building-blocks placeholder) and the public dashboard `/dashboard`.

## Files you own (create only these)
- `web/src/app/page.tsx` — REPLACE the placeholder entirely. Home: product name LaporKaki, one line "Report a public problem. We find who fixes it." (plain, no jargon), primary Button "Report a problem / Lapor" → `/report`; secondary links: demo inbox `/inbox`, dashboard `/dashboard`, volunteer `/volunteer`; visible quiet "Demo data — internal inbox, no real council" notice. Compact, one job, 390px first. Keep a small link to `/pitch` in the footer.
- `web/src/app/dashboard/page.tsx` — client component. From `agencyStats()`: total raised / total solved tiles, then per-agency rows: short name, raised, solved, median days to fix ("No completed tickets" when null), a simple inline-SVG horizontal bar comparing solved/raised (no chart library, no new deps). Sort by raised desc. "Demo data — seeded examples plus this browser's reports. Not verified council performance." notice. Live-update via `subscribe`. Empty state if no tickets.

## Parallel note
Worker A is creating `@/lib/store/tickets`, `@/lib/store/types`, `@/content/agencies` right now. Import per CONTRACT signatures exactly. If typecheck fails ONLY on those missing modules, say so — do NOT create stubs outside your ownership. Do NOT edit `e2e/routes.ts` (lead owns it).

## Rules
Look per AGENTS.md: white, black text, glass, one blue accent, ≤4 type sizes, 390px first, few words. Reuse `@/components/ui` (Card, Button, Pill, EmptyState). No tool/model names in copy. No git, no installs, no other files. Run `npm run typecheck` in `web/`; report honestly. End under 150 words.
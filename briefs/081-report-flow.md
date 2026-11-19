Read `AGENTS.md`, `web/AGENTS.md`, `docs/CONTRACT.md` (§1, §4, §5, rows B in §6), `docs/SUBMISSION.md`, `proposal/FLOW.md` §2 citizen journey + §4 screens 2–3 + §5 first. Use the impeccable skill and follow `.qoder/rules/skills.md` (read `craft-floor.md` before any UI edit).

## Job
The report flow: `/report` (photo + place) and `/report/confirm` (AI suggestions, editable, send), plus the `/api/report/analyse` route and draft handoff. This is the 90-second wow — make it feel instant and calm.

## Files you own (create only these)
- `web/src/app/report/page.tsx` — photo via `<input type="file" accept="image/*" capture="environment">` with preview; optional note; "Use my location" → `navigator.geolocation` (5 s timeout) → reverse geocode via Nominatim (5 s timeout, silent fallback); typed place + agency select ALWAYS available and never trapped by GPS denial; agency select from `AGENCIES` (`@/content/agencies`); "Continue" saves Draft (`@/lib/report/draft`) and routes to `/report/confirm`. Validate the photo client-side with `checkImage` from `@/lib/ai/image` before continuing; show its plain error.
- `web/src/lib/report/draft.ts` — CONTRACT §4 exactly.
- `web/src/app/report/confirm/page.tsx` — on mount: read draft, POST `/api/report/analyse` with the photo; show a calm loading line; render suggested title/category/severity/place/agency/fix as EDITABLE fields (Field, select for category/severity/agency from `@/content/agencies` + `CATEGORY_LABELS` from `@/content/routing`), each AI-filled field marked "AI suggestion — please check". On `{ai:false}` or network error: plain message + the same empty manual fields — sending still works. "Send / Hantar" requires photo + title + place + agency; calls `addTicket` from `@/lib/store/tickets` with `aiSuggested` set correctly, clears the draft, routes to `/ticket/<id>`. Cancel clears draft, back to `/report`. Say "Sent to the demo inbox — not a real council."
- `web/src/app/api/report/analyse/route.ts` — CONTRACT §5 exactly: `await connection()`, `maxDuration = 60`, `checkImage`, one `chat()` with `fast:true` + JSON mode, system prompt demanding exactly the JSON fields with the category union and the 8 agency ids + routing hints (streetlight→tnb, water→air-selangor, traffic-light→jkr, else council by place). Parse defensively; ANY failure → `200 {ai:false}`. No raw upstream errors, no key.
- `web/src/lib/report/analyse-client.ts` + `analyse-client.test.ts` — small fetch helper + pure parser for the analyse response (validates category/severity/agencyId against the unions, falls back to `{ai:false}` on junk). Test the parser.

## Parallel note
Worker A is creating `@/lib/store/*` and `@/content/*` right now. Code against the CONTRACT signatures exactly. If typecheck fails ONLY on those missing modules, say so in your report — do NOT create stub files outside your ownership.

## Rules
Look per AGENTS.md: white, black text, glass, one blue accent, ≤4 type sizes, 390px first. No tool/model names in copy. No git, no installs, no other files. Run `npx vitest run src/lib/report --maxWorkers=2` and `npm run typecheck` in `web/`; report honestly. End under 150 words.
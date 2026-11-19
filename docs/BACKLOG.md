# Backlog — LaporKaki (living doc, lead updates each wave)

Last update: 2026-11-19 12:55 MYT. Deadlines: deploy **13:00**, feature freeze **14:15**, video **14:30**, form **14:45**, pitch **15:00**.
Submission values live only in `web/src/content/submission.ts`; `TBD` stays `TBD` until the owner decides.

## Done (this sprint)

- Owner approval of seven screens + `sent → in_progress → fixed` recorded (`proposal/FLOW.md`, `docs/SUBMISSION.md`).
- Build contract: `docs/CONTRACT.md`. Briefs 080–085.
- Ticket store + 30 seeds + agencies/routing content, 17 tests green (worker A).
- All seven screens: home, report, AI confirmation, ticket, council inbox, dashboard, volunteer/pledge (workers B–E, lead-reviewed).
- `/api/report/analyse` — fast JSON triage, manual fallback on any failure (worker B, lead-reviewed).
- PWA shell: manifest, icons (192/512/180 + SVG), metadata from `submission.ts`.
- Demo journey steps rewritten for the real flow (`web/e2e/demo/steps.ts`), demo photo asset (`web/e2e/demo/assets/pothole.png`, also `/demo/pothole.png` when deployed).
- Demo-video CI added by a worker beyond its brief, lead-reviewed and kept: `.github/workflows/demo-video.yml`, `web/scripts/convert-demo.mjs`, `embed-readme.mjs`, `demo:video` script. No secrets in code; bot commits touch only assets/README.
- Deps installed on this machine (`npm ci`, Playwright chromium) — checkout arrived without `node_modules`.

## In progress

- Vercel deploy (item 6): **live https://qodefest-overclock.vercel.app** (~12:58 MYT), all routes smoke-tested 200; `/api/ai/health` says configured:false until owner adds `OPENAI_BASE_URL` / `OPENAI_API_KEY` (dashboard or own terminal), then lead redeploys. Node pinned via `engines.node: 24.x` (vercel.json `nodeVersion` is rejected by CLI 66).
- Work branch `feature/laporkaki-build` pushed at owner request (~12:50); carries the build wave. `main` also carries it (pushed before the branch request); rolling `main` back needs an explicit owner yes.

## Done since last update

- Full gates green: 96/96 tests (6 files), typecheck clean, production build green (all routes; `/ticket/[id]` is Partial Prerender via `export const instant = false`), shots 16 passed / 2 skipped, all seven phone screens + desktop spot-checks opened and looked at — no console errors, no horizontal scroll.
- Lead fixes verified in the gates: `/ticket/[id]` server page + client view split; shared rate limiter guards BOTH AI routes (+3 tests); 3 MB image fixtures.
- Committed `ec43c25` (build wave, 56 files) + `ed466e0` (demo recorder timeout) and pushed; merged the desktop session's handover/preview commits (`fa40dda`, `38a9a69`) with FLOW.md approval-wording conflicts resolved keeping both records; merge `3fe5029` pushed.
- Track confirmed by owner: **Reimagine Malaysia** (in `submission.ts`).
- `scripts/qoder-usage.test.mjs` now 5/5 pass (handover failure resolved).

## Next (in order, with owner)

| # | Item | Who | By |
|---|---|---|---|
| 1 | Vercel deploy: owner approves device login + types env values (`docs/DEPLOY.md` §2), lead links/deploys, smoke test §5 | Owner + lead | **13:00** |
| 2 | `submission.ts`: tagline, description, inspiration, implementation, links (track done) | Owner decides, lead types | before 14:15 |
| 3 | Qoder usage numbers: `node scripts/qoder-usage.mjs`; note honestly that today's build wave ran via built-in agents (CLI dispatch broken on 1.1.92), so `.qoder-runs` undercounts | Lead | before deck final |
| 4 | Record demo video (`npm run demo:video` in `web/`), owner uploads unlisted, link into `submission.ts` | Lead records, owner uploads | **14:30** |
| 5 | README implementation/inspiration from the approved story; deck values flow from `submission.ts` | Lead | 14:15 |
| 6 | Submit all 7 items | Owner | **14:45** |

## Blocked on owner

- Vercel device-login approval in owner's browser, then typing `OPENAI_BASE_URL` / `OPENAI_API_KEY` (values stay in a local env file outside the repo, never in chat).
- The TBD copy values (item 2 above).
- Demo video upload + link.
- Repo public: only after the public-readiness scrub AND owner yes. Submission item 7 can stay the private URL if the form accepts it — confirm.

## Known issues / risks

- GitHub Actions demo-video CI cannot run: account billing ("recent account payments have failed or your spending limit needs to be increased", run 44460610705, job never started). Owner account fix; meanwhile record locally with `npm run demo:video`. Do not blind-retry CI.
- `qodercli` 1.1.92 `sdk_worker_removed`: `scripts/qw.sh` / `qw-fan.sh` dispatch dead. Fallback = built-in builder agents. Fix needs CLI ≤1.1.80 or SDK upgrade (owner decision, post-submission).
- `scripts/qoder-usage.test.mjs` passes 5/5 now, but `.qoder-runs` only counts CLI dispatches — today's wave ran via built-in agents, so quoted numbers must say so.
- Live AI on stage depends on the key + network; manual fallback is first-class and the backup video must be ready.
- Nominatim reverse geocoding may reject browser requests; typed-place fallback covers it.

## MVP + demo gaps (added 2026-11-19, desktop session; owner: dummy data is fine, functionality must be real)

Audit result: no canned AI anywhere in the app. `/api/report/analyse` makes a real Qwen call; the parser validates against the contract unions; the confirm page fills only untouched fields and labels manual state; the demo recorder's manual fills fire only when AI returns empty. Seeds are labelled dummy data (owner-approved). Verified live without a key: POST of the real pothole photo to the deployed endpoint returns `{"ai":false}` — guards and fallback work; only the upstream call is missing.

### Demo-critical (before video 14:30)

| # | Item | Who | Note |
|---|---|---|---|
| D1 | **Live AI triage on the deployed demo**: add `OPENAI_BASE_URL`, `OPENAI_API_KEY` (and `QWEN_MODEL` if not default) in Vercel env, redeploy | **Owner** | `/api/ai/health` = `configured:false` today. Key file access is blocked by project settings for agents; owner types values in Vercel dashboard or own terminal. Until then every deployed triage is manual fallback |
| D2 | Prove triage end-to-end with the key: POST `web/public/demo/pothole.png` as data URL to `/api/report/analyse`, expect `{ai:true, title, category, severity, description, suggestedFix, agencyId}`; then walk report → confirm on the deployed URL | Owner or lead after D1 | Same call already verified for the fallback path |
| D3 | Re-record demo video only after D1 on the target URL; optionally drop the recorder's manual `selectOption("mbsj")` so AI routing is visible on camera (AI overwrites it when untouched today) | Lead | Recorder fallback fills are conditional and safe |
| D4 | Deck fixes: track → "Reimagine Malaysia"; S3 bodies = the real 8 (drop KDEB/IWK); mark Widget/API/MCP as roadmap on S3; S6 "fixed alert" → honest status-update wording; re-embed the refreshed phone shot | Desktop session, owner yes | Deck currently overclaims these five |
| D5 | Qoder usage numbers: `qoder-usage.json` reads 6 runs / 0 files / 0 credits (CLI dispatch broken; wave ran via built-in agents). Honest framing line on S5, never the raw zeros | Lead + owner | BACKLOG known-issue already says quote honestly |

### MVP-critical (post-freeze, in order)

| # | Item | Why it matters |
|---|---|---|
| M1 | Server-side ticket store (DB) + write API | Today tickets live in per-browser localStorage: no cross-device sync, shareable URLs only work for seeds, officer inbox is same-browser. This is the difference between demo and product |
| M2 | Real "fixed" notifications (web push or email) | `notify()` in `store/tickets.ts` is a same-tab UI event, not a citizen alert. The return trigger of the whole adoption loop |
| M3 | Single-source routing: derive the analyse prompt hints from `agencies.ts` + `routing.ts`; delete or wire unused `suggestAgency()` | Prompt currently hardcodes place→council and category overrides that duplicate content files — drift risk |
| M4 | Blocker reasons on stalled tickets + escalation ladder (reminder → SISPAA/PCB → ADUN/MP) | Owner-approved roadmap; answers "what hinders action" |
| M5 | Auth + moderation + abuse guards before any write API / widget / MCP opens | Public write surface without these is spam and liability |

## Out of scope (do not build today)

Everything in `proposal/FLOW.md` §7: reopening, duplicates, me-too, accept/refuse, crew assignment, verification (D8), my-reports, auth, real payments, real council contact, full bilingual toggle, native app wrapper.
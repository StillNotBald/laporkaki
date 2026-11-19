# Sprint log — 2026-11-19 build wave (Desktop Qoder lead session)

## 12:15 — owner approval
Owner said "approve and go" to the seven-screen grouping and `sent → in_progress → fixed` lifecycle. Recorded in `proposal/FLOW.md` (§4, §6, D2) and `docs/SUBMISSION.md`. Architecture confirmed with owner: mobile-first installable PWA on the existing Next.js monolith; no native rewrite, no database.

## 12:20 — contract + briefs
`docs/CONTRACT.md` written: exact types, store API, content files, analyse route shape, file ownership. Briefs 080–085 (store, report flow, inbox+ticket, home+dashboard, volunteer, AI review fixes).

## 12:22 — dispatch fallback (important)
`scripts/qw-fan.sh` failed all six workers in ~4 s: **qodercli 1.1.92 returns `sdk_worker_removed` — SDK worker sessions no longer supported** (needs CLI ≤ 1.1.80 or an SDK upgrade). Did not downgrade or bypass. Dispatched the same six briefs through the built-in builder agents instead. Consequence: these runs do NOT appear in `.qoder-runs`, so `scripts/qoder-usage.mjs` undercounts today's build wave — the Qoder usage slide must say so honestly.

## 12:24 — environment gap
This Linux checkout had no `web/node_modules`. Lead ran `npm ci` + `npx playwright install chromium` (allowed: lead installs, lockfile only, no new deps).

## Lead-owned landed this session
- `web/e2e/routes.ts`: all 7 screens + /pitch.
- `web/src/app/layout.tsx`: real metadata from `submission.ts`, manifest link, apple-web-app, themeColor.
- `web/src/app/manifest.ts` + `web/public/icon.svg` (PNG icons pending chromium install).

## 12:35 — items and backlog updated (owner request)
`docs/BACKLOG.md` created as the living backlog (done / in progress / next-with-deadlines / blocked-on-owner / risks / out-of-scope). `docs/SUBMISSION.md` items table carries a build-status line pointing to it. Session task list mirrors the backlog. Worker F (AI fixes) still in flight; gates run when it lands.

## 12:34 — demo-video pipeline (GitHub → README flow video)
Built and component-verified, not committed. Files: `.github/workflows/demo-video.yml`, `web/scripts/convert-demo.mjs`, `web/scripts/embed-readme.mjs`, `demo:video` script in `web/package.json`, README "Application flow" marker slot.
Flow: push to main touching `web/**` (or manual dispatch) → Playwright records the journey → ffmpeg converts to mp4 + GIF (size ladder keeps GIF under GitHub's 10 MB render limit) → artifact + rolling `demo` release → bot commits `assets/demo-flow.gif` and the README embed. Loop-safe: paths filter + `[skip ci]`.
Verified: YAML parse; real ffmpeg pass (h264/yuv420p mp4, 2.1 MB GIF); embed write/idempotent/missing-marker error; `npm ci` + Chromium install; Playwright webServer wiring launches.
Update ~12:45: brief 080 landed; full local pass green after adding `timeout: 240_000` to `playwright.demo.config.ts` (the journey runs 46s, past Playwright's 30s default). Placeholder-step recording: mp4 0.9 MB, GIF 4.1 MB at 10fps/800px. Pushing to main to trigger the first CI run.

## 12:54 — first CI run blocked by account billing; preview published manually
The push triggered the demo-video workflow (run 44460610705) but the job never started: StillNotBald Actions billing is blocked (failed payment or spending limit). Owner fix: GitHub Settings → Billing & plans, then re-run the workflow. Meanwhile published manually: rolling release `demo` holds demo.mp4; `assets/demo-flow.gif` (4.1 MB) committed with the README embed. Captions are placeholders until `steps.ts` is rewritten. Local pre-flight was green: 46s recording, 0.9 MB mp4, 4.1 MB GIF.

## Backlog (in order, updated 12:34)
1. **Land briefs 080–085** — review all six diffs → gates (vitest, typecheck, build, shots at desktop+390px) → commit/push. [lead] IN PROGRESS, workers running; build red until store lands.
2. **AI review fixes** (brief 085) — 1 High + 5 Medium; must pass before deploy. [lead]
3. **Deploy by 13:00** — abuse guard first, then Vercel. [owner+lead] BLOCKED: owner owes Vercel yes + env values.
4. **`submission.ts` values** — track, tagline, description, inspiration, implementation. [owner] TBD stays TBD until owner decides.
5. **Rewrite `web/e2e/demo/steps.ts`** for the real journey (still TBD placeholders). [lead] Before the 14:30 recording.
6. **Demo video by 14:30** — recording pipeline verified end-to-end (placeholder steps); rewrite `steps.ts` (item 5), re-record, owner uploads unlisted and pastes the link (submission item 5). [lead+owner]
7. **Demo-video CI follow-ups** — owner unblocks StillNotBald Actions billing (Settings → Billing & plans), then re-run the workflow; add `OPENAI_BASE_URL`/`OPENAI_API_KEY`/`QWEN_MODEL` repo secrets for live AI in the CI video (optional; plain fallback works without); check bot commit, release mp4 and README GIF render. [owner+lead]
8. **PWA PNG icons** — Chromium now installed, generation unblocked. [lead]
9. **Qoder usage slide** — run `scripts/qoder-usage.mjs`; state honestly that builder-agent runs are not in `.qoder-runs` and are undercounted. [lead]
10. **Form submitted by 14:45**; rehearse pitch with `docs/DEMO-SCRIPT.md`. [owner+lead]
11. **Public-readiness scrub** (review Part B) + owner yes before the repo goes public. [lead+owner] After submission.
Read `AGENTS.md`, `web/AGENTS.md`, `docs/SUBMISSION.md`, `research/02-winning-patterns.md` (sections 1 and 2), `web/playwright.config.ts` and `web/e2e/shots.spec.ts` first. Check the installed Playwright docs under `web/node_modules/@playwright/test` for the video options.

## Job
Submission item 5 is a demo video, and the live pitch needs a backup video open in another tab. Make the video reproducible: one command records the demo journey with Playwright.

## Files you own (create only these)
- `web/playwright.demo.config.ts` (separate from the screenshot config; do not edit `playwright.config.ts`)
- `web/e2e/demo/demo.spec.ts`
- `web/e2e/demo/steps.ts`
- `docs/DEMO-SCRIPT.md`

## Recording
- One project, Chromium, viewport 1280 by 720, `video: { mode: "on", size: { width: 1280, height: 720 } }`, `launchOptions.slowMo` 250, `workers: 1`, output to `web/demo-video/`. `testDir: "./e2e/demo"` so the screenshot run never picks it up.
- Same `webServer` shape as `playwright.config.ts` but port 3211.
- `steps.ts` exports an ordered list of steps: `{ say: string; run: (page) => Promise<void>; holdMs: number }`. `say` is the narration line for that step. Start with two placeholder steps (open `/`, hold; open `/pitch`, press ArrowRight five times) because the real journey is not decided. The lead rewrites the steps after the idea is chosen.
- `demo.spec.ts` plays the steps, shows each `say` line as a caption bar at the bottom of the page (inject a fixed element with the look from `AGENTS.md`: white glass bar, black text), and after the test copies the video to `web/demo-video/demo.webm`.
- A test title that says what it records.

## `docs/DEMO-SCRIPT.md`
The 3-minute pitch shape from the research: 30 s one named user and their pain, 90 s live journey with the wow in the middle, 30 s feasibility, 30 s next. Leave every product line as `TBD`. Add a "When the live AI call fails" section: switch to the backup video tab, say one prepared sentence. Add a 10-line pre-pitch checklist (tabs open, video tab, phone on hotspot, battery, fallback data loaded).

## Check
Do not run Playwright or a build (other workers share the build folder). Run `npm run typecheck` in `web/` and report the result. The lead records the first video after this wave.

## Rules
No git. No installs. Do not edit `package.json`, `playwright.config.ts` or any file not listed. End with a report under 150 words.

Read `AGENTS.md` (repo root) and `web/AGENTS.md` first. The app is in `web/` (Next.js 16, TypeScript, `src/` dir, alias `@/*`). `vitest` 5 and `@playwright/test` 1.65 are already installed; `package.json` already has `test` (`vitest run`), `typecheck` and `shots` (`playwright test`). Check the installed versions' own docs under `web/node_modules/` for config shape.

## Job
The test and screenshot harness. Config only.

## Files you own (create only these)
- `web/vitest.config.ts`
- `web/playwright.config.ts`
- `web/e2e/shots.spec.ts`
- `web/e2e/routes.ts`

## `vitest.config.ts`
- Node environment, includes `src/**/*.test.ts` and `src/**/*.test.tsx`, excludes `e2e/**` and `node_modules`.
- Alias `@` to `./src`.
- `pool` settings that cap workers at 2.

## `playwright.config.ts`
- `testDir: "./e2e"`, `workers: 1`, `retries: 0`, reporter `list`.
- Two projects: `desktop` (Chromium, viewport 1280 by 800) and `phone` (Chromium, viewport 390 by 844, `deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`).
- `webServer`: command `npm run build && npm run start -- -p 3210`, url `http://127.0.0.1:3210`, `reuseExistingServer: false`, timeout 180000. `use.baseURL` the same url.
- Output folder `test-results`.

## `e2e/routes.ts`
Exports `export const routes: { name: string; path: string }[] = [{ name: "home", path: "/" }]`. The lead adds routes later.

## `e2e/shots.spec.ts`
For every route: go to the path, wait for `networkidle`, assert the page has no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`), collect console errors and assert there are none, and save a full-page screenshot to `shots/<project name>/<route name>.png` under the repo's `web/` folder.

## Rules
No git. No shell commands. No other file (do not edit `package.json`). End with a report under 100 words.

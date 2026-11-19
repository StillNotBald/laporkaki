Read `AGENTS.md`, `web/AGENTS.md`, `docs/SUBMISSION.md` and `web/src/content/submission.ts` first. Use the impeccable skill and follow `.qoder/rules/skills.md` (read `craft-floor.md` before any UI edit).

## Job
The pitch deck as a route in the app: `/pitch`. Its link becomes submission item 4 (`<deploy URL>/pitch`). The theme and idea are not decided, so every value comes from `submission.ts` and a `TBD` shows as a quiet grey "TBD" chip, never invented text.

## Files you own (create only these)
- `web/src/app/pitch/page.tsx` (server component, renders the deck)
- `web/src/components/deck/Deck.tsx` (client component: navigation)
- `web/src/components/deck/slides.ts` (builds the slide list from `submission`)
- `web/src/components/deck/slides.test.ts`

## Slides, in this order (from `docs/SUBMISSION.md`)
1. Team name (big), project name under it
2. Track chosen
3. Solution name and the one-line problem (`project.tagline`)
4. Tech stack (`techStack` as a short list)
5. Qoder usage (`qoderUsage.stats` as 3 to 4 big number tiles plus `summary`; if empty, one TBD chip)
6. Live demo: a big "Open the app" button to `/`, and a smaller "Backup video" link to `links.demoVideo` (hidden when TBD)

## Behaviour
- One slide fills the screen. Desktop: 16:9 stage centred. Phone (390px): readable, no horizontal scroll.
- Next/previous: arrow keys, space, PageUp/PageDown, click on the right/left half, swipe on touch. `Home`/`End` jump. A small "3 / 6" counter. The URL hash (`#3`) keeps the slide on reload.
- Print (`window.print`) gives one slide per page, so the deck can be saved as PDF.
- Look: white, black text, glass panels, one macOS-blue accent, at most four type sizes, big type, few words. Reuse `web/src/components/ui` (Card, Pill, Button) and the tokens in `globals.css`. No new colours.
- Respect `prefers-reduced-motion`.

## Test
`slides.test.ts`: six slides in the order above; a TBD value becomes a `tbd: true` field, not text; the demo slide hides the video link when it is TBD.
Run `npx vitest run src/components/deck` and `npm run typecheck` in `web/` and report the results.

## Rules
No git. No installs. Do not edit `submission.ts`, `e2e/routes.ts`, `package.json` or any other file. End with a report under 150 words.

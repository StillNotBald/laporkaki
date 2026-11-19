# Submission: the 7 items (QodeFest 2026)

Source: the owner, from the 11:00 briefing, 2026-11-19. Every agent reads this before any work on the deck, video, README, deploy or copy.
`TBD` = not decided yet. Never invent a value for a `TBD`: leave the placeholder and say so in your report.

## Timeline (today, MYT)

| Time | What |
|---|---|
| 11:50 to 15:00 | Build sprint, demo prep, submission (all 7 items in before 15:00) |
| 15:00 to 16:00 | Pitching to judges |
| Our cut-offs | Deploy URL live by **13:00**. Feature freeze **14:15**. Demo video recorded **14:30**. Form submitted **14:45**. |

## Owner decisions (11:35)

- **Idea:** a real website. A person on the road snaps a photo of a public problem and raises a complaint. AI pinpoints the location, names the actual problem, suggests a fix and vets it, then sends it to the correct body (MBPJ, MBSJ, DBKL and so on) or to the public. The backend counts tickets raised and solved and how efficient each council is. Volunteers who fix an issue can raise money; the public donates.
- **Name:** LaporKaki.
- **Demo cut:** core loop (snap, AI result, send, council inbox closes it, public dashboard: raised, solved, speed per council) plus ONE volunteer and donate screen with pledges.
- **Data:** demo data only. Seeded tickets in the app; a new report is kept on that device (browser storage). No database.
- **Sending:** a council inbox screen inside LaporKaki. Nothing reaches a real council. The pitch says "next: plug into SISPAA and council systems".
- **Defaults (no owner answer needed):** location = browser GPS, then reverse geocoding, then the user can correct the council; donations = pledges only, no real money; language = English with Bahasa Malaysia labels where cheap.
- **Screens (owner, ~12:15, “approve and go”):** the seven-screen grouping and `sent → in_progress → fixed` lifecycle in `proposal/FLOW.md` §4/§6 are approved. Build contract: `docs/CONTRACT.md`.

## The 7 items

| # | Item | Value now | Where it comes from |
|---|---|---|---|
| 1 | Team name | Overclock (confirm) | Owner |
| 2 | Project name, description, track | LaporKaki, TBD, **Reimagine Malaysia** (owner confirmed ~12:35) | Owner picks after the AHA drawings. Theme found in public posts: "Reimagine Malaysia" (confirm the track list) |
| 3 | Implementation and inspiration | TBD | Drafted from the AHA stories (inspiration) and the build (implementation). Lives in `README.md` |
| 4 | Pitch deck link | TBD | Separate deck (the in-app `/pitch` route was removed) |
| 5 | Demo video link | TBD | Recorded with `npm run demo:video` (Playwright), owner uploads it (unlisted) and pastes the link. CI auto-record is blocked by GitHub Actions billing (owner account); record locally instead |
| 6 | Deployment link | https://laporkaki.stillnotbald.com | Cloudflare Workers (OpenNext), AI on, all routes smoke-tested |
| 7 | GitHub link | https://github.com/StillNotBald/laporkaki | Public |

**Build status (12:58):** all seven screens + store + analyse route built, reviewed and gates-green (96 tests, typecheck, build, shots viewed). Deployed to Vercel production; AI env values pending owner, manual fallback active until then. Work branch `feature/laporkaki-build` carries the wave at owner request; `main` carries it too. Living backlog and who-does-what-by-when: `docs/BACKLOG.md`.

## Pitch rules (item 4)

- Time: **3-minute presentation + 2-minute Q&A** (owner confirmed, 2026-11-19). Build the deck for 3 minutes of talking; rehearse Q&A answers from `docs/DEMO-SCRIPT.md`.
- The deck must show, in this order:
  1. Team name
  2. Track chosen
  3. Solution name (and the problem in one line)
  4. Tech stack
  5. Qoder usage (numbers from `docs/QODER-USAGE.md`: briefs, workers, models, credits)
  6. Live demo (the slide hands over to the app; the backup video is linked here)
- Few words per slide, big type, the look in `AGENTS.md`. Every value comes from `web/src/content/submission.ts`, never typed into a slide.

## What judges likely score (proxy, not confirmed for QodeFest)

Sibling Qoder hackathon (Singapore 2026): Use of Qoder 30%, Innovation 25%, Impact 20%, Technical execution 15%, Presentation 10%. So: show real Qoder usage, solve one clear Malaysian everyday problem, have something working inside 90 seconds, keep a backup video open. Details: `research/01-event.md`, `research/02-winning-patterns.md`.

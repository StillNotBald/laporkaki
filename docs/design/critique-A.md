# Critique A: design review of LaporKaki

Method: impeccable critique, Assessment A. The detector was not run. Browser pass ran with Claude in Chrome at 390 px and 1280 px for /, /report, /report/review, /inbox, /dashboard, /help, /pitch and a ticket page. `/ticket/D-001` and `/ticket/D-002` threw "page couldn't load" and "Internal Server Error", and `/inbox` once answered "The preview is starting". A retry of `/ticket/D-001` returned 200 and `/inbox` rendered. The ticket screen was judged from `web/shots/phone/screen-04-ticket.png`. The dev server is flaky: warm it before the demo.

## Design-specificity verdict

Not specific. Swap "LaporKaki" for any other app name and the UI still fits: white page, one blue pill, a gray line drawing, a three-column table. Nothing says Malaysia, public roads, a council or a citizen. The product has a strong visual hook (a real photo of a real pothole, a real place, a real council name) and the UI hides it behind grey placeholder drawings. The owner's "ugly" is a fair read: it is not broken, it is anonymous and washed out.

## Why it feels ugly (root causes)

1. Everything is the same pale blue. The primary button, the status pills, the table header, the notice, the tab highlight and the timeline chips all use `accent-tint` (`#e8f2ff`). Nothing is the accent. The primary action (`Button.tsx`, `ActionLink.tsx` "primary") is a pale-blue pill with black text, so it reads like a disabled or secondary control. In sunlight it vanishes on white.
2. The hero is a grey vector blob (`PhotoFrame` scene "road") that looks like a placeholder, labelled "Sample photo . drawing". It takes the biggest block on the home screen and says nothing.
3. Glass is invisible. The page is plain white, so `.glass` (white at 86% over white) has nothing to blur. Cards look like flat boxes with a faint shadow. Glass only shows on the fixed tab bar and footer.
4. Hierarchy is flat. Display 32 px bold is followed straight by 16 px muted text. Most content sits at 13 px caption in grey (`text-muted` `#5c5c61`). Small grey text carries the real information (place, council, severity).
5. Desktop wastes the screen. `Shell` draws a 390 px phone frame (`md:w-[390px] md:h-[844px]`) on a pale gradient. At 1280x800 the frame is cut off and shows only about 280 px of content in a short window. The dashboard, the thing judges want to see, is never given room.

## Per-screen, one line each

- `/` Home: grey blob hero, pale-blue button that does not look like the main action, a "Sent > In progress > Fixed" card that repeats what the timeline shows later, and a quiet "Council inbox" link that is staff-only and does not belong on the citizen's first screen.
- `/report`: the "Take photo" and "Choose photo" glass buttons and the grey drawing share one weight, so the choice is unclear; "Use the sample photo" is a blue text link that is the only path in a demo and looks like an afterthought.
- `/report/review` (direct visit): an empty state with a lone pale pill; the real AI draft screen (362 lines) is the key moment and is only reachable after a photo, so it was judged from code, where it has the most fields of any screen.
- `/ticket/[id]`: the cleanest screen; fine, but the status pill, the timeline dot and the bottom button are all pale blue, and the "inbox" button sends a citizen to a staff screen.
- `/inbox`: a plain list of titles with pills; no council logo, no photo thumb, no sense of an officer's work queue; it looks like the citizen list.
- `/dashboard`: a three-row table at 13 px with "Median days" as the only speed measure; the headline numbers (raised, solved, speed) are buried in a table, no bar, no big figure, and a notice and an explainer card add words around three rows.
- `/help`: two jobs on one screen (a case summary, a pledge form with a checkbox and a number field); the form runs below the fold.
- `/pitch`: bold "Overclock" on white, correct and clean, but empty; the big type is the only graphic.

## Nielsen heuristics (0-4)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Good "Sent / In progress / Fixed" timeline. But the AI wait and the send moment have no strong confirmation state; dev server errors show a bare error page. |
| 2 | Match with real world | 3 | Plain words, "Lapor" and council codes are right. "Median days" and "Raised" are insider terms. |
| 3 | User control and freedom | 2 | Few clear back paths; "Council inbox" link on home leaps to a different role. |
| 4 | Consistency and standards | 3 | Components are consistent. Too consistent: every control looks the same, so nothing signals primary versus secondary. |
| 5 | Error prevention | 3 | Photo-and-place gate and a pledge "I understand" checkbox are sound. |
| 6 | Recognition over recall | 3 | Three-tab bar, labels on icons. Tab bar disappears on report flow (right). |
| 7 | Flexibility and efficiency | 2 | Sample photo path is a small link; no shortcut for returning users. |
| 8 | Aesthetic and minimalist design | 2 | Few words, yes, but also few signals: all pale blue and grey. Minimal without being designed. |
| 9 | Error recovery | 2 | Fallback messages exist in AI code; the UI route errors are raw. |
| 10 | Help and documentation | 2 | A "What the numbers mean" card and notices cover it, in 13 px grey. |
| | Total | 24 / 40 | Acceptable; real work needed in look, not in structure. |

## Cognitive load

Checklist failures:
- Single focus: home carries a title, a hero, a button, a caption, a card, a link and a footnote (seven blocks) for one job.
- Visual hierarchy: three levels of grey caption text compete.
- Chunking: help screen mixes case, pledge, safety notice and checkbox.
- Minimal choices: no screen has more than four visible choices; `/inbox` has a council filter plus a long list.
- Progressive disclosure: demo disclaimers repeat on every screen ("Demo only", "Demo data", "Demo inbox only", "Demo status").

Four type sizes are respected in tokens (13, 16, 20, 32). In use, there are extras: `text-[...]` on pills and the pitch slide display size.

## Emotional journey

- Peak: the AI naming the problem and the council in a moment. The screen is a form of fields, not a reveal. The peak is flat.
- Valley: waiting for the AI and the page-load errors in dev.
- End: "Sent" confirmation and a pale timeline; no sense of "you did something good". Reassurance at "send" is one small caption ("You check the draft before sending") and "No repair time is promised", which is honest but cold.
- Peak-end fix: a single big confirmation (tick, "Sent to MBSJ", ticket number, what happens next) with the one real blue button.

## Strengths

1. Honest, calm tone. "No repair time is promised" and the demo notices build trust.
2. Solid token system and accessible touch targets (44 to 52 px), focus ring, reduced-motion support, tabular numbers in the table.
3. The ticket timeline is the best component on the site: clear, readable, correct.

## Priority issues

### P0 (blocks the demo)
- **Server flakiness on ticket and inbox pages** (500, "preview is starting"). Warm every route before judging and use a production build (`next build && next start`) for the live demo. This is not a design fix but it will cost more than any visual flaw.

### P1
- **No real accent.** Primary actions are pale blue with black text. Fix in `web/src/components/ui/Button.tsx` and `web/src/components/app/ActionLink.tsx`: make primary a solid `bg-accent-deep` (`#0071e3`) with its label in the "ink on tint" colour only if contrast holds; since "never white text" is a hard rule, use the accent as a 2 px blue ring plus a bolder weight, or a strong `accent-tint-strong` fill (`#d3e6ff`) with an accent border of full strength and a leading blue icon. Then reserve `accent-tint` for selected states only (tab, pill) so the primary button is the only strongly blue block on screen.
- **Placeholder hero.** `PhotoFrame` scene art on `/` and `/report` looks unfinished. Replace the home hero with one real, licensed or self-shot pothole photo (cropped 16:10) in `web/public/`, and drop the "Sample photo . drawing" caption. If no photo is possible, shrink the drawing to a small tile and lead with the headline and button.
- **Dashboard has no headline numbers.** In `web/src/app/dashboard/page.tsx` put three big figures first (total raised, total solved, median days), then the per-council table with a thin blue bar for solved over raised in each row. Drop the "What the numbers mean" card into a one-line caption. This is the screen a judge looks at for 10 seconds.

### P2
- **Glass shows nowhere.** Give the page a very light tinted backdrop (the `md` radial gradient already exists in `Shell.tsx`; use a soft blue-white gradient on phone too, behind the cards) so the `.glass` panels read as glass. Keep text black.
- **Desktop shell wastes the screen.** In `Shell.tsx`, let the dashboard, inbox and pitch use a wide layout at `md:` and above (max-w 960 px, two columns) and keep the phone frame only for the citizen flow, or keep the frame but make it `h-[min(844px,calc(100dvh-2rem))]`.
- **Role mix-up.** Remove the "Council inbox" link from home (`web/src/app/page.tsx`) and from the ticket footer; move inbox access to a small "Council view" item in the header label, so a citizen never lands in a staff screen.

### P3
- Repeated "Demo" disclaimers: keep one persistent label in the header (`AppHeader`) and delete the rest.
- Caption text at 13 px muted carries key facts (place, council): raise ticket meta lines to 16 px and use `ink-2`.
- Pitch slide: add one image (the real pothole photo) next to the big title.

## Persona red flags

- **First-time citizen on a phone in the sun.** Pale-blue primary button on white fades out; 13 px grey meta text is unreadable outdoors; the photo choice needs two taps before anything happens; "Lapor" is not explained to non-Malay readers.
- **Council officer.** The inbox is a list with no photo, no map, no priority sort; severity is buried in a grey line; nothing says "what should I do first". No way to see the AI's suggested fix without opening each ticket.
- **Judge for 90 seconds.** Opens the link, sees a grey blob and a pale button; the AI "wow" is not on the first screen; the dashboard is a small table; the desktop view is a phone frame with space on both sides; a 500 error on a ticket link would end the demo.

## Minor observations

- Brand mark and wordmark are fine but small; the header is compact as required.
- Tab bar is a good pattern; the active state (pale blue pill) is subtle.
- Status colours (good, warn, bad) are present in the tokens but used little; "In progress" in orange and "Fixed" in green on pills would add the needed signal.
- No dark mode: acceptable for sun-readable phone use.
- Notices use `accent-tint` fill for info and sit directly above the content, adding noise.
- Footer buttons on ticket and review are pinned in a glass bar: good.

## Provocative questions

1. If the demo had one real photo of a real pothole on the home screen and nothing else, would you still need the rest of that screen?
2. Is the dashboard for citizens or for councils? A judge reads it as a scoreboard, so should it show who is slowest in one big line?
3. What if "Sent" were the climax: a full-screen, one-colour confirmation with the council's name, instead of one more card in a list?

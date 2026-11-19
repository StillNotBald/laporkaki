Read `AGENTS.md`, `docs/SUBMISSION.md`, `docs/QWEN-CAPABILITIES.md` and `research/02-winning-patterns.md` (sections 1 and 2) first. Follow `.qoder/rules/skills.md`; read `references/recipe.md` for the story, flow and state rules. This is the drawings step: no code.

## The idea (from the owner, her words lightly edited)
A real website. A person on the road snaps a photo of any public problem and raises a complaint. AI pinpoints the location, names the actual problem, suggests a solution and vets it, then sends it to the correct council (MBSJ, MBPJ, and so on) or to the public. The backend records how many tickets were raised, how many were solved, and how efficient each council is. Volunteers who fix an issue can raise money, and the public can donate to them.

Facts you can rely on: our Qwen key reads photos (it read a receipt correctly), does JSON output and tool calls. It cannot generate images, do speech, or do OCR-only models. The browser can give GPS with the user's permission.

## File you own (create only this)
- `proposal/FLOW.md`

## What `proposal/FLOW.md` must contain
1. **Three use-case stories**, one paragraph each, with invented sample people and places in the Klang Valley (no real people): a citizen who reports, a council officer who receives and closes, a volunteer who fixes and gets funded by donors.
2. **The main journey as numbered steps** (citizen: open site, snap, AI result, confirm or correct, send, track, see it fixed), then the council journey and the volunteer and donor journey, each numbered. Every step ends with the ticket status after the step.
3. **Ticket state diagram** in a mermaid `stateDiagram-v2` block: every status, every move, who makes it. Include duplicates (merged into an existing ticket with a "me too" count), not a public problem (refused, with a reason), wrong body (re-routed), and the volunteer path (adopted, funding, fixed, verified by the reporter or the public).
4. **Screen list**: every screen, one line each (who uses it, its one job). Mark the screens in a 3-hour demo cut with `[demo]`.
5. **What the AI does at each step**, as a table: step | input | Qwen output (JSON fields) | fallback when the AI call fails.
6. **Decisions D1..Dn** for the owner, each with 2 to 3 options and a recommendation. Must include: product name (offer 3 short Malaysian-flavoured names), demo cut scope, where data lives, how location becomes a council (GPS plus reverse geocoding vs town lookup vs user picks), whether tickets are really sent to councils in the demo (recommend: no, a council inbox screen inside our app), donations (recommend: pledge only, no real money), language (English with Bahasa Malaysia labels vs both).
7. **The 90-second wow** for the pitch, in 5 lines.

## Rules
Plain words, short sentences. No code. No other file. End with a report under 150 words.

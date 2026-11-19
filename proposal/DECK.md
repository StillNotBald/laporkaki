# DECK DRAFT — LaporKaki, 3-minute pitch + 2-minute Q&A

Skeleton for owner review, 2026-11-19. The `/pitch` shell is built (6 slides, TBD chips); this draft proposes the words. **Nothing here is approved yet.** On approval, the lead copies values into `web/src/content/submission.ts` — never typed into a slide. Evidence: `research/03-routing.md` (03), `04-landscape.md` (04), `05-pilot-apps.md` (05). Talk track: `docs/DEMO-SCRIPT.md`.

Positioning (owner direction, pending formal record): roads first — people already report there — then one-stop layer for any public problem, any body. Say "one-stop layer", not "super app".

PPTX redesign (owner direction, 2026-11-19): `proposal/LaporKaki-pitch-draft.pptx` focuses on high-level architecture/features. Slide 3 is the architecture flow: report from anywhere (Web · PWA · Widget · API · MCP) → AI triage + routing engine → ticket lifecycle (council inbox) → public dashboard. Slide 4 = numbered stack layers (Experience / Intelligence / Trust). Slide 5 = build pipeline (Brief → Worker → Gate → Ship) + big TBD numbers. Design system: type scale 48/22/14/11, left-aligned editorial titles, one composition per slide (no repeated card-row template), blue flow arrows and timeline spine, hairline rule + footer on every page. Single-column flow kept for phone reading.

Emphasis pass (owner direction, 2026-11-19): really sell the problem, the gaps, and why both sides adopt. Slide 2 = today's broken citizen journey as a 5-node friction pipeline (Guess agency → Register → Pick category → Wait months → "Selesai") + evidence stats (2/3 wrong agency · 2.3/5 · 4+ months). Slide 3 = explicit "Gaps no one closes" line (AI triage · all-problem routing · public fix clock · honest closure) above the architecture, each band labelled with the gap it answers. Slide 6 = two-sided adoption case (People come / Agencies come, with proof numbers) + a three-objective close in a glass panel (Break the silos · Both sides stay · Action, not silence — owner's three objectives, 2026-11-19) + bottom line: Next PJ pilot/SISPAA plug-in, Roadmap blocker reasons + escalation ladder (reminder → SISPAA/PCB → ADUN/MP).

Judge pass (official criteria photo, 2026-11-19 — five cards, same for prelim + final, no weights published): AI & Intelligent Systems · Technical Implementation · Execution & Product Readiness · Qoder Utilisation · Presentation & Teamwork. Applied: S1 cover now shows the real phone screenshot (`web/shots/phone/home.png`, framed) instead of the decorative rings, plus the wedge line "Roads first — people already report there. Then any public problem, any body."; S3 engine band shows an example AI output ("pothole · high · patch → MBSJ … every guess editable"); S5 caption names the team roles (lead plans + reviews, workers build, owner decides); S6 close line 1 carries the impact number (2/3 misrouted → first-time-right) and the footer line states readiness ("Live today: 7 screens on demo data · council inbox simulated"). Still open: S5 real numbers (run `scripts/qoder-usage.mjs`, lead/owner), a documentation-evidence line on S5 (research docs · journey map · briefs · reviewer reports), and the finalisation pass (DRAFT footers, TBD chips) after owner approvals.

## Slide 1 — Team (0:00–0:10)

- On screen: **Overclock** (big) · LaporKaki under it.
- Say: "We're Overclock. This is LaporKaki — your kaki for reporting public problems."
- Values: `team`, `project.name` — already set.

## Slide 2 — Track (0:10–0:20)

- On screen: **Public Good** (proposed; `track` is TBD — owner said "public good" in the brief; confirm the official track list wording). Below it, today's broken citizen journey as a friction pipeline: Guess agency (2/3 guess wrong) → Register (SISPAA login wall) → Pick category (10 fixed boxes) → Wait months (4+ months stuck) → "Selesai" (nothing fixed). Stats band: 2/3 wrong agency · 2.3/5 MyJalan iOS · 4+ months "Dalam proses". Hook: "What would make people report — and agencies answer?"
- Say: "Public good: the problem is not that Malaysians don't report. It's that reports die in silos."
- Value: `project.track` — needs owner confirm, then fill.

## Slide 3 — Solution + problem (0:20–0:50)

- On screen (revamped 2026-11-19 on owner request: bigger type, clearer layout): title **How LaporKaki works** + tagline *"One photo. The right body. A public fix clock."* + gap line *"The gaps no one closes: AI triage · all-problem routing · public fix clock · honest closure"*. Three numbered glass columns, step names at 22pt: **1 Snap** (photo + place, no login, no picker; Web + PWA today, widget/API/MCP intake marked roadmap), **2 AI triage** (names problem, severity, possible fix; suggests the right body, every guess editable), **3 Fix clock** (sent → in progress → fixed, public per ticket; dashboard raised/solved/median days per body). Worked-example strip at 22pt: *"Pothole · high · patch → MBSJ — every guess editable"* with a 14pt routing line (streetlight → TNB · water → Air Selangor · traffic light → JKR · eight bodies, one inbox). Body copy bumped from 11–14pt to 14–22pt; KDEB/IWK dropped because they are not in the 8-body routing.
- Font standardisation (2026-11-19): every text run and the theme heading/body fonts are Helvetica Neue; exactly four sizes deck-wide (48/22/14/11).
- Three facts under it (proposed, pick at most two on screen):
  - 2/3 of MyJalan road complaints went to the wrong agency (03 §3, Astro Awani).
  - MyJalan iOS: 2.3/5 — reviews say "Selesai" with "contact JKR or TNB" (04 §4).
  - JagaApp 500+ neighbourhoods prove the report→fix habit — it just stops at the gate (05 §B).
- Say (30 s): the persona pain — "A pothole in Subang Jaya. Who fixes it? Council? JKR? TNB? Today you guess, register, and wait. Two-thirds guess wrong. LaporKaki: snap a photo, AI names the problem and the right body, you confirm, and everyone watches the fix clock."
- Value: `project.tagline` — proposed above, owner picks.

## Slide 4 — Tech stack (0:50–1:05)

- On screen: existing `techStack` list (Next.js 16 + React 19, Tailwind 4, Qwen qwen3.8-flash/qwen4-max, built with Qoder CLI workers).
- Say (15 s): "Qwen flash reads the photo and routes it in about a second. Server-side key, timeout, retry, and a manual fallback — the report never dies if AI fails."
- No new values; do not promise "one second" on stage (FLOW.md rule) — say "about a second, measured on our key" only if asked.

## Slide 5 — Qoder usage (1:05–1:30)

- On screen: 3–4 big number tiles from `docs/QODER-USAGE.md` (run `node scripts/qoder-usage.mjs` to refresh) + one-line summary.
- Proposed summary (owner approves): "Qoder CLI workers built LaporKaki in waves — research, drawings, code, review — from one brief each."
- Say (25 s): briefs → workers → gates (tests, typecheck, screenshots at 390px and desktop); lead reviews every diff. Numbers must come from the script, never hand-typed.
- Values: `qoderUsage.stats`, `qoderUsage.summary` — TBD until the script runs and owner approves the line.

## Slide 6 — Live demo (1:30–2:50) + close (2:50–3:00)

- On screen: big "Open the app" button + backup video link (hidden while TBD).
- Live journey (80 s, per FLOW.md §8, approved demo cut): pothole in SS15 → photo + GPS → AI suggests MBSJ, editable → send → demo officer marks in progress → fixed → public dashboard updates (raised/solved/median days per council) → 10-second glance at the volunteer + pledge screen ("a promise, not a payment").
- Breadth line while dashboard is up: "Same flow for a streetlight → TNB, a burst pipe → Air Selangor, dumping → KDEB. Seeded tickets show it; the AI picks the body, you never guess."
- Close (10 s, owner approved 2026-11-19): the three objectives, one line each, on screen in a glass panel — **"Break the silos.** One photo, the right body — every agency, one inbox. **Both sides stay.** Fixed alerts for people; a public scorecard for agencies. **Action, not silence.** Fix clock, blocker reasons, escalation with teeth." Say them verbatim, then: "Next: one pilot council in Petaling Jaya, plugged into SISPAA so no report dies."
- Adoption case on screen (emphasis pass): **People come** — no login · shareable ticket · fixed alert; proven habit: JagaApp 500+, iNeighbour 650+. **Agencies come** — zero-signup inbox · pre-routed tickets (Buckinghamshire: email £7.12 vs 9p/report) · public scorecard · SISPAA fallback.
- Bottom line on screen: **Next:** PJ pilot · SISPAA plug-in. **Roadmap:** blocker reasons on stalled tickets (budget · jurisdiction · scheduled — the public sees *why* nothing moves) · escalation ladder: reminder → SISPAA/PCB → ADUN/MP. Legal backing for Q&A: Taman Sri Muda residents won a negligence suit vs government/JPS/MBSA (29 Sep 2026, 05); the ticket timeline is the evidence trail. DIY fixes on public roads are not permitted (03 §5) — route to authorised fixes only. Roadmap, not built; never imply it is live.
- Open-layer line (owner direction, 2026-11-19): the phone is one intake medium, not the product. No download — the live dashboard is a public web URL. Roadmap ladder: read API + embed widget (resident apps like JagaApp/iNeighbour, community sites plug in) → write API for councils/SISPAA (needs auth + abuse guards + moderation) → MCP server (`report_problem`, `ticket_status`, `council_stats`) so any AI assistant can file and query reports. All roadmap unless the lead builds the cheap read-only endpoint before freeze; never imply a live integration.
- If live AI fails: switch to backup video tab, one prepared sentence (DEMO-SCRIPT.md). Never debug on stage.

## What the deck deliberately does NOT show

Gamification, dedup/"me too", QR stickers, real integrations, real money — roadmap and Q&A only (`docs/DEMO-SCRIPT.md` Q&A section). Demo data is labelled on every screen; no real partnership is implied.

## Owner decisions to fill the TBDs

| # | Decision | Recommendation |
|---|---|---|
| 1 | `project.track` wording | "Public Good" — confirm against the official track list |
| 2 | `project.tagline` | "One photo. The right body. A public fix clock." |
| 3 | `project.description` (item 2, not a slide) | Draft after tagline approval; 2–3 sentences from FLOW.md stories |
| 4 | `qoderUsage.summary` | Line proposed on slide 5; stats from the script |
| 5 | Record roads-first → one-stop positioning in `docs/SUBMISSION.md` | Yes — one line under owner decisions |
| 6 | Pilot naming in close | "Petaling Jaya (MBPJ) — simulated inbox, no partnership" (05 §C) |

## Build notes for the lead (after approval)

- Only `submission.ts` values change; `slides.ts`/`Deck.tsx` stay as they are unless a slide needs a facts row (slide 3) — that is a small, named-file edit with the impeccable skill, tests + typecheck + screenshots after.
- Refresh Qoder numbers last (cut-off: form 14:45); re-run the script after the final wave.
- Rehearse with a timer: 3:00 hard stop. The 90-second wow target in FLOW.md §8 plus slides 1–5 fits 3:00 with ~10 s slack.
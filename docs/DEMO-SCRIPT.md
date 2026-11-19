# Demo script and pitch shape

Source of the shape: `research/02-winning-patterns.md` §1 (Socia 3-minute pitch). All product lines are `TBD` until the owner picks the idea (`docs/SUBMISSION.md`). Nothing here invents a value.

## Record the backup video (one command)

From `web/`:

```bash
npx playwright test --config playwright.demo.config.ts
```

- Builds and starts the app on port 3211, records Chromium at 1280x720 with 250 ms slow motion.
- Plays the ordered steps in `web/e2e/demo/steps.ts`; each step's `say` line appears as a caption bar in the recording.
- Output: `web/demo-video/demo.webm` (plus raw per-test videos in the same folder).
- The steps are placeholders (open `/`, then `/pitch` with five ArrowRight presses). The lead rewrites `steps.ts` after the journey is decided; the config and spec stay as they are.
- `docs/SUBMISSION.md` names `npm run demo:video`; that script still needs to be added to `web/package.json` by the lead (workers may not edit it).
- Cut-off: video recorded by **14:30**, owner uploads unlisted and pastes the link into item 5.

## The 3-minute pitch

### 0:00–0:30 — One named user and their pain (30 s)

- User: TBD (one named persona, one everyday Malaysian problem).
- Pain in one sentence: TBD.
- Say the problem before showing any screen. No tech words yet.

### 0:30–2:00 — Live journey, wow in the middle (90 s)

- Something working on screen within the first 90 seconds of the whole pitch.
- Journey: TBD, 5–7 steps, mirroring `steps.ts`. Pre-fill every form; no empty states, no typing long text live.
- Wow moment (around 1:15): TBD — it acts, not just answers; fast at something slow today.
- Narrate what the user gets, not what the code does.

### 2:00–2:30 — Feasibility (30 s)

- Cost per run / per user: TBD.
- Where the data comes from and who owns it: TBD.
- Who pays: TBD.

### 2:30–3:00 — Next (30 s)

- The one next step after today: TBD.
- Close on the user's gain, in one line: TBD.

## The 2-minute Q&A (owner confirmed 3+2 format, 2026-11-19)

Expect 2–4 questions. Answer in one or two sentences, then stop. Evidence lives in `research/03-routing.md`, `04-landscape.md`, `05-pilot-apps.md` — cited below as 03/04/05. Never claim a real council partnership; the inbox is simulated.

1. **"How is this different from MyJalan or SISPAA?"** — MyJalan is roads-only and its own app-store reviews describe reports closed as "Selesai" with "contact JKR or TNB" (2.3/5); SISPAA needs registration and has no public dashboard. We do AI photo triage across all problem types, route to the right body, and show a public fix clock. No platform found doing AI triage that removes the category picker (04 §1–§3).
2. **"Will councils actually use it?"** — FixMyStreet grew by sending councils reports with zero signup; councils adopted it later. i-Clean proves a Malaysian operator app with a hard SLA gets 150k users and ~98% on-time fixes. We start with one willing council and keep SISPAA as the escalation fallback so no report dies (04 §5, 05 §A).
3. **"How do you get the public onboard?"** — Malaysians already use resident-reporting apps: JagaApp 500+ neighbourhoods, iNeighbour 650+ communities — the loop just stops at the gate. Every ticket is a shareable public page; "your report got fixed" is the retention hook. Gamification (Waze-style, rewards gated on verified fixes, not report volume) is on the roadmap (05 §B, 04 §5).
4. **"Won't people spam or game it?"** — Rewards only for verified outcomes ("me too" confirmation, marked fixed), plus moderation; honest answer: moderation at scale is a known gap we'd build with the first council partner (04 §3.7).
5. **"Who pays? Is it sustainable?"** — The responsible body pays, citizens free: iNeighbour charges JMBs RM580–900/month; SeeClickFix sold government CRM. Councils save money — Buckinghamshire: £7.12 per email vs 9p per FixMyStreet Pro report (05 §B, 04 §1/§4).
6. **"What if the AI routes wrong?"** — The user sees and can correct the problem, place and body before sending; the routing table is researched (JKR/TNB/council/utility rules), and SISPAA is the fallback. Flash model answers in about a second with a plain fallback message (03 routing table, AGENTS.md AI rules).
7. **"Can volunteers just fix things themselves?"** — No DIY road works: KL fixers were ordered to stop in 2014, and public collections need permits (Act 200). Pledges route to authorised bodies only; no real money in the demo (03 §5).

If a question has no researched answer: say "we haven't verified that yet" — never invent a number on stage.

## When the live AI call fails

1. Do not retry live, do not debug on stage. Switch to the backup video tab (already open, see checklist).
2. Say the one prepared sentence: "Let me show you the same journey from our recorded run — it's the identical flow." (TBD: owner may reword.)
3. Play `demo.webm` from the wow moment onward if time is short; keep talking over it.
4. A crash with a recording behind it is a good story; silence is not.

## Pre-pitch checklist (10 lines)

1. Laptop plugged in, battery above 80%, sleep and notifications off.
2. Phone on hotspot, tested; Wi-Fi fallback known.
3. Deploy URL tab open and loaded (item 6 link).
4. `/pitch` deck tab open at slide 1.
5. Backup video tab open, `demo.webm` loaded and seeked to 0:00, sound checked.
6. Demo journey tab open with fallback data pre-loaded and forms pre-filled.
7. One full rehearsal out loud with a timer, under 3 minutes.
8. AI key live-checked in the last 10 minutes; fallback message path tested.
9. Screen sharing shows the right window; captions bar visible in the video.
10. Water, presenter order agreed, who switches tabs agreed.
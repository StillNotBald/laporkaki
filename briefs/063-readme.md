<!-- model: Qwen3.8-Flash -->
Read `AGENTS.md`, `docs/SUBMISSION.md`, `web/src/content/submission.ts`, `docs/QWEN-CAPABILITIES.md`, `docs/QODER-SETUP.md`, `.qoder/agents/*.md` and `scripts/qw.sh` first.

## Job
The GitHub repo is submission item 7, and judges will read the README first. Write it so it is ready the moment the idea is chosen: every product value is a `TBD` placeholder.

## File you own (create or replace only this)
- `README.md` (repo root)

## Sections, in this order
1. Title `TBD project name`, the line `Team Overclock · QodeFest 2026 · Track: TBD`, and a one-line tagline `TBD`.
2. Links table: Pitch deck, Demo video, Live app, GitHub (each `TBD` except GitHub).
3. Inspiration: `TBD`, with an HTML comment saying what goes here (the person and the everyday Malaysian problem).
4. What it does: `TBD` (3 bullets max).
5. How we built it (implementation): the real stack from `submission.ts` `techStack`; the AI part (Qwen through the OpenAI-compatible endpoint on Model Studio, server side only, timeout, retry, fallback); one line on testing (vitest, Playwright screenshots at desktop and phone width).
6. How we used Qoder: true facts only, from the files you read. A lead agent writes one brief per job in `briefs/`; Qoder CLI workers (`qodercli`, Qwen models) build from each brief in parallel, each owning named files; project rules in `.qoder/rules/` and `AGENTS.md`; subagents in `.qoder/agents/` (builder, researcher, reviewer, copy-checker); permission fences in `.qoder/settings.json`; live view `scripts/qw-watch.mjs`. Then "Numbers: see `docs/QODER-USAGE.md`."
7. Run it locally: Node 24, `cd web && npm install`, copy `.env.example` to `web/.env.local` and fill it, `npm run dev`. Tests: `npm test`, `npm run typecheck`, `npm run shots`.
8. Team: `TBD` (names and roles).

## Rules
- Plain English, short sentences, no hype words, no emoji headings.
- Never write a key, an email address, a local folder path, a client or company name other than Alibaba Cloud, Qwen and Qoder, or the names of other private projects.
- No git. No other file. End with a report under 100 words.

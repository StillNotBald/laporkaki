# QodeFest hackathon repo (team Overclock)

One goal: win. This file is read by every agent (Qoder CLI and Claude Code). Keep it short.

## Who does what

- **Lead (a Qoder CLI session since 11:40):** plans, writes briefs, reviews every diff, runs the gates. The lead commits and pushes; deploys go to the owner.
- **Workers (Qoder CLI, Qwen models):** do the build legwork from a brief in `briefs/`. One brief, one job, named files only.
- Workers never run git, never install a dependency the brief does not name, never touch files outside the brief.
- A worker ends with a report under 150 words: files changed, commands run and their result, anything it could not do.

## Submission (the finish line, due 15:00 today)

Seven items: 1 team name, 2 project name + description + track, 3 implementation and inspiration, 4 pitch deck link (5 min per team; slides: team name, track, solution name, tech stack, Qoder usage, live demo), 5 demo video link, 6 deployment link, 7 GitHub link. Current values, cut-offs and pitch rules: `docs/SUBMISSION.md`. Values live in `web/src/content/submission.ts`; `TBD` stays `TBD` until the owner decides.

## Order of work (AHA first)

1. Theme and judging rules in, then **drawings before code**: use-case stories, the user's flow as numbered steps, a mockup of every screen, a state diagram per record, decisions D1..Dn with a recommendation each.
2. The owner answers the decisions. Nothing is built before that.
3. Build contract (decisions, shared interfaces, file ownership), then build in waves.
4. Odd cases decided with the journey map before the screens that depend on them.
5. Gates, screenshots at desktop and 390px, demo script.

## Look

**The full design system is `DESIGN.md` (repo root). Read it before any UI work; it wins over the short list below.**


- White background, black text, glass panels. Never white text. No pink. macOS blue for the one accent.
- Few words. Four type sizes at most. Compact header. One job per screen.
- Phone first (390px), then desktop.
- Plain language on every screen. No jargon, no studio or tool names in the product.

## Find before you build

Order: open source, then the studio component library, then new code. Every brief says what was reused or why nothing fit. Code taken from the library is copied once with its source named in a comment, never imported by path. Never copy client data, client names or secrets.

## AI at runtime

- The product calls Qwen through the OpenAI-compatible endpoint. Read `OPENAI_BASE_URL`, `OPENAI_API_KEY` and `QWEN_MODEL` from the environment, server side only.
- The key never reaches the browser, a log line, a commit or a screenshot.
- Every AI call has a timeout, one retry, and a plain fallback message.
- Measured on our key (`docs/QWEN-CAPABILITIES.md`): only `qwen4-max`, `qwen3.8-max` and `qwen3.8-flash` answer. They take text and images (base64 data URL), tool calls and JSON output. Speech, image generation, OCR-only, translation-only and embedding models return 403: do not design a feature on them.
- Speed: send `enable_thinking: false` unless the step needs reasoning (flash answers in about 0.6 s without it, about 4 s with it). Use `qwen3.8-flash` for anything the user waits on.

## Orchestra profile

- test: `npm test` (set when the stack is chosen)
- typecheck: `npm run typecheck`
- gate: test, typecheck, build, screenshots at desktop and 390px opened and looked at
- rtm: `docs/REQUIREMENTS.md` (lite, written with the plan)
- sprintLog: `docs/log/`
- uiTemplates: `proposal/` (the approved drawings are the template)
- sanitization: no real people, clients or studio names in any tracked file
- notes: Node 24 only. One test suite at a time, `--maxWorkers=2`. No long-running dev server left behind.

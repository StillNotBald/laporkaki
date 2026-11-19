Read `AGENTS.md`, `web/AGENTS.md`, `docs/SUBMISSION.md`, `web/next.config.ts`, `web/package.json`, `.env.example` and everything under `web/src/app/api/` and `web/src/lib/ai/` first. Read the Next.js 16 deployment docs under `web/node_modules/next/dist/docs/` if present. You may use web search for the Vercel docs.

## Job
Submission item 6 is a live deployment link, wanted by 13:00. Prepare a deploy the lead can run in one go. Recommended host: Vercel (the lead's CLI is logged in). Do not deploy.

## File you own (create only this)
- `docs/DEPLOY.md`

## What `docs/DEPLOY.md` must contain
1. Every environment variable the server code reads (grep `process.env` under `web/src`), what it is for, and whether the app breaks without it. Values never appear.
2. The exact commands for the lead, from `web/`: link the project (`vercel link`, project name `qodefest-overclock`), add each env var for production (`vercel env add <NAME> production`, value typed by the owner), `vercel deploy --prod`. Note that Root Directory is `web`.
3. Risks found by reading the code, each with a one-line fix the lead can apply: the streaming route `/api/ai/chat` and Vercel function time limits (how to set `maxDuration` in Next 16 when `cacheComponents` is on and a route must not export `dynamic`); request body size limits for image uploads; anything that only works on localhost.
4. **Abuse guard:** a public URL spends our single team Qwen key. Propose the smallest guard (for example: a per-IP limit in memory on `/api/ai/chat`, a max message and image size, a daily cap) and name the file and function it would go in. Do not write it.
5. A 5-line smoke test to run against the live URL (health route, home page, `/pitch`, one AI call).
6. One short paragraph: deploying on Alibaba Cloud instead (which service, rough time), since judges may favour it. Mark it as an option, not the plan.

## Check
Do not run a build (other workers are editing files and share the build folder); the lead builds after this wave. Read the code instead.

## Rules
No git. No installs. No `vercel` commands. No other file. End with a report under 150 words.

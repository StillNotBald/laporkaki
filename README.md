# LaporKaki

Snap a photo of a public problem. AI names it, rates it, and sends it to the right council. A public dashboard shows how fast each council responds.

## Submission (QodeFest 2026, KL)

1. **Team name:** Overclock
2. **Project:** **LaporKaki**
   - Description: Snap a photo of a pothole, blocked drain or broken streetlight. Qwen AI names the problem, rates how serious it is, suggests a fix and sends it to the right body: MBPJ, MBSJ, DBKL, JKR, TNB or Air Selangor. A public dashboard shows how many reports each council received, how many it fixed and how fast.
   - Track: **Reimagine Malaysia**
3. **Inspiration and implementation**
   - Inspiration: Malaysians see broken roads and drains every day but don't know who to report to (council, JKR, TNB or Air Selangor) and never see what happened next. LaporKaki makes reporting one photo and makes council response times public.
   - Implementation: Next.js 16, React 19 and Tailwind 4. Qwen vision on Alibaba Cloud Model Studio reads the photo and returns the problem, severity, fix and responsible agency as JSON, with a rate limit and an image size cap. Hosted on Cloudflare Workers (OpenNext). Built by parallel Qoder CLI workers, each owning its own files.
4. **Pitch deck:** TBD (link coming)
5. **Demo video:** TBD (link coming)
6. **Live app:** https://laporkaki.stillnotbald.com
7. **GitHub:** https://github.com/StillNotBald/laporkaki

## How it works

1. Take a photo of the problem. GPS fills in the place.
2. Qwen reads the photo and suggests the problem, severity, a fix and the responsible agency. You can edit any of it.
3. Confirm and send. The report lands in that council's inbox as a ticket.
4. The ticket moves through sent, in progress and fixed, with its status history.
5. The public dashboard shows, per council, reports received, reports fixed and how fast.

There is also a volunteer screen where supporters record pledges toward a fix.

Demo data only: the app ships with 60 seeded tickets plus whatever is saved in your browser. Nothing is sent to a real council, and pledges are not real money.

## Tech stack

- Next.js 16, React 19, Tailwind CSS 4
- Qwen vision on Alibaba Cloud Model Studio (OpenAI-compatible API)
- Cloudflare Workers via OpenNext
- Vitest for tests, Playwright for screenshots
- Built with Qoder CLI

## How we used Qoder

The app was built by parallel Qoder CLI workers running on Qwen models. The lead wrote the briefs, reviewed the output and ran the gates.

- `.qoder/agents/`: four agents (builder, researcher, reviewer, copy-checker)
- `.qoder/rules/`: project rules the workers follow
- `briefs/`: one brief per worker, each naming the files that worker owns
- `scripts/qw.sh`: runs one worker on one brief
- `scripts/qw-fan.sh`: runs up to 6 workers in parallel, one per brief

## Run locally

```sh
cd web
npm ci
npm run dev
```

Optional environment variables: `OPENAI_BASE_URL` and `OPENAI_API_KEY` (point them at an OpenAI-compatible Qwen endpoint). Without them the AI step falls back to manual entry.

```sh
npm test
npm run typecheck
```

## Deploy

Cloudflare Workers via OpenNext:

```sh
cd web
npm run deploy:cf
```

Set the secrets first:

```sh
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_BASE_URL
```

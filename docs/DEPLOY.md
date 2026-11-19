# Deploy runbook — submission item 6 (live URL by 13:00)

## Current phone preview — temporary Cloudflare Tunnel

Preview: https://turning-cited-vector-don.trycloudflare.com

- `/` is the current built app (still the scaffold); `/pitch` is the deck; `/screens` is the seven approved screen drawings, not working features.
- AI endpoints and non-GET/HEAD requests are blocked by `scripts/phone-preview.mjs`. Reports and payments are not enabled through this preview.
- This URL works only while the Mac, app, proxy and tunnel remain running. It is not permanent Cloudflare Workers hosting and is not the final submission deployment link.
- Public preview verified in a 390×844 browser: all three pages returned 200; pitch navigation and app handoff passed; all seven drawings fit without horizontal overflow; editable fields worked; no page errors were observed. Screenshots were opened and inspected. A physical phone has not been tested.
- The owner assigned feature/function development to others and requested handover to Qoder Desktop. CLI preview and Git work are complete. Keep the originating CLI open until the owner/Desktop takes over its background preview processes; closing it may stop the temporary URL.

Start each process from the repo root in a separate terminal:

```bash
OPENAI_API_KEY='' OPENAI_BASE_URL='' npm --prefix web run start -- --hostname 127.0.0.1 --port 3212
node scripts/phone-preview.mjs
cloudflared tunnel --url http://127.0.0.1:3213 --no-autoupdate
```

The app must be built first (`npm --prefix web run build`). After a verified feature batch, rebuild and restart only the app on 3212 so the existing tunnel serves the new UI. A restarted quick tunnel gives a new URL. Keep AI blocked until the required guard/review fixes pass. Never put secrets into these commands or documents.

## Original permanent deployment plan

Vercel, Next.js 16.4.6 app in `web/`. The owner approves deployment and enters secrets. No permanent deployment has been made.

## 1. Environment variables (every `process.env` read under `web/src`)

| Name | Required | What it is for | Without it |
|---|---|---|---|
| `OPENAI_BASE_URL` | **Yes** | Base URL of the OpenAI-compatible Qwen endpoint; read server-side in `web/src/lib/ai/qwen.ts` (`readConfig`) | `/api/ai/chat` returns 503 "not set up"; pages still render |
| `OPENAI_API_KEY` | **Yes** | The single team Qwen key; sent as Bearer token server-side only, never to the browser | Same 503; app does not crash |
| `QWEN_MODEL` | No | Default model; falls back to `qwen4-max` (`qwen.ts`, `/api/ai/health`) | Works on the default |
| `QWEN_FAST_MODEL` | No | Model for `fast: true` calls; falls back to `qwen3.8-flash` (`qwen.ts` `buildBody`) | Works on the default |

`DASHSCOPE_API_KEY`, `DASHSCOPE_BASE_URL`, `QWEN_WORKSPACE_ID` appear in `.env.example` but are read only by `scripts/qwen-probe/` — **not needed on Vercel**. Real values live in `a local env file outside the repo` on the owner's Mac; the owner types them at the `vercel env add` prompt. Never paste them into chat, logs or commits.

## 2. Exact commands (lead, from `web/`)

```bash
cd web
vercel link        # scope: the logged-in team; "Set up and deploy?" → No;
                   # link to a NEW project named qodefest-overclock
vercel env add OPENAI_BASE_URL production    # owner types the value
vercel env add OPENAI_API_KEY production     # owner types the value
vercel env add QWEN_MODEL production         # optional; owner types qwen4-max or skips
vercel env add QWEN_FAST_MODEL production    # optional; owner types qwen3.8-flash or skips
vercel deploy --prod
```

- **Root Directory is `web`.** Running the CLI from `web/` makes it the project root automatically. If the project is ever linked from the repo root or via Git integration, set Root Directory = `web` in Project Settings → General.
- Framework preset auto-detects Next.js; build `npm run build`, install `npm install` (`web/package-lock.json` exists). Output `.next` — defaults are fine.
- Set Node.js version to **24.x** in Project Settings → General (repo rule: Node 24 only; `web/package.json` has no `engines` field to pin it).
- Add env vars **before** `vercel deploy --prod`; they apply to the new deployment. The CLI prints the production URL — that is submission item 6, and item 4 is `<URL>/pitch`.
- Owner's yes is needed before the first deploy (`docs/SUBMISSION.md`).

## 3. Risks found by reading the code (each with a one-line fix)

1. **Streaming route vs function time limit.** `/api/ai/chat` (`web/src/app/api/ai/chat/route.ts`) streams the Qwen answer; the function must stay alive for the whole stream. Vercel fluid compute defaults to 300 s on all plans incl. Hobby — enough for the 30 s upstream timeout in `qwen.ts`, but make it explicit. **Fix:** add `export const maxDuration = 60;` to `web/src/app/api/ai/chat/route.ts`. With `cacheComponents: true` (Next 16), `export const dynamic` is **removed** — do not add it; the route already opts into request-time rendering with `await connection()`, and `maxDuration` remains a valid route export (Next 16 route-segment-config docs).
2. **Request body cap vs image uploads.** Vercel caps a function request body at **4.5 MB**. `web/src/lib/ai/image.ts` allows 4 MB images; base64 inflates ~33%, so a max-size image becomes a ~5.3 MB JSON body and Vercel rejects it (413) before the route runs. The chat route currently accepts text only, so this bites when the image wave lands. **Fix:** lower `MAX_BYTES` in `web/src/lib/ai/image.ts` to `3 * 1024 * 1024` (≈4 MB encoded body), or downscale client-side before `toDataUrl`.
3. **Streaming response size.** The 4.5 MB response cap does not apply to streaming responses — the chat stream is safe as written. No fix needed.
4. **Localhost-only behaviour.** None found: the client hook (`useChatStream.ts`) calls the relative path `/api/ai/chat`; all env reads are server-side; no hardcoded `localhost` under `web/src`. No fix needed.
5. **`/pitch` does not exist yet** (brief 060 is building it). The deck link (item 4) 404s until that lands. **Fix:** re-run the smoke test after brief 060 merges, before submitting.

## 4. Abuse guard (proposal — not written)

A public URL spends our single team key. Smallest guard, all in **`web/src/app/api/ai/chat/route.ts`, at the top of `POST`** (before `parseBody`), via one module-level helper, e.g. `checkRateLimit(request)`:

- Per-IP limit: in-memory `Map<string, {count, windowStart}>` keyed by the first `x-forwarded-for` value; e.g. 10 requests/minute → 429 with a plain message.
- Daily cap: one module-level counter, e.g. 500 AI calls/day → 429 "The assistant is resting. Try again tomorrow."
- Message size is already capped (30 messages × 4000 chars ≈ 120 KB max body); keep the image cap from risk 2.

In-memory state is per function instance and resets on cold start — fine for a one-day demo, no new dependency, no external store. Do not log IPs or keys.

## 5. Smoke test against the live URL (5 lines)

```bash
URL=https://<production-url>
curl -s $URL/api/ai/health        # expect {"configured":true,"model":"..."}
curl -s -o /dev/null -w '%{http_code}\n' $URL/        # expect 200
curl -s -o /dev/null -w '%{http_code}\n' $URL/pitch   # expect 200 (after brief 060 lands)
curl -sN -X POST $URL/api/ai/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Say hello in one word."}],"fast":true}'   # expect streamed text
```

Then open `$URL/` in a 390px-wide window and send one chat message — the answer must stream in.

## 6. Option only: Alibaba Cloud (not the plan)

If judges favour Alibaba Cloud, the fit is **Function Compute 3.0** (Web Function / custom runtime, Node 24, Singapore or KL region) running the Next.js standalone server: add `output: "standalone"` to `next.config.ts`, ship `.next/standalone` with a small `server.js`, set the four env vars in the console, and bind an HTTPS domain. Rough time: **1.5–3 hours** (image/server wiring, domain, TLS, cold-start tuning) versus ~10 minutes on Vercel — too risky for the 13:00 cut-off. Keep Vercel as the plan; treat this as a post-submission migration if the owner asks.

## Sources

- Next 16 docs shipped in `web/node_modules/next/dist/docs/`: route-segment-config index (`dynamic` removed under Cache Components; `maxDuration` kept), `maxDuration.md`, `cacheComponents.md`, deploying guide.
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) (4.5 MB request/response body; streaming responses exempt)
- [Configuring Maximum Duration for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/duration)
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby) (fluid compute: 300 s default)
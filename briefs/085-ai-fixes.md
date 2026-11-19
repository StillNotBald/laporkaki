Read `AGENTS.md`, `web/AGENTS.md`, `docs/DEPLOY.md` §3–§4, `docs/CONTRACT.md` row F first. This is backend-only work — no UI, no skills needed.

## Job
Fix every High, Medium and Low finding in Part A of the review, plus the two DEPLOY.md risks that touch your files. One regression test per fix (vitest, property-level: assert the invariant, must fail on the old code).

## Files you own (edit only these)
- `web/src/app/api/ai/chat/route.ts`
- `web/src/lib/ai/qwen.ts`
- `web/src/lib/ai/image.ts`
- `web/src/lib/ai/useChatStream.ts`
- `web/src/lib/ai/qwen.test.ts` (extend; keep existing tests green)

## Fixes (from the review, verbatim intent)
1. HIGH abuse guard: module-level `checkRateLimit(request)` at top of POST — per-IP in-memory Map (first `x-forwarded-for`, fallback "local"), 10 req/min → 429 plain message; daily counter 500/day → 429 "The assistant is resting. Try again tomorrow." No IP/key logging. Also `export const maxDuration = 60;` (keep `await connection()`, never add `export const dynamic`).
2. MED fast default: route uses `fast: parsed.fast !== false`.
3. MED stream retry: `chatStream` gets exactly one retry before the first chunk on retryable failure (mirror `chat()`).
4. MED mid-stream error: on upstream error after streaming started, enqueue one plain fallback sentence before closing (qwen.ts + route + hook agree on the behaviour).
5. MED idle timeout: stream timeout resets per chunk (idle, not total wall time).
6. MED tool errors: `runTools` always returns `TOOL_FAILED_MESSAGE`, never raw `error.message`.
7. LOW body cap: reject Content-Length > 150_000 before parsing.
8. LOW history: require last message role `user`.
9. LOW images: `buildBody` validates every `image_url` part via `checkImage`; lower `MAX_BYTES` in image.ts to `3 * 1024 * 1024` (Vercel 4.5 MB body cap).

## Rules
Keep the server-only guard, no key in logs/errors/bodies, plain localized error strings. Do NOT touch `/api/report/*` or store files (other workers own them). No git, no installs. Run `npx vitest run src/lib/ai --maxWorkers=2` and `npm run typecheck` in `web/`; report honestly. End under 150 words: fixes landed, test counts, anything skipped.
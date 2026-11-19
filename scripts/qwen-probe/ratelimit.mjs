import { call, OAI, out } from './_lib.mjs';
const r = await call(`${OAI}/chat/completions`, { model: 'qwen3.8-flash', enable_thinking: false, max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] });
const h = [...r.headers.entries()].filter(([k]) => /limit|remaining|retry|quota/i.test(k));
out('ratelimit', true, h.length ? h.map((x) => x.join('=')).join(' ') : 'no rate-limit headers returned');

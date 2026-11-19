import { chat, out } from './_lib.mjs';
const model = process.argv[2] || 'qwen3.8-flash';
const q = { model, messages: [{ role: 'user', content: 'Say hi in 5 words.' }], max_tokens: 200 };
const a = await chat(q);
if (!a.ok) out('chat ' + model, false, a.err);
const b = await chat({ ...q, enable_thinking: false });
const s0 = performance.now(); let first = 0, n = 0;
const r = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...q, enable_thinking: false, stream: true }) });
const rd = r.body.getReader(); while (true) { const { done, value } = await rd.read(); if (done) break; if (!first) first = Math.round(performance.now() - s0); n++; }
out('chat ' + model, true, `default=${a.ms}ms thinking_off=${b.ms}${b.ok ? '' : '(' + b.err + ')'}ms stream_first_chunk=${first}ms reasoning_default=${!!a.json.choices[0].message.reasoning_content}`);

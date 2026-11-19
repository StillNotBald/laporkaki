import { chat, out } from './_lib.mjs';
const model = process.argv[2] || 'qwen3.8-flash';
const r = await chat({ model, enable_thinking: false, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: 'Return JSON with keys vendor and total for: Kedai Ah Hock RM 14.00. Output json only.' }] });
if (!r.ok) out('json', false, r.err);
try { const j = JSON.parse(r.json.choices[0].message.content); out('json', true, `${model} ${r.ms}ms keys=${Object.keys(j)}`); } catch { out('json', false, 'unparseable'); }

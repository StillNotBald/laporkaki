import { chat, out, b64, here } from './_lib.mjs';
const model = process.argv[2] || 'qwen3-vl-plus';
const url = 'data:image/png;base64,' + b64(here + '/receipt.png');
const r = await chat({ model, max_tokens: 200, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url } }, { type: 'text', text: 'What is the total and the shop name?' }] }] });
if (!r.ok) out('vision', false, r.err);
const t = r.json.choices[0].message.content; out('vision', /14/.test(t), `${model} ${r.ms}ms "${t.replace(/\s+/g, ' ').slice(0, 80)}"`);

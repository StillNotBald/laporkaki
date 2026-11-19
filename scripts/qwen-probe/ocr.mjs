import { chat, out, b64, here } from './_lib.mjs';
const model = process.argv[2] || 'qwen-vl-ocr-2025-11-20';
const url = 'data:image/png;base64,' + b64(here + '/receipt.png');
const r = await chat({ model, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url } }, { type: 'text', text: 'Read all the text in the image.' }] }] });
if (!r.ok) out('ocr', false, r.err);
const t = r.json.choices[0].message.content; out('ocr', /14\.00/.test(t), `${model} ${r.ms}ms "${t.replace(/\s+/g, ' ').slice(0, 80)}"`);

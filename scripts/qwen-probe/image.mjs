import { dsGen, out, save } from './_lib.mjs';
const model = process.argv[2] || 'qwen-image-3.0';
const r = await dsGen({ model, input: { messages: [{ role: 'user', content: [{ text: 'A flat illustration of a nasi lemak plate, bold colours' }] }] }, parameters: { size: '1024*1024', prompt_extend: false, watermark: false } });
if (!r.ok) out('image ' + model, false, r.err);
const u = r.json?.output?.choices?.[0]?.message?.content?.[0]?.image;
if (!u) out('image ' + model, false, 'no image url; keys=' + Object.keys(r.json || {}));
const img = await fetch(u); const b = Buffer.from(await img.arrayBuffer()); save('gen.png', b);
out('image ' + model, true, `sync ${r.ms}ms (no polling) bytes=${b.length}`);

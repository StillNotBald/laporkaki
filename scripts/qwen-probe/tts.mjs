import { dsGen, out, save } from './_lib.mjs';
const model = process.argv[2] || 'qwen3-tts-flash';
const r = await dsGen({ model, input: { text: 'Hello team, the total is fourteen ringgit.', voice: 'Cherry', language_type: 'English' } });
if (!r.ok) out('tts ' + model, false, r.err);
const u = r.json?.output?.audio?.url;
if (!u) out('tts ' + model, false, 'no audio url; keys=' + Object.keys(r.json?.output || {}));
const b = Buffer.from(await (await fetch(u)).arrayBuffer()); save('tts.wav', b);
out('tts ' + model, true, `${r.ms}ms bytes=${b.length} (wav; run afinfo for duration)`);

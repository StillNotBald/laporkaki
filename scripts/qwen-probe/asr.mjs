import { chat, out, b64, scratch } from './_lib.mjs';
const model = process.argv[2] || 'qwen3-asr-flash';
const r = await chat({ model, messages: [{ role: 'user', content: [{ type: 'input_audio', input_audio: { data: 'data:audio/wav;base64,' + b64(scratch + '/tts.wav') } }] }], stream: false, asr_options: { enable_itn: false } });
if (!r.ok) out('asr ' + model, false, r.err);
out('asr ' + model, true, `${r.ms}ms "${r.json.choices[0].message.content}"`);

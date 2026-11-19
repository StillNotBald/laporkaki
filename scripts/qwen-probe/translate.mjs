import { chat, out } from './_lib.mjs';
const model = process.argv[2] || 'qwen-mt-flash';
const res = []; let ms = 0;
for (const lang of ['Malay', 'Chinese']) {
  const r = await chat({ model, messages: [{ role: 'user', content: 'The receipt total is fourteen ringgit.' }], translation_options: { source_lang: 'English', target_lang: lang } });
  if (!r.ok) out('translate ' + model, false, r.err);
  ms += r.ms; res.push(r.json.choices[0].message.content);
}
out('translate ' + model, true, `${ms}ms total (2 calls) -> ${res.join(' | ')}`);

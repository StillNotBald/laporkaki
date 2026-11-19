import { chat, out } from './_lib.mjs';
const r = await chat({ model: 'qwen4-max', enable_thinking: false, max_tokens: 150, messages: [{ role: 'user', content: 'Boss, today lunch kita makan apa ah? 我想吃 something light lah, tapi not too expensive. Reply in the same Manglish style, 2 sentences.' }] });
if (!r.ok) out('manglish', false, r.err);
out('manglish', true, `${r.ms}ms "${r.json.choices[0].message.content.replace(/\s+/g, ' ')}"`);

import { chat, out } from './_lib.mjs';
const model = process.argv[2] || 'qwen3.8-flash';
const r = await chat({ model, enable_thinking: false, messages: [{ role: 'user', content: 'Weather in Kuala Lumpur?' }],
  tools: [{ type: 'function', function: { name: 'get_weather', description: 'Get weather for a city', parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] } } }] });
if (!r.ok) out('tools', false, r.err);
const tc = r.json.choices[0].message.tool_calls?.[0];
out('tools', !!tc, `${model} ${r.ms}ms ${tc ? tc.function.name + ' ' + tc.function.arguments : 'no tool_call'}`);

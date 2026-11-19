import { call, OAI, out } from './_lib.mjs';
const model = process.argv[2] || 'text-embedding-v4';
const r = await call(`${OAI}/embeddings`, { model, input: ['nasi lemak', '椰浆饭'] });
if (!r.ok) out('embed ' + model, false, r.err);
out('embed ' + model, true, `${r.ms}ms dim=${r.json.data[0].embedding.length} n=${r.json.data.length}`);

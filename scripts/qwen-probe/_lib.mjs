// Shared helpers. Key comes from env only (source a local env file outside the repo). Never prints the key.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
export const here = dirname(fileURLToPath(import.meta.url));
export const scratch = join(here, '../../.qoder-runs/probe');
const KEY = process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY;
export const OAI = process.env.OPENAI_BASE_URL, DS = process.env.DASHSCOPE_BASE_URL;
if (!KEY || !OAI || !DS) { console.log('FAIL env: source a local env file outside the repo first'); process.exit(2); }
const redact = (s) => String(s).split(KEY).join('***');
export async function call(url, body, { headers = {}, method = 'POST', raw = false } = {}) {
  const t0 = performance.now();
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
  const ms = Math.round(performance.now() - t0);
  const buf = Buffer.from(await r.arrayBuffer());
  let json = null; try { json = JSON.parse(buf.toString()); } catch {}
  return { ok: r.ok, status: r.status, ms, json, buf, headers: r.headers, err: r.ok ? '' : redact(`${r.status} ${json?.error?.code || json?.code || ''} ${(json?.error?.message || json?.message || '').slice(0, 160)}`) };
}
export const chat = (body) => call(`${OAI}/chat/completions`, body);
export const dsGen = (body) => call(`${DS}/services/aigc/multimodal-generation/generation`, body);
export const out = (name, ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${msg}`); process.exit(ok ? 0 : 1); };
export const b64 = (p) => readFileSync(p).toString('base64');
export const save = (n, b) => writeFileSync(join(scratch, n), b);

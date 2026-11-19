#!/usr/bin/env node
// Live view of every Qoder worker: run `node scripts/qw-watch.mjs` in a spare terminal tab.
// It follows .qoder-runs/*.jsonl and prints one short line per step, plus credits when a worker ends.
//   node scripts/qw-watch.mjs          follow new activity
//   node scripts/qw-watch.mjs --all    replay today's runs first
//   node scripts/qw-watch.mjs --total  print credits used so far and exit
import { readdirSync, statSync, openSync, readSync, closeSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", ".qoder-runs");
const replay = process.argv.includes("--all") || process.argv.includes("--total");
const totalOnly = process.argv.includes("--total");
const pos = new Map();
const buf = new Map();
let credits = 0;
const colours = [36, 35, 33, 32, 34, 31];
const tag = (f) => {
  const n = basename(f, ".jsonl");
  const c = colours[[...n].reduce((a, ch) => a + ch.charCodeAt(0), 0) % colours.length];
  return `\x1b[${c}m${n.padEnd(28).slice(0, 28)}\x1b[0m`;
};
const short = (s, n = 110) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

function show(file, line) {
  let m;
  try { m = JSON.parse(line); } catch { return; }
  if (m.type === "assistant") {
    for (const part of m.message?.content ?? []) {
      if (part.type === "tool_use") {
        const i = part.input ?? {};
        const what = i.file_path ?? i.path ?? i.command ?? i.pattern ?? i.query ?? i.url ?? i.description ?? "";
        if (!totalOnly) console.log(`${tag(file)} ${part.name.padEnd(9)} ${short(what)}`);
      } else if (part.type === "text" && part.text?.trim()) {
        if (!totalOnly) console.log(`${tag(file)} says      ${short(part.text)}`);
      }
    }
  } else if (m.type === "result") {
    credits += Number(m.total_credits ?? 0);
    if (!totalOnly) {
      const secs = Math.round((m.duration_ms ?? 0) / 1000);
      console.log(`${tag(file)} \x1b[1m${m.is_error ? "FAILED" : "DONE"}\x1b[0m ${secs}s, ${m.num_turns} turns, ${Number(m.total_credits ?? 0).toFixed(2)} credits (session total ${credits.toFixed(2)})`);
    }
  }
}

function scan(first) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".jsonl")) continue;
    const file = join(dir, name);
    const size = statSync(file).size;
    if (!pos.has(file)) pos.set(file, first && !replay ? size : 0);
    const from = pos.get(file);
    if (size <= from) continue;
    const fd = openSync(file, "r");
    const chunk = Buffer.alloc(size - from);
    readSync(fd, chunk, 0, chunk.length, from);
    closeSync(fd);
    pos.set(file, size);
    const text = (buf.get(file) ?? "") + chunk.toString("utf8");
    const lines = text.split("\n");
    buf.set(file, lines.pop());
    for (const l of lines) if (l) show(file, l);
  }
}

scan(true);
if (totalOnly) {
  console.log(`Qoder credits used by workers in this repo: ${credits.toFixed(2)}`);
} else {
  console.log("watching Qoder workers (Ctrl+C to stop)");
  setInterval(() => scan(false), 700);
}

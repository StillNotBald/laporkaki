import test from "node:test";
import assert from "node:assert/strict";
import { briefOf, parseRun, aggregate, renderMarkdown, slideStats } from "./qoder-usage.mjs";

const tool = (name, input) => JSON.stringify({
  type: "assistant",
  message: { content: [{ type: "tool_use", name, input }] },
});
const result = (over = {}) => JSON.stringify({
  type: "result", duration_ms: 120000, num_turns: 4, total_credits: 2.5,
  is_error: false, usage: { server_tool_use: { web_search_requests: 1, web_fetch_requests: 2 } },
  ...over,
});

test("briefOf takes the name before the first dot", () => {
  assert.equal(briefOf("050-qwen-client-v2.105451.jsonl"), "050-qwen-client-v2");
  assert.equal(briefOf("b2.104133.json"), "b2");
  assert.equal(briefOf("063-readme"), "063-readme");
});

test("parseRun counts tools, dedupes file paths, reads the result line", () => {
  const text = [
    JSON.stringify({ type: "system", subtype: "init" }),
    tool("Read", { file_path: "/repo/AGENTS.md" }),
    tool("Edit", { file_path: "/repo/a.ts" }),
    tool("Write", { file_path: "/repo/a.ts" }),
    tool("Write", { file_path: "/repo/b.ts" }),
    "not json",
    tool("Bash", { command: "npm test" }),
    tool("Bash", { command: "npm test" }),
    result(),
  ].join("\n");
  const p = parseRun(text);
  assert.equal(p.finished, true);
  assert.equal(p.failed, false);
  assert.equal(p.minutes, 2);
  assert.equal(p.turns, 4);
  assert.equal(p.credits, 2.5);
  assert.deepEqual(p.files, ["/repo/a.ts", "/repo/b.ts"]);
  assert.equal(p.commands, 2);
  assert.equal(p.searches, 1);
  assert.equal(p.fetches, 2);
});

test("parseRun flags a run without a result line as not finished", () => {
  const p = parseRun([tool("Write", { file_path: "/x" })].join("\n"));
  assert.equal(p.finished, false);
  assert.equal(p.minutes, 0);
  assert.deepEqual(p.files, ["/x"]);
});

test("aggregate totals, running count, failed count, distinct files", () => {
  const runs = [
    { brief: "01", file: "01.json", parse: parseRun([tool("Write", { file_path: "/a" }), result()].join("\n")) },
    { brief: "01", file: "01b.json", parse: parseRun([tool("Edit", { file_path: "/a" }), tool("Edit", { file_path: "/b" }), result({ is_error: true, total_credits: 1 })].join("\n")) },
    { brief: "02", file: "02.jsonl", parse: parseRun([tool("Bash", { command: "ls" })].join("\n")) },
  ];
  const s = aggregate(runs);
  assert.equal(s.runs, 3);
  assert.equal(s.briefs, 2);
  assert.equal(s.ok, 1);
  assert.equal(s.failed, 1);
  assert.equal(s.running, 1);
  assert.equal(s.credits, 3.5);
  assert.equal(s.turns, 8);
  assert.equal(s.minutes, 4);
  assert.equal(s.files.size, 2);
  assert.equal(s.commands, 1);
  assert.equal(s.searches, 2);
  assert.equal(s.fetches, 4);
});

test("renderMarkdown and slideStats shape", () => {
  const runs = [{ brief: "01", file: "01.json", parse: parseRun([tool("Write", { file_path: "/a" }), result()].join("\n")) }];
  const s = aggregate(runs);
  const md = renderMarkdown(s, runs);
  assert.match(md, /\| Worker runs \| 1 \|/);
  assert.match(md, /\| 01 \| 2\.0 \| 4 \| 2\.50 \| ok \|/);
  const slide = slideStats(s);
  assert.equal(slide.stats.length, 4);
  assert.equal(slide.stats[0].value, 1);
  assert.equal(slide.stats[3].value, 0); // 2 minutes = 0.03 h, rounds to 0.0
  assert.ok(typeof slide.summary === "string" && slide.summary.length > 0);
});

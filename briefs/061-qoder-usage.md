<!-- model: Qwen3.8-Flash -->
Read `AGENTS.md`, `docs/SUBMISSION.md` and `scripts/qw-watch.mjs` (it already parses the run logs) first.

## Job
"Qoder usage" is judged (likely 30% of the score). Write a script that turns our Qoder worker logs into honest numbers for the README and the deck's Qoder slide.

## Files you own (create only these)
- `scripts/qoder-usage.mjs`
- `scripts/qoder-usage.test.mjs` (Node's built-in `node:test`, no installs)

## Input
`.qoder-runs/` holds one file per worker run:
- `*.jsonl`: stream of JSON lines. The first is `{"type":"system","subtype":"init",...}`; assistant lines carry `message.content[]` with `tool_use` parts (`name`, `input`); the last is `{"type":"result", "duration_ms", "num_turns", "total_credits", "is_error", "usage":{"server_tool_use":{"web_search_requests","web_fetch_requests"}}}`.
- `*.json`: a single result object of the same shape (older runs).
The brief name is the file name before the first dot after the number (e.g. `050-qwen-client-v2`). A run without a result line is "still running": count it separately.

## Output
`node scripts/qoder-usage.mjs` writes:
1. `docs/QODER-USAGE.md`: a short table (runs, distinct briefs, finished/failed/running, total credits, total turns, total worker minutes, files edited or created (distinct paths from `Edit`/`Write` tool calls), shell commands run, web searches and fetches), then one row per run (brief, minutes, turns, credits, ok/failed). Plain English, no hype.
2. `web/src/content/qoder-usage.json`: `{ "generatedAt", "summary": "<one sentence>", "stats": [{ "label", "value" }] }` with the 4 strongest numbers for the slide (e.g. "Qoder workers run", "Files written by Qoder", "Credits used", "Worker hours saved" = total worker minutes / 60, one decimal).
`--print` prints the markdown to stdout instead of writing files.

## Test
Feed small fixture lines (inline strings in the test, no fixture files) and check totals, the running count and the distinct-file count. Run `node --test scripts/qoder-usage.test.mjs`, then run the script once for real and report the totals.

## Rules
No git. No installs. No other file. Never print environment values. End with a report under 120 words.

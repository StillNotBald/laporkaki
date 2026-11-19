#!/usr/bin/env bash
# Dispatch one Qoder CLI worker on a brief.
#   scripts/qw.sh briefs/<name>.md [model] [mode]
# model: a name from `qodercli --list-models` (default Qwen4-Max)
# mode:  edit (default, file edits only) | run (edits plus shell) | read (no edits)
# The worker's full output is saved to .qoder-runs/<name>.<time>.jsonl (watch live: node scripts/qw-watch.mjs)
set -euo pipefail

brief="${1:?usage: scripts/qw.sh briefs/<name>.md [model] [edit|run|read]}"
model="${2:-Qwen4-Max}"
mode="${3:-run}"

export PATH="$HOME/.local/bin:$PATH"
root="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "$brief" ]] || { echo "brief not found: $brief" >&2; exit 2; }

case "$mode" in
  edit) perm=(--permission-mode accept_edits) ;;
  run)  perm=(--permission-mode bypass_permissions) ;;
  read) perm=(--permission-mode default --disallowed-tools Edit --disallowed-tools Write) ;;
  *) echo "mode must be edit, run or read" >&2; exit 2 ;;
esac

mkdir -p "$root/.qoder-runs"
name="$(basename "$brief" .md)"
out="$root/.qoder-runs/$name.$(date +%H%M%S).jsonl"


# Optional 4th argument: a project subagent (builder, researcher, reviewer, copy-checker).
agent=(); [[ -n "${4:-}" ]] && agent=(--agent "$4")

qodercli -p "$(cat "$brief")" -m "$model" -w "$root" "${perm[@]}" ${agent[@]+"${agent[@]}"} -o stream-json >"$out"
echo "saved: $out"

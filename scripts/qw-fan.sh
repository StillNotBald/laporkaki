#!/usr/bin/env bash
# Run several Qoder workers at once, one per brief.
#   scripts/qw-fan.sh [-j N] [-m model] [-M mode] briefs/a.md briefs/b.md ...
# -j  how many at once (default 6; this Mac has 16 GB and other sessions run too)
# -m  model for all (default Qwen4-Max); a brief may override with a first line
#     `<!-- model: Qwen3.8-Flash -->`
# -M  edit (default) | run | read   (see qw.sh)
# Parallel workers share one working tree: each brief must own its files.
set -uo pipefail

jobs=6; model="Qwen4-Max"; mode="run"
while getopts "j:m:M:" o; do
  case "$o" in j) jobs="$OPTARG";; m) model="$OPTARG";; M) mode="$OPTARG";; *) exit 2;; esac
done
shift $((OPTIND-1))
[[ $# -gt 0 ]] || { echo "no briefs given" >&2; exit 2; }

here="$(cd "$(dirname "$0")" && pwd)"
run_one() {
  local brief="$1" m="$2" mode="$3" here="$4" own
  own="$(head -1 "$brief" | sed -n 's/^<!-- model: *\(.*[^ ]\) *-->$/\1/p')"
  [[ -n "$own" ]] && m="$own"
  local t0=$SECONDS
  if "$here/qw.sh" "$brief" "$m" "$mode" >/dev/null 2>"$brief.err"; then
    rm -f "$brief.err"; echo "ok    $((SECONDS-t0))s  $m  $brief"
  else
    echo "FAIL  $((SECONDS-t0))s  $m  $brief  (see $brief.err)"
  fi
}
export -f run_one

printf '%s\n' "$@" | xargs -P "$jobs" -I{} bash -c 'run_one "$@"' _ {} "$model" "$mode" "$here"

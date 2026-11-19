# Qoder worker setup

Plain version: a headless Qoder worker can edit files and run a short safe list of commands, with no `bypass_permissions`. Everything else is refused.

## What is configured

- `.qoder/settings.json` has `permissions.allow` and `permissions.deny` (rule format from the docs: `Bash(prefix:*)`, `Read(path)`). Deny wins over allow.
- Allowed: `npm test`, `npm run typecheck|lint|build`, the same with `npm --prefix web ...`, `npx vitest`, `cd`, `node scripts/*`, `node scripts/find.mjs`, `ls`, `cat`, `grep`, `rg`, `git status|diff|log`.
- Denied: every other git subcommand, `rm -r/-rf`, `rmdir`, `curl`, `wget`, `npm install|i|ci|add`, `npx create-*`, `sudo`, anything touching the local env file, `.env.local`/`.env.production`/`.env.development`/`.env.test`, or `FirstLeap`. Read/Edit are denied on the same paths. `.env.example` stays readable.
- Four agents in `.qoder/agents/` (check with `qodercli agents list`):
  - `builder` (Qwen4-Max): one brief, named files, runs test and typecheck, report under 150 words.
  - `researcher` (Qwen4-Max): reads and uses the web, writes one file under `research/`.
  - `reviewer` (Qwen4-Max): no Write/Edit, tries to refute a diff.
  - `copy-checker` (Qwen3.8-Flash): read-only, long sentences, jargon, inconsistent labels.

## Dispatch flags

    qodercli -p "<brief>" -m Qwen4-Max -w <repo> --permission-mode accept_edits -o json
    qodercli --agent builder -p "<brief>" -w <repo> --permission-mode accept_edits -o json

The project file is loaded automatically from `-w <repo>`. To use a subagent from inside a run, write "Use the reviewer subagent to ..." in the brief.

## Recommended change to scripts/qw.sh

`run` mode is the only reason `bypass_permissions` is used. With the allowlist, `edit` mode now covers tests. Optional `--agent` as a 4th argument:

    -qodercli -p "$(cat "$brief")" -m "$model" -w "$root" "${perm[@]}" -o json >"$out"
    +agent=(); [[ -n "${4:-}" ]] && agent=(--agent "$4")
    +qodercli -p "$(cat "$brief")" -m "$model" -w "$root" "${perm[@]}" ${agent[@]+"${agent[@]}"} -o json >"$out"

Keep `run` only for jobs that really need other shell commands.

## Proved by running (accept_edits, -p, Qwen3.8-Flash)

| Test | Result |
|---|---|
| `git status --short` | ran |
| `cd web && npm run typecheck` | ran, passed |
| `git commit --allow-empty -m test` | refused: "Command denied by projectSettings rule" |
| `cat web/.env.local` | refused (same message) |
| Read tool on `.env.local` / `.env.example` | refused / read |
| `curl -sI https://example.com`, `rm -rf ...` | refused |
| `qodercli --agent builder -p "create file, run typecheck"` | file written, typecheck passed |
| prompt "Use the builder subagent ..." | builder ran, file written |

Test files were created in `.qoder-runs/` and removed.

## What does NOT work or is not proved

- The `researcher`, `reviewer` and `copy-checker` agents were listed but not run.
- Agent frontmatter `model` and `tools` were accepted (listing shows the model) but not proved to be enforced at run time.
- `Bash(cd *)` is broad; it is allowed so `cd web && npm ...` works. Compound commands pass only if every part is allowed.
- Deny rules for `.env*` are by exact name; an odd name like `.env.staging` is not covered. A `cat` of a file under `web/` named differently is not covered either.
- The `.env` Bash patterns match by text, so they can be dodged with shell tricks. This is a guard, not a sandbox.
- The repo has no commits yet, so `git log` and `git diff` were not tried.

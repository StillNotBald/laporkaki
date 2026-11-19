Read `AGENTS.md` (sections "AI at runtime" and "Find before you build"), `docs/SUBMISSION.md` and `docs/QWEN-CAPABILITIES.md` first. You are a reviewer: you change no code.

## File you own (create only this)

## Part A: review the AI code
Files: `web/src/lib/ai/*.ts`, `web/src/app/api/ai/**`. Check against the AI rules in `AGENTS.md`:
- The key and base URL are read server side only; nothing under a `"use client"` file imports them; no log line, error message or response body can contain them.
- Every AI call has a timeout, exactly one retry, and a plain fallback message.
- `enable_thinking: false` is the default; flash is used where the user waits.
- Image input: size and type limits before anything is sent to Qwen.
- The stream route: what happens when the client disconnects, when Qwen returns an error mid-stream, when the body is not JSON.
- Abuse: a public URL spends our one team key. Is there any limit today?
For each finding: file and line, what goes wrong in one concrete scenario, severity (High / Medium / Low), and the smallest fix in one line. Do not report style.

## Part B: is the repo safe to make public?
Run `git ls-files` (read-only git is allowed for this) and read every tracked text file. List every line that would embarrass or leak if the repo were public: names of clients or other private projects, private repository names, local folder paths that reveal a person's name, email addresses, internal studio tool names, anything that looks like a key. Give file, line, the text (mask anything key-like), and a suggested replacement. Note which lines exist only to fence other projects (for example a deny rule) and suggest a generic wording that keeps the fence.

## Rules
No edits to any file except the one you own. No git writes. End with a report under 150 words: counts of High / Medium / Low in Part A, and the number of lines in Part B.

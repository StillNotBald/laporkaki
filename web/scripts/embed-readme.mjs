// Replaces the demo-flow marker block in README.md with the GIF preview,
// linked to the full video. Idempotent: no write when nothing changed.
// Usage (from web/): node scripts/embed-readme.mjs <video-url> [readme-path]
import fs from "node:fs";
import path from "node:path";

const START = "<!-- demo-flow:start -->";
const END = "<!-- demo-flow:end -->";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/embed-readme.mjs <video-url> [readme-path]");
  process.exit(1);
}
const readme = path.resolve(process.cwd(), process.argv[3] ?? "../README.md");
const text = fs.readFileSync(readme, "utf8");
const start = text.indexOf(START);
const end = text.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`Markers ${START} / ${END} not found in ${readme}`);
  process.exit(1);
}

const embed = `${START}\n[![Application flow](assets/demo-flow.gif)](${url})\n${END}`;
const next = text.slice(0, start) + embed + text.slice(end + END.length);
if (next === text) {
  console.log("README embed already up to date");
} else {
  fs.writeFileSync(readme, next);
  console.log(`Updated ${readme}`);
}
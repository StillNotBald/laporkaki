// Cloudflare Workers build: Cache Components is off there (CF_BUILD=1), and the
// ticket page's `instant` export requires it. Drop that line for the build only.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const file = "src/app/ticket/[id]/page.tsx";
const original = readFileSync(file, "utf8");
writeFileSync(file, original.replace(/^export const instant = false;$/m, ""));
try {
  execSync("opennextjs-cloudflare build", { stdio: "inherit", env: { ...process.env, CF_BUILD: "1" } });
} finally {
  writeFileSync(file, original);
}

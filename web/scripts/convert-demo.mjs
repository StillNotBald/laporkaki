// Converts the Playwright demo recording (demo-video/demo.webm) into:
//   demo.mp4  full video, H.264, web-ready (+faststart)
//   demo.gif  README preview, kept under GitHub's ~10 MB image-proxy limit
// Run from web/ after: playwright test --config playwright.demo.config.ts
// Requires ffmpeg on PATH (preinstalled on GitHub Actions ubuntu runners).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "demo-video");
const webm = path.join(dir, "demo.webm");
const mp4 = path.join(dir, "demo.mp4");
const gif = path.join(dir, "demo.gif");
const palette = path.join(dir, "palette.png");
const MAX_GIF_BYTES = 9.5 * 1024 * 1024;

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

if (!fs.existsSync(webm)) {
  console.error(
    `No recording at ${webm}. Run: npx playwright test --config playwright.demo.config.ts`,
  );
  process.exit(1);
}
try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  console.error("ffmpeg not found on PATH. Install ffmpeg, or run this in CI.");
  process.exit(1);
}

ffmpeg([
  "-i", webm,
  "-c:v", "libx264", "-preset", "medium", "-crf", "23",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
  mp4,
]);

// GIF ladder: drop fps and width until the file fits the README limit.
const attempts = [
  { fps: 10, width: 800 },
  { fps: 8, width: 640 },
  { fps: 6, width: 480 },
];
let fits = false;
for (const { fps, width } of attempts) {
  const vf = `fps=${fps},scale=${width}:-2:flags=lanczos`;
  ffmpeg(["-i", webm, "-vf", `${vf},palettegen=stats_mode=diff`, palette]);
  ffmpeg([
    "-i", webm, "-i", palette,
    "-lavfi", `${vf} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
    gif,
  ]);
  const mb = fs.statSync(gif).size / 1024 / 1024;
  console.log(`GIF at ${fps}fps/${width}px: ${mb.toFixed(1)} MB`);
  if (fs.statSync(gif).size <= MAX_GIF_BYTES) {
    fits = true;
    break;
  }
}
fs.rmSync(palette, { force: true });
if (!fits) {
  console.error(
    "GIF is still over 9.5 MB at 480px/6fps. Shorten the demo steps (web/e2e/demo/steps.ts).",
  );
  process.exit(1);
}
console.log(`Wrote ${mp4} (${(fs.statSync(mp4).size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Wrote ${gif}`);
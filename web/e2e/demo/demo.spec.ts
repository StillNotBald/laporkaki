import path from "node:path";
import { test, type Page } from "@playwright/test";
import { steps } from "./steps";

// The screenshot config (testDir ./e2e) also matches this file; only run here.
test.skip(
  ({ baseURL }) => !baseURL?.endsWith(":3211"),
  "Demo recording runs only under playwright.demo.config.ts",
);

async function showCaption(page: Page, text: string) {
  await page.evaluate((line) => {
    document.getElementById("demo-caption")?.remove();
    const bar = document.createElement("div");
    bar.id = "demo-caption";
    bar.textContent = line;
    bar.setAttribute(
      "style",
      [
        "position:fixed",
        "left:50%",
        "bottom:24px",
        "transform:translateX(-50%)",
        "max-width:80%",
        "padding:12px 20px",
        "border-radius:14px",
        "background:rgba(255,255,255,0.72)",
        "backdrop-filter:blur(16px)",
        "-webkit-backdrop-filter:blur(16px)",
        "border:1px solid rgba(0,0,0,0.08)",
        "border-top:2px solid #0A84FF",
        "box-shadow:0 8px 24px rgba(0,0,0,0.12)",
        "color:#000",
        "font:500 18px/1.4 -apple-system,system-ui,sans-serif",
        "text-align:center",
        "z-index:2147483647",
        "pointer-events:none",
      ].join(";"),
    );
    document.body.appendChild(bar);
  }, text);
}

test("Records the demo journey with narration captions (placeholder steps)", async ({
  page,
}) => {
  for (const step of steps) {
    await showCaption(page, step.say);
    await step.run(page);
    // Navigation wipes the DOM, so put the caption back before the hold.
    await showCaption(page, step.say);
    await page.waitForTimeout(step.holdMs);
  }

  // saveAs waits for the page to close and the video to be fully written.
  await page.close();
  const video = page.video();
  if (video) {
    await video.saveAs(path.join(process.cwd(), "demo-video", "demo.webm"));
  }
});
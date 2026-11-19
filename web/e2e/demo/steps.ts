import path from "node:path";
import type { Page } from "@playwright/test";

export type DemoStep = {
  say: string;
  run: (page: Page) => Promise<void>;
  holdMs: number;
};

const PHOTO = path.join(__dirname, "assets", "pothole.png");

// The 90-second wow from proposal/FLOW.md §8. Captions are narration, not claims.
export const steps: DemoStep[] = [
  {
    say: "A pothole in Subang Jaya. Who handles it? LaporKaki helps you report it. Demo data, internal inbox.",
    run: async (page) => {
      await page.goto("/", { waitUntil: "networkidle" });
    },
    holdMs: 4000,
  },
  {
    say: "Snap or choose a photo. Add the place — GPS helps, typing works too.",
    run: async (page) => {
      await page.getByRole("link", { name: /report a problem/i }).click();
      await page.waitForURL("**/report");
      await page.locator('input[type="file"]').setInputFiles(PHOTO);
      await page.waitForTimeout(800);
      // GPS is unavailable in the recorder: use the typed-place fallback on purpose.
      await page.getByLabel("Place", { exact: true }).fill("SS15, Subang Jaya");
      await page.getByLabel("Council or body").selectOption("mbsj");
    },
    holdMs: 3000,
  },
  {
    say: "AI suggests the problem, severity and the right body. Every suggestion is editable — please check.",
    run: async (page) => {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForURL("**/report/confirm");
      // Give the live AI a moment; the manual fallback is a first-class path.
      await page.waitForTimeout(6000);
      const title = page.getByLabel("Title");
      if (!(await title.inputValue())) {
        await title.fill("Pothole on the road near SS15");
      }
      const desc = page.getByLabel("Description");
      if (!(await desc.inputValue())) {
        if (!(await desc.isVisible())) await page.getByRole("main").locator("details > summary").click();
        await desc.fill("Medium pothole with loose gravel, risky for motorcyclists.");
      }
      // Category/severity/body selects always hold valid defaults; leave them.
    },
    holdMs: 4000,
  },
  {
    say: "Send once. Saved here, sent to our demo inbox — nothing goes to a real council.",
    run: async (page) => {
      await page.getByRole("button", { name: /send|hantar/i }).click();
      await page.getByRole("link", { name: "Track my report", exact: true }).click();
      await page.waitForURL("**/ticket/**");
    },
    holdMs: 4000,
  },
  {
    say: "The demo council inbox: open the report, mark it in progress, then fixed. A demo officer update.",
    run: async (page) => {
      await page.goto("/inbox", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      // Newest first: our ticket is the top row in the reports list.
      await page.locator('section[aria-label="Reports"] li button').first().click();
      await page.waitForTimeout(800);
      await page.getByRole("button", { name: /mark in progress/i }).click();
      await page.waitForTimeout(1200);
      await page.getByRole("button", { name: /mark fixed/i }).click();
    },
    holdMs: 3000,
  },
  {
    say: "The public dashboard: raised, solved and speed per council — seeded examples plus this browser's reports.",
    run: async (page) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" });
    },
    holdMs: 5000,
  },
  {
    say: "Volunteer or pledge RM10. A promise, not a payment. Next: plug into SISPAA and council systems.",
    run: async (page) => {
      await page.goto("/volunteer", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /volunteer|sukarelawan/i }).first().click().catch(() => {});
      await page.getByLabel("Pledge amount (RM)").fill("10");
      await page.getByRole("button", { name: /pledge|janji/i }).first().click();
    },
    holdMs: 5000,
  },
];
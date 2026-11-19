import path from "node:path";
import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { routes } from "./routes";

async function capture(page: Page, testInfo: TestInfo, name: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: path.join(process.cwd(), "shots", testInfo.project.name, `${name}.png`),
    fullPage: true,
    animations: "disabled",
  });
}

for (const route of routes) {
  test(`${route.name}: no horizontal scroll, no console errors`, async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(route.path, { waitUntil: "networkidle" });

    const fitsViewport = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(fitsViewport, "page has horizontal scroll").toBe(true);
    expect(consoleErrors, "console errors found").toEqual([]);

    await page.screenshot({
      path: path.join(
        process.cwd(),
        "shots",
        testInfo.project.name,
        `${route.name}.png`,
      ),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("report, council updates and pledges work end to end", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/report/analyse", (route) => route.fulfill({
    json: {
      ai: true,
      title: "Pothole near SS15",
      category: "pothole",
      severity: "medium",
      description: "Loose gravel around a pothole.",
      suggestedFix: "Inspect and repair the road surface.",
      agencyId: "mbsj",
    },
  }));
  await page.goto("/");
  await page.getByRole("link", { name: /report a problem/i })
    .or(page.getByRole("button", { name: /report a problem/i })).click();
  await page.waitForURL("**/report");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public/demo/pothole.png"));
  await page.getByLabel("Place", { exact: true }).fill("SS15, Subang Jaya");
  await page.getByLabel(/council or body/i).selectOption("mbsj");
  await capture(page, testInfo, "report-filled");
  await page.getByRole("button", { name: /continue|check the draft|review/i }).click();
  await page.waitForURL("**/report/confirm");
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Pothole near SS15");
  await page.getByLabel("Title", { exact: true }).fill("Pothole near SS15 shops");
  await capture(page, testInfo, "review-filled");
  await page.getByRole("button", { name: /send report|hantar/i }).click();
  await expect(page.getByRole("heading", { name: /sent to mbsj/i })).toBeVisible();
  await capture(page, testInfo, "report-sent");
  await page.getByRole("link", { name: "Track my report", exact: true }).click();
  await page.waitForURL("**/ticket/**");
  await expect(page.getByRole("heading", { name: "Pothole near SS15 shops" })).toBeVisible();
  await capture(page, testInfo, "ticket-new");
  await page.getByRole("link", { name: "Council view", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "Pothole near SS15 shops" }).click();
  await capture(page, testInfo, "inbox-selected");
  const markInProgress = page.getByRole("button", { name: /mark in progress/i });
  if (testInfo.project.name === "phone") {
    // Regression: the footer action must sit on screen at 390px, not below it.
    await expect(markInProgress).toBeInViewport();
  }
  await markInProgress.click();
  await page.getByRole("button", { name: /mark fixed/i }).click();
  await expect(page.getByRole("button", { name: /mark fixed/i })).toHaveCount(0);
  await capture(page, testInfo, "inbox-fixed");
  await page.goto("/dashboard");
  await capture(page, testInfo, "dashboard-updated");
  await page.getByRole("link", { name: "Help out", exact: true }).click();
  await page.getByRole("button", { name: /i can help|volunteer|sukarelawan/i }).first().click();
  await page.getByLabel(/pledge amount|your pledge/i).fill("10");
  const acknowledgment = page.getByRole("checkbox");
  if (await acknowledgment.count()) await acknowledgment.check();
  await page.getByRole("button", { name: /pledge|janji/i }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("laporkaki.pledges.v1"))).toBe("10");
  await capture(page, testInfo, "volunteer-pledged");
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("laporkaki.volunteer.v1"))).toBe("1");
  expect(errors).toEqual([]);
});

test("manual draft remains editable when analysis is unavailable", async ({ page }, testInfo) => {
  await page.route("**/api/report/analyse", (route) => route.fulfill({ json: { ai: false } }));
  await page.goto("/report");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public/demo/pothole.png"));
  await page.getByLabel("Place", { exact: true }).fill("SS15, Subang Jaya");
  await page.getByLabel(/council or body/i).selectOption("mbsj");
  await page.getByRole("button", { name: /continue|check the draft|review/i }).click();
  await page.waitForURL("**/report/confirm");
  await page.getByLabel("Title", { exact: true }).fill("Road needs repair");
  await page.getByRole("main").locator("details > summary").click();
  await page.getByLabel("Description", { exact: true }).fill("Loose gravel beside the shops.");
  await expect(page.getByRole("button", { name: /send report|hantar/i })).toBeEnabled();
  await capture(page, testInfo, "review-manual");
});

test("seeded dates render the same in every browser timezone", async ({ browser }, testInfo) => {
  // A UTC server and non-Malaysian browser must agree on Malaysian dates.
  const DAY = /(?<!\d)\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g;
  const results: Record<string, { ticket: string[]; inbox: string[] }> = {};

  for (const timezoneId of ["America/Los_Angeles", "Asia/Kuala_Lumpur"]) {
    const context = await browser.newContext({ ...testInfo.project.use, timezoneId });
    try {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
      });

      await page.goto("/ticket/D-006", { waitUntil: "networkidle" });
      await expect(
        page.getByRole("heading", { name: "Fallen branch over Jalan Puteri 2" }),
      ).toBeVisible();
      const ticketText = await page.getByRole("main").innerText();
      expect(ticketText).not.toContain("Invalid Date");
      const ticketDays = ticketText.match(DAY) ?? [];
      expect(ticketDays.length, "ticket shows no dates").toBeGreaterThan(0);

      await page.goto("/inbox", { waitUntil: "networkidle" });
      await page.getByRole("button")
        .filter({ hasText: "Fallen branch over Jalan Puteri 2" }).click();
      const inboxText = await page.getByRole("main").innerText();
      expect(inboxText).not.toContain("Invalid Date");
      const inboxDays = inboxText.match(DAY) ?? [];
      expect(inboxDays.length, "inbox detail shows no dates").toBeGreaterThan(0);

      // Hydration mismatches surface as console errors or React #418/#423/#425.
      expect(errors, `runtime or hydration errors in ${timezoneId}`).toEqual([]);
      results[timezoneId] = { ticket: ticketDays, inbox: inboxDays };
    } finally {
      await context.close();
    }
  }

  expect(results["America/Los_Angeles"]).toEqual(results["Asia/Kuala_Lumpur"]);
});

test("late AI reply never overwrites a manual draft", async ({ page }, testInfo) => {
  // Hold the analyse request so the person gives up waiting and fills it in.
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  let fulfilled!: () => void;
  const answered = new Promise<void>((resolve) => { fulfilled = resolve; });
  await page.route("**/api/report/analyse", async (route) => {
    await held;
    await route.fulfill({
      json: {
        ai: true,
        title: "AI guess at the pothole",
        category: "pothole",
        severity: "high",
        description: "AI description that must not land.",
        suggestedFix: "AI fix that must not land.",
        agencyId: "dbkl",
      },
    });
    fulfilled();
  });

  await page.goto("/report");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public/demo/pothole.png"));
  await page.getByLabel("Place", { exact: true }).fill("SS15, Subang Jaya");
  await page.getByLabel(/council or body/i).selectOption("mbsj");
  await page.getByRole("button", { name: /continue|check the draft|review/i }).click();
  await page.waitForURL("**/report/confirm");

  await expect(page.getByRole("status").filter({ hasText: /reading your photo/i })).toBeVisible();
  await page.getByRole("button", { name: "Fill it myself", exact: true }).click();
  await expect(page.getByText("Fill in the details below — sending works the same.")).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Pothole I named myself");

  // Let the valid AI reply arrive after the switch to manual.
  release();
  await answered;
  await page.waitForLoadState("networkidle");

  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Pothole I named myself");
  await expect(page.getByText("Fill in the details below — sending works the same.")).toBeVisible();
  await expect(page.getByText(/AI filled the fields/i)).toHaveCount(0);
  await expect(page.getByRole("main").getByLabel(/council or body/i)).toHaveValue("mbsj");
  await expect(page.getByRole("button", { name: /send report|hantar/i })).toBeEnabled();
  await capture(page, testInfo, "review-manual-race");
});

test("photo, location and pledge errors have usable recovery", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: (_success: unknown, failure: (error: { code: number }) => void) => failure({ code: 1 }) },
    });
  });
  await page.goto("/report");
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeDisabled();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("not a photo"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Use my location", exact: true }).click();
  await expect(page.getByText(/location is off/i)).toBeVisible();
  await expect(page.getByLabel("Place", { exact: true })).toBeEditable();
  await capture(page, testInfo, "report-recovery");
  await page.goto("/volunteer");
  await page.getByLabel("Pledge amount (RM)", { exact: true }).fill("1001");
  await page.getByRole("button", { name: /pledge|janji/i }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("RM1000");
  expect(await page.evaluate(() => localStorage.getItem("laporkaki.pledges.v1"))).toBeNull();
  await page.getByLabel("Pledge amount (RM)", { exact: true }).fill("0");
  await page.getByRole("button", { name: /pledge|janji/i }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("above RM0");
  await capture(page, testInfo, "pledge-recovery");
});

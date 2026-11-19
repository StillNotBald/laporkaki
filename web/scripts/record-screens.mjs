// Records a screen-by-screen walkthrough of proposal/screens.html with an
// artificial cursor, click ripples and typing in the editable fields.
// Run from web/: node scripts/record-screens.mjs
// Output: demo-video/screens-walkthrough.webm (convert to mp4 with ffmpeg).
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const pageUrl = 'file://' + path.join(repoRoot, 'proposal', 'screens.html');
const outDir = path.join(here, '..', 'demo-video');
fs.mkdirSync(outDir, { recursive: true });

const ACCENT = '#0A84FF';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
await page.goto(pageUrl);

// ---- stage: one screen at a time, centred, scaled to fit 720p ----
await page.addStyleTag({
  content: `
    header, .closing { display: none !important; }
    body { background: #fff; }
    .gallery { position: relative; display: block; height: 660px; margin: 0; }
    .shot { position: absolute; inset: 0; display: flex; flex-direction: column;
            align-items: center; opacity: 0; pointer-events: none;
            transition: opacity .45s ease; margin: 0; }
    .shot.active { opacity: 1; pointer-events: auto; }
    .shot .phone { transform: scale(.72); transform-origin: top center; margin-top: 14px; }
    .shot figcaption { display: none; }
    #qw-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px;
      z-index: 2147483647; pointer-events: none;
      transition: transform .6s cubic-bezier(.4,0,.2,1); will-change: transform; }
    .qw-ripple { position: fixed; width: 14px; height: 14px; margin: -7px 0 0 -7px;
      border-radius: 50%; border: 3px solid ${ACCENT}; z-index: 2147483646;
      pointer-events: none; animation: qw-ripple .55s ease-out forwards; }
    @keyframes qw-ripple { from { opacity: .9; transform: scale(.4); }
                           to { opacity: 0; transform: scale(3.4); } }
    #qw-caption { position: fixed; left: 0; right: 0; bottom: 0; padding: 13px 24px;
      background: rgba(255,255,255,.72); backdrop-filter: blur(16px);
      border-top: 2px solid ${ACCENT}; color: #000; font: 500 18px/1.4 -apple-system,
      'SF Pro Text', system-ui, sans-serif; z-index: 2147483645; text-align: center; }
    #qw-caption b { color: ${ACCENT}; font-weight: 600; margin-right: 10px; }
    #qw-intro { position: fixed; inset: 0; display: grid; place-items: center;
      background: #fff; z-index: 2147483644; text-align: center;
      transition: opacity .5s ease; font-family: -apple-system, system-ui, sans-serif; }
    #qw-intro h1 { font-size: 54px; margin: 0 0 10px; color: #000; }
    #qw-intro p { font-size: 20px; margin: 0; color: #333; }
  `,
});

await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.id = 'qw-cursor';
  cursor.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l14 11-6.5 1L15 21l-3 1.4-3.4-7L4 19z" fill="#000" stroke="#fff" stroke-width="1.6"/></svg>';
  cursor.style.transform = 'translate(1100px, 620px)';
  document.body.appendChild(cursor);
  const cap = document.createElement('div');
  cap.id = 'qw-caption';
  document.body.appendChild(cap);
  const intro = document.createElement('div');
  intro.id = 'qw-intro';
  intro.innerHTML = '<div><h1>LaporKaki</h1><p>Seven screens · a walkthrough of the drawings</p></div>';
  document.body.appendChild(intro);
});

// ---- helpers ----
async function moveTo(locator, dx = 0, dy = 0) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('no bounding box for target');
  const x = box.x + box.width / 2 + dx;
  const y = box.y + box.height / 2 + dy;
  await page.evaluate(
    ([x, y]) => {
      document.getElementById('qw-cursor').style.transform = `translate(${x - 3}px, ${y - 2}px)`;
    },
    [x, y],
  );
  await wait(680);
  return [x, y];
}

async function ripple(x, y) {
  await page.evaluate(
    ([x, y]) => {
      const r = document.createElement('div');
      r.className = 'qw-ripple';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 650);
    },
    [x, y],
  );
  await wait(220);
}

async function clickAt(locator, dx = 0, dy = 0) {
  const [x, y] = await moveTo(locator, dx, dy);
  await ripple(x, y);
  await wait(350);
}

async function typeInto(locator, text) {
  await clickAt(locator);
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(text, { delay: 55 });
  await wait(300);
}

async function showScreen(id, num, title, line) {
  await page.evaluate((id) => {
    document.querySelectorAll('.shot').forEach((s) => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }, id);
  await page.evaluate(
    ([num, title, line]) => {
      const cap = document.getElementById('qw-caption');
      cap.innerHTML = '';
      const b = document.createElement('b');
      b.textContent = `${num} · ${title}`;
      cap.appendChild(b);
      cap.appendChild(document.createTextNode(line));
    },
    [num, title, line],
  );
  await wait(900);
}

const shot = (id) => page.locator(`#${id}`);

// ---- intro ----
await wait(2400);
await page.evaluate(() => {
  const i = document.getElementById('qw-intro');
  i.style.opacity = '0';
  setTimeout(() => i.remove(), 550);
});
await wait(500);

// 01 · Home
await showScreen('screen-01-home', '01', 'Home', 'One clear action: report a problem.');
await wait(1200);
await clickAt(shot('screen-01-home').locator('button.btn.primary'));
await wait(1600);

// 02 · Photo & place
await showScreen('screen-02-photo', '02', 'Photo & place', 'Choose a photo, then GPS or a typed place.');
await clickAt(shot('screen-02-photo').locator('.buttons button', { hasText: 'Choose photo' }));
await wait(700);
await typeInto(shot('screen-02-photo').locator('input[type="text"]'), 'Jalan SS 15/4, Subang Jaya');
await wait(600);
await clickAt(shot('screen-02-photo').locator('.footer button.btn.primary'));
await wait(1200);

// 03 · AI draft
await showScreen('screen-03-review', '03', 'AI draft', 'Every field is editable. Check, then Hantar.');
await typeInto(shot('screen-03-review').locator('label.field input').first(), 'Pothole by the kerb');
const severity = shot('screen-03-review').locator('select').nth(1);
await clickAt(severity);
await severity.selectOption('High');
await wait(800);
await severity.selectOption('Medium');
await wait(700);
await clickAt(shot('screen-03-review').locator('.footer button.btn.primary'));
await wait(1200);

// 04 · Ticket
await showScreen('screen-04-ticket', '04', 'Ticket', 'Track the path: Sent, In progress, Fixed.');
const steps = shot('screen-04-ticket').locator('.timeline li');
for (let i = 0; i < 3; i++) {
  await clickAt(steps.nth(i), -60);
  await wait(500);
}
await wait(1200);

// 05 · Council inbox — simulated selection + status change
await showScreen('screen-05-inbox', '05', 'Council inbox', 'Review the report, mark progress, then fixed.');
const items = shot('screen-05-inbox').locator('.ticket-list li');
await clickAt(items.nth(1));
await page.evaluate(() => {
  const list = document.querySelectorAll('#screen-05-inbox .ticket-list li');
  list[0].classList.remove('selected');
  list[1].classList.add('selected');
});
await wait(1100);
await clickAt(items.nth(0));
await page.evaluate(() => {
  const list = document.querySelectorAll('#screen-05-inbox .ticket-list li');
  list[1].classList.remove('selected');
  list[0].classList.add('selected');
});
await wait(800);
await clickAt(shot('screen-05-inbox').locator('.footer button', { hasText: 'Mark In progress' }));
await page.evaluate(() => {
  const badge = document.querySelector('#screen-05-inbox .detail .badge');
  badge.textContent = 'In progress';
  document.querySelector('#screen-05-inbox .ticket-list li.selected .row .small').textContent = 'In progress';
});
await wait(1100);
await clickAt(shot('screen-05-inbox').locator('.footer button', { hasText: 'Mark Fixed' }));
await page.evaluate(() => {
  const badge = document.querySelector('#screen-05-inbox .detail .badge');
  badge.textContent = 'Fixed';
  document.querySelector('#screen-05-inbox .ticket-list li.selected .row .small').textContent = 'Fixed';
});
await wait(1400);

// 06 · Dashboard
await showScreen('screen-06-dashboard', '06', 'Public dashboard', 'Raised, solved and median days — demo figures only.');
const rows = shot('screen-06-dashboard').locator('tbody tr');
for (let i = 0; i < 3; i++) {
  await clickAt(rows.nth(i), 40);
  await wait(450);
}
await wait(1400);

// 07 · Volunteer & pledge — simulated pledge
await showScreen('screen-07-pledge', '07', 'Help & pledge', 'A safe small job, or a promise of support. No payments.');
await clickAt(shot('screen-07-pledge').locator('button.btn.full', { hasText: 'I can help' }));
await wait(700);
await typeInto(shot('screen-07-pledge').locator('input[type="number"]'), '20');
await clickAt(shot('screen-07-pledge').locator('.checks input'));
await shot('screen-07-pledge').locator('.checks input').check();
await wait(600);
await clickAt(shot('screen-07-pledge').locator('button.btn.primary', { hasText: 'Make a pledge' }));
await page.evaluate(() => {
  const stack = document.querySelector('#screen-07-pledge .stack');
  stack.querySelector('.row .small').textContent = 'RM75 promised of RM100';
  stack.querySelector('.bar span').style.width = '75%';
});
await wait(2200);

// ---- save ----
const videoPath = path.join(outDir, 'screens-walkthrough.webm');
await page.close();
const video = page.video();
await video.saveAs(videoPath);
await context.close();
await browser.close();
console.log('Saved', videoPath);
# Assessment B: detector evidence

Scope: `web/src/app`, `web/src/components`. No app files edited. Raw detector output in `docs/design/detect.json`.

## 1. Detector

Command: `impeccable detect --json web/src/app web/src/components > docs/design/detect.json`

- Exit code: **0** (clean)
- Output: `[]` (0 findings)
- Findings by rule: none (no rules fired)
- Likely false positives: n/a (no findings to classify)

## 2. Text sizes

The app uses theme tokens only (`--text-caption`, `--text-body`, `--text-title`, `--text-display` in `web/src/app/globals.css`). No `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`... or `text-[..]` size classes exist.

| Class | Size (token) | Count (uses) | Sites (sample) |
|---|---|---|---|
| `text-caption` | 0.8125rem | 35 | app/dashboard/page.tsx:36, app/help/page.tsx:49, app/page.tsx:39, components/app/Shell.tsx:12 |
| `text-body` | 1rem | 15 | app/dashboard/page.tsx:57, components/app/Shell.tsx:8, components/app/Timeline.tsx:38 |
| `text-title` | 1.25rem | 13 | app/help/page.tsx:150, app/inbox/page.tsx:105, components/app/Shell.tsx:77 |
| `text-display` | 2rem | 1 | components/app/Shell.tsx:68 |

Distinct text sizes in use: **4** (all tokens). Sizes in `globals.css` (`--text-*`) are the only size definitions.

## 3. Colours not from a CSS variable/token

Palette classes (`bg-blue-500`, `text-gray-600`, etc.): **none found**.
`text-white`, `bg-white`, `bg-black`, `text-black`: **none found**.

Off-token literals:

| File:line | Literal | Note |
|---|---|---|
| app/layout.tsx:22 | `themeColor: "#ffffff"` | Metadata, not styling |
| components/app/Shell.tsx:28 | `shadow-[0_30px_70px_-32px_rgba(16,24,40,0.4)]` | Arbitrary shadow, not `--shadow-card` |
| components/app/SceneArt.tsx:3 | `const BLUE = "#0a84ff"` | Equals `--color-accent`, hard-coded in SVG |
| components/app/SceneArt.tsx:8-99 | 52 hex fills/strokes (`#f4f4f4`, `#e4e4e4`, `#fff`, `#8e8e93`, `#cfe1fb`, ...) | Illustration art (SVG), 52 lines |

Tokens (not off-token) are defined in `web/src/app/globals.css`; hex/rgb there are the token definitions themselves.

Off-token count: **1 metadata + 1 arbitrary shadow + 1 duplicated accent + 52 illustration lines = 55 lines**, of which the illustration fills are the bulk.

## 4. Inline `style={{` uses

| File:line | Use |
|---|---|
| app/help/page.tsx:62 | `style={{ width: \`${percent}%\` }}` (progress width, dynamic) |
| components/deck/Deck.tsx:258 | `style={{ background: radial-gradient(... var(--color-accent-tint) ..., var(--color-sunken) ...) }}` (background gradient, tokens inside) |
| components/deck/Deck.tsx:272 | `style={{ width: \`${((index + 1) / count) * 100}%\` }}` (progress width, dynamic) |

Total: **3**.

## 5. Border radius and shadow classes

Radius (count of uses):

| Class | Count | Notes |
|---|---|---|
| `rounded-full` | 17 | |
| `rounded-[14px]` | 2 | arbitrary, app/inbox/page.tsx:134,137 |
| `rounded-card` | 2 | token `--radius-card` (18px) |
| `rounded-xl` | 1 | Deck.tsx:264 |
| `rounded-[12px]` | 1 | Shell.tsx:93 (token `--radius-md` exists, not used) |
| `rounded-[16px]` | 1 | dashboard/page.tsx:35 |
| `rounded-[18px]` | 1 | PhotoFrame.tsx:18 |
| `rounded-[36px]` | 1 | Shell.tsx:28 |
| `rounded-tl-[12px]` / `rounded-tr-[12px]` | 1 each | dashboard/page.tsx:40,49 |

Distinct radius classes: **10** (4 tokenised: `rounded-card`, `rounded-xl`, `rounded-full`; the rest are arbitrary px values, one of them 12px duplicating `--radius-md`).

Shadow:

| Class | Count | Notes |
|---|---|---|
| `shadow-card` | 2 | token; used in `.glass` (globals.css) and one component |
| `shadow` (default) | 2 | globals.css:97 area and line 118/127 region |
| `shadow-[0_30px_70px_-32px_rgba(16,24,40,0.4)]` | 1 | arbitrary, Shell.tsx:28 |

## 6. White text

`text-white`: **0 uses**. `color: #fff` / `#ffffff` in text: **0**. The only `#fff` references are SVG fills in `components/app/SceneArt.tsx` (not text). Text colour is `text-ink`, `text-ink-2`, `text-muted`, `text-accent`, `text-accent-deep`, `text-good`, `text-warn`, `text-bad`, `text-info`.

Note: `components/ui/Button.tsx:37` and `components/ui/Pill.tsx:24` set `text-body`/`text-caption` but no colour class in the grep; the button colour variants were not inspected in this pass (they may set white text via a variant). Recommend Assessment A confirm the Button variant colours.

## Gaps in this pass

- Button and Pill variant colour classes were not expanded (the grep only matched size/radius classes there).
- Tailwind `text-white` check is by class name only; computed colour was not checked (no browser, per instructions).

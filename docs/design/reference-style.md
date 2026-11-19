# Reference style notes (studio style, glass phone look)

Read-only extraction for the hackathon app. Nothing here edits app code.
Sources read: the shared design system (package at a pinned commit), its `docs/DESIGN.md`, the reference phone app (`DESIGN.md` plus its `globals.css`, the owner's approved glass look), the retail reference app's `DESIGN.md` (red, squared skin: used only for structure rules), and the in-app guide kit README.

Which look is "studio style"? Two layers:
- **Structure (shared design system):** semantic token names, status colours never borrow the accent, 44px targets, 16px phone inputs, tabular numbers, reduced-motion respected, 6-variable rebrand.
- **Skin (owner's prospect look, 2026-11):** white and black, Apple glass, one macOS-style blue, no pink, four type sizes. The reference phone app is the best example. The shared design system default is green and the retail app is red, so do not copy their accent.

## 1. Tokens

### Colour (light only, no dark mode)
| Role | Value | Note |
|---|---|---|
| ink (text) | `#000000` | never white text on anything |
| ink-2 | `#3a3a3c` | secondary text, labels |
| muted | `#5c5c61` | captions, placeholders (6.6:1 on white) |
| page / surface | `#ffffff` | reference app puts a faint cool gradient `#eef4fb` > `#f7f9fc` > `#fff` behind the column |
| grouped | `#f4f8fc` | grouped list background |
| sunken | `#ececf0` | neutral pill, disabled fill, photo placeholder |
| hairline | `rgba(60,60,67,0.14)` | decorative dividers, card edge (0.5px) only |
| control-edge | `#85858b` | the visible edge of every input, chip, secondary button, switch (3.7:1 on white, WCAG 1.4.11) |
| accent | `#0a64d6` | icons, links, progress, current tab (5.6:1 on white). `#0a84ff` is too pale for text/icons |
| tint / tint-strong | `#e3f0ff` / `#cfe4ff` | selected row, chip on, primary button base |
| btn-fill | `linear-gradient(180deg,#dcecff,#c7e0ff)` | primary button; text stays black |

Status (dark text on pale fill; accent is never reused for status):
| State | Text | Fill | Extra |
|---|---|---|---|
| Open / sent (info) | `#0a4fa8` | `#e3f0ff` | |
| In progress (warning) | `#8a4600` | `#fdf0dc` | |
| Fixed (success) | `#1c6e33` | `#e3f4e7` | |
| Refused (danger) | `#b0001a` | `#ffffff` | 1px inset ring in `#b0001a` (white fill, not pink) |

### Glass recipe
- Bars and small panels: `background rgba(255,255,255,0.72)`; cards and tab bar: `rgba(255,255,255,0.88)`.
- `backdrop-filter: blur(22px) saturate(180%)` (plus the `-webkit-` prefix). Fallback to solid white when unsupported and under reduced transparency.
- Edge: `inset 0 0 0 0.5px rgba(255,255,255,0.9)` plus a 0.5px hairline border.
- Shadow (card): `0 1px 1px rgba(0,0,0,0.03), 0 10px 30px -14px rgba(20,30,60,0.18)`.
- Hero card (one per screen): gradient `rgba(255,255,255,0.96)` to `0.82`, extra ring `0 0 0 1px rgba(10,100,214,0.12)`, shadow `0 16px 36px -18px rgba(20,60,120,0.28)`.
- Sheets and the toast are solid white, not glass (text must never show through).

### Radius
`8px` (sm) / `12px` (md: inputs, notes) / `18px` (lg: cards, KPI, toast) / `22px` (xl: hero) / sheet `32px` / buttons, pills, chips, segmented control, tab bar = full capsule (`999px`).

### Spacing (4px base)
4, 6, 8, 10, 12, 14, 16 (card padding, gutter), 18 (hero), 20, 24, 28. Card stack gap 12 to 16. Row padding 12px 16px. KPI padding 14px 16px.

### Type (one system font, four sizes, two weights)
| Role | Size / line height | Weight |
|---|---|---|
| small (secondary, pills, labels, tab labels) | 14px / 1.35 | 400 or 600 |
| medium (body, buttons, inputs, row title) | 16px / 1.3 to 1.5 | 400 or 600 |
| large (card and section titles, sheet title, KPI value) | 20px / 1.2 to 1.3, tracking -0.01em | 600 |
| xl (the one big number or code) | 28px / 1.1, tracking -0.03em, tabular numerals | 600 |
- Floor is 14px: no 11, 12 or 13px text. Weights are 400 and 600 only: no 500, no 700.
- Stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Helvetica Neue", Arial, system-ui, sans-serif`. No web fonts.
- Numbers (counts, dates, amounts) use `font-variant-numeric: tabular-nums`.
- Phone text inputs stay 16px so iOS does not zoom.

### Elevation
Resting cards: glass shadow above. Bars: hairline only. Floating tab bar: `0 12px 30px -12px rgba(20,30,60,0.3)`. Sheet: `0 30px 60px -20px rgba(20,30,60,0.4)`. Toast: `0 12px 30px -10px rgba(20,30,60,0.35)`. Scrim: `rgba(0,0,0,0.22)`.
Z-order: top bar 20, guide overlay 35, scrim 40, sheet 41, toast 60.

### Motion
Almost none. Hover and press: colour change 120 to 150ms ease. Switch knob 150ms. Sheet rise 220ms ease-out. Page enter (optional): 6px rise, 340ms `cubic-bezier(0.2,0.7,0.2,1)`. Loading: shimmer 1.4s ease-in-out (skeleton) or 0.7s linear spinner. All stop under `prefers-reduced-motion` (set durations to 0.01ms).

### Focus ring
Inputs: `outline: 3px solid color-mix(in srgb, accent 55%, transparent); outline-offset: 0`. Other controls: `2px solid accent`, offset 2px. Never remove without a replacement.

## 2. Component recipes

Every tap target is 44px or taller. Disabled never fades to low opacity: it keeps readable black text on `sunken` with a control-edge ring, and the reason is written under the control.

- **App header:** sticky, 48px, glass 72%, 0.5px bottom hairline, safe-area top padding. Back arrow or brand mark, one short title (16px 600), up to two 44px icon buttons. No large title, no greeting block. The title is the only `h1`. Settings and language live in a sheet.
- **Bottom tab bar:** floating capsule, 64px high, 4px inner padding, glass 88%, shadow as above, 8px gap from the screen edge plus safe-area. 3 to 5 slots, each a 22px icon over a 14px 600 label in black. Active slot: `#dcecff` capsule fill and an accent-coloured icon (label stays black). Pressed: fill `tint`.
- **Card:** glass 88%, radius 18, padding 16, no border (edge comes from the inset 0.5px). Title 20px 600 top-left, optional quiet link top-right (44px target via negative margin). `tight` variant: padding 0, overflow hidden, for lists.
- **List row:** min 60px, padding 12px 16px, leading 36 to 40px tinted icon disc, title 16px 600, sub 14px ink-2, trailing chevron `#8e8e93` 18px or an amount (tabular). Divider is a 0.5px hairline starting at 16px inset, drawn on rows after the first. Pressed: `grouped` fill. Unread: 8px accent dot after the title.
- **Status pill:** capsule, padding 3px 10px, 14px 600, line height 1.35, optional 14px icon or 6px dot; tones from the status table; neutral = `sunken` + ink-2. Pill text never goes below 14px. Pill carries the state; surrounding text stays black.
- **Primary button:** capsule, 52px (48px default `.btn`), padding 0 20px, 16px 600 black text on `btn-fill`, inset ring `rgba(10,100,214,0.28)`, shadow `0 6px 16px -10px rgba(10,100,214,0.45)`, icon in accent. Hover: slightly stronger gradient. Pressed: scale 0.98 or `tint-strong`. Loading: label stays visible with a spinner beside it ("Sending..."), button disabled and `aria-busy`.
- **Secondary button:** capsule, 48px, glass 88% fill, inset 1px control-edge ring, black text.
- **Quiet/ghost button:** transparent, accent text, 600, padding 0 10px, 44px high. **Danger:** white fill, danger text, inset 1.5px danger ring. **Small:** 44px, 14px.
- **Text input:** white, 52px high, radius 12, padding 0 14px, 16px 400 text, 1px inset control-edge ring (not the 14% hairline), placeholder `muted`. Focus: 3px accent focus ring as above. Error: 2px inset danger ring, error text 14px under the field in danger colour with `role="alert"`. Textarea: min 88px, same ring. Select: same box, native chevron replaced by a 12px muted chevron at right, padding-right 36px. Label above: 14px 600 ink-2, 4px left pad, 6px gap.
- **Segmented control:** track `#e4e8ee`, padding 3, capsule, tabs 44px, 14px 600 ink-2; active tab white capsule with `0 2px 8px -2px rgba(0,0,0,0.15)`.
- **Chip:** 44px capsule, glass fill, control-edge ring, 14px 400; selected: `tint` fill, 1.5px accent ring, 600. Rows scroll horizontally with hidden scrollbar.
- **KPI tile:** 2-column grid, gap 10, glass card radius 18, padding 14px 16px; value 20px 600 tabular (28px only for the single hero number), label 14px ink-2 under it.
- **Empty state:** centred, padding 28px 20px, one 16px 600 title, one ink-2 reason line, one primary button. Nothing else (no illustration required).
- **Photo frame:** radius 18, `sunken` fill, 0.5px hairline, `object-fit: cover`; caption chip bottom-left is a glass capsule with black 14px text; a placeholder shows a simple drawing, never a guessed photo. Row thumbs: 40px, radius 8.
- **Timeline/stepper:** vertical, 16px node discs on a 1px hairline rail; done = filled accent, current = accent ring with white centre (5px border), upcoming = hairline ring. Label 16px (current 600, others 400, upcoming muted); date 14px muted beneath.
- **Sheet/modal:** bottom sheet, solid white, radius 32, centred, `min(414px, 100% - 16px)` wide, 8px from the bottom, max 88dvh, padding 10px 18px 22px, 38x5px grab bar `rgba(60,60,67,0.3)`, 20px 600 title, scrim `rgba(0,0,0,0.22)`; rises 220ms. Close by scrim, Escape and a 44px button. Use a sheet on phones, never a centred dialog.
- **Toast:** solid white (no dark toast, no white text), radius 18, padding 12px 18px, 14px 600 black, centred above the tab bar (about 96px from bottom), shadow above, stays 6s, then fades; one at a time, `role="status"`.
- **Note/banner:** radius 12, padding 12px 14px, 14px, leading 18px icon. Info = glass + accent icon; warn/ok = status fill + status text; error = white + danger ring.
- **Guide overlay:** (guide kit) goal-first: "What do you want to do?", then one ringed element per step; ring radius 12, card radius 22, white solid card, black text.

## 3. Layout rules
- Phone first, one column. Reference max width 414 to 430px, centred on wide screens (this app's 390px frame with a 36px radius on desktop is a valid variation).
- Gutters 16px (cards) to 20px; section gap 12 to 16px; inside a card header margin-bottom 10px.
- Header sticky at top (z 20); tab bar floating or pinned at bottom with `env(safe-area-inset-bottom)` padding; every bottom-fixed element offsets by the tab bar height via one CSS variable, not a literal.
- Main content scrolls under the glass bars (that is the point of the blur); add bottom padding equal to tab bar height plus 16px.
- Desktop: keep the phone column centred on a soft cool background (`#e8f2ff` to `#eef1f6` radial). Do not widen to a dashboard unless a screen is explicitly a desktop tool.
- Focused detail pages: one purpose per page, back arrow in the header, primary action pinned in a footer (glass 72%, top hairline) or as the last card. Main content plus primary action must fit the first 844px.
- Easy view (optional): scale the same four sizes by 1.25, buttons 56px.

## 4. Copy and voice rules
- Plain words, one idea per line, few words; helper text only where a rule needs it (consent, expiry, limits).
- Buttons are short verbs ("Send report", "Mark fixed"), not "Submit". Same job, same word everywhere.
- Empty state = one title, one reason, one button.
- Errors: under the field, say what to do, not what failed. Disabled button: say why underneath.
- Status words are short nouns or participles ("Sent", "In progress", "Fixed", "Refused"); status is shown by pill plus label, never by colour alone.
- Longer languages (Malay runs about 20% longer): let rows wrap to two lines, never truncate with ellipsis, keep singular and plural forms.
- No "Lorem", no jargon, no exclamation marks, no emoji.

## 5. Mapping: target app today -> change
Target already carries a glass/blue token set. Differences are mostly contrast, type and weights.

| Target file | Change |
|---|---|
| `web/src/app/globals.css` `--color-accent: #0a84ff` | set `#0a64d6`; drop `--color-accent-deep` use for text (or set it to `#0a64d6`) |
| `globals.css` `--color-line` used as input border | add `--color-control-edge: #85858b`; keep `--color-line` for dividers only |
| `globals.css` `--text-caption: 0.8125rem` (13px) | `0.875rem` (14px, floor) |
| `globals.css` `--text-display: 2rem` | `1.75rem` (28px, tracking -0.03em, tabular) |
| `globals.css` type | allow weights 400 and 600 only; replace `font-bold`/`font-medium` (Shell, Field, Button quiet, inbox, report, review) with `font-semibold` or normal |
| `globals.css` `--color-bad-bg #fde6e8`, `-strong #fbd9dd` | pink tint: replace by `#ffffff` fill plus 1px inset `--color-bad` ring (Pill bad, Button danger, Notice) |
| `globals.css` `--color-info` `#0b4fae` | `#0a4fa8` (minor); `--color-info-bg #e2edfc` to `#e3f0ff` |
| `globals.css` `.input` | `border: 0; box-shadow: inset 0 0 0 1px var(--color-control-edge); min-height: 3.25rem` (52px); focus `outline: 3px solid color-mix(in srgb, var(--color-accent) 55%, transparent)`; error variant `inset 0 0 0 2px var(--color-bad)`; add `.input[aria-invalid="true"]` |
| `globals.css` `.glass` | border 0.5px (already), set `--color-glass-strong` 0.88 (already); add `@media (prefers-reduced-transparency: reduce)` solid fallback |
| `ui/Button.tsx` primary | `bg-accent-tint` flat to gradient `linear-gradient(180deg,#dcecff,#c7e0ff)`, ring `rgba(10,100,214,0.28)`, `min-h-13` (52px) for primary; text stays black (already) |
| `ui/Button.tsx` secondary | ring `inset 0 0 0 1px var(--color-control-edge)` instead of `border-line-strong` |
| `ui/Button.tsx` disabled | replace `opacity-60` with `bg-sunken text-ink-2` plus control-edge ring; keep label visible while loading (spinner currently hides label via `invisible`: show spinner beside label instead) |
| `ui/Button.tsx` danger | `bg-white text-bad` + 1.5px inset bad ring |
| `ui/Card.tsx` | already glass, radius 18, padding 16; title `text-title font-semibold` ok; add `tight` option (p-0, overflow hidden) for lists |
| `ui/Pill.tsx` | text now 14px via caption change; tones: `bad` = white + ring; keep dot; neutral `bg-sunken text-ink-2` ok |
| `app/StatusPill.tsx` | map open/sent=`info`, in_progress=`warn`, fixed=`good`, add refused=`bad` |
| `ui/Field.tsx` | label `text-caption font-semibold text-ink-2` ok (becomes 14px); error text `font-medium` to `font-semibold`, add `role="alert"` |
| `ui/EmptyState.tsx` | title `text-body font-semibold` (16px) rather than 20px; hint `text-ink-2` not muted; keep one action |
| `app/Shell.tsx` AppHeader | make sticky + glass 72% + hairline `0.5px`; height 48px; brand `font-semibold` not `font-bold`; keep one `h1`; `PageTitle` `text-display font-bold` to semibold at title size on detail pages (no big title) |
| `app/Shell.tsx` ScreenFooter / Notice | footer glass ok; Notice radius 12, 14px, add 18px leading icon; warn/good keep status fills |
| `app/TabBar.tsx` | make it a floating capsule: height 64px, `bg-glass-strong`, `shadow 0 12px 30px -12px rgba(20,30,60,0.3)`, 8px outer margin plus safe-area; icon 22px (`size-[22px]`), stacked above label (flex-col, gap 2px); active fill `#dcecff`, icon `text-accent`, label stays `text-ink`; inactive label `text-ink` not `text-muted` |
| `app/Timeline.tsx` | already matches stepper; lift 14px text via caption; `font-medium` to normal; done node accent `#0a64d6` |
| `app/PhotoFrame.tsx` | radius 18 and glass caption ok; use `border-[0.5px]`; caption chip 14px (via caption change) |
| `app/ActionLink.tsx` | same changes as `Button.tsx` (shares variants); min-h 52px for primary |
| new (not present) | `Sheet` (solid white, radius 32, grab bar, scrim), `Toast` (solid white, radius 18, 6s), `Segmented`, `KpiTile` for the dashboard: follow section 2 |

---
name: LaporKaki
description: Snap a public problem, AI routes it to the right council, everyone sees it get fixed. Calm Apple-glass phone look, black on white, one blue.
colors:
  ink: "#000000"
  ink-2: "#3a3a3c"
  muted: "#5c5c61"
  page: "#ffffff"
  backdrop-top: "#eaf3ff"
  backdrop-bottom: "#f7f9fc"
  grouped: "#f4f8fc"
  sunken: "#ececf0"
  hairline: "rgba(60,60,67,0.14)"
  control-edge: "#85858b"
  accent: "#0a64d6"
  tint: "#e3f0ff"
  tint-strong: "#cfe4ff"
  btn-top: "#dcecff"
  btn-bottom: "#c7e0ff"
  info: "#0a4fa8"
  info-bg: "#e3f0ff"
  warn: "#8a4600"
  warn-bg: "#fdf0dc"
  good: "#1c6e33"
  good-bg: "#e3f4e7"
  bad: "#b0001a"
  bad-bg: "#ffffff"
  glass: "rgba(255,255,255,0.72)"
  glass-strong: "rgba(255,255,255,0.88)"
typography:
  small:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Helvetica Neue', Arial, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Helvetica Neue', Arial, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Helvetica Neue', Arial, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Helvetica Neue', Arial, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  sheet: "32px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.btn-top}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: "48px"
  button-quiet:
    textColor: "{colors.accent}"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.page}"
    textColor: "{colors.bad}"
    rounded: "{rounded.full}"
    height: "48px"
  input:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "52px"
  card:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-hero:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.xl}"
    padding: "18px"
  pill:
    typography: "{typography.small}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  header:
    backgroundColor: "{colors.glass}"
    height: "48px"
  tab-bar:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.full}"
    height: "64px"
  tab-active:
    backgroundColor: "{colors.btn-top}"
    textColor: "{colors.ink}"
  kpi-tile:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
---

# LaporKaki design system

Every screen, worker brief and review follows this file. Source of the look: the studio's shared design system (structure) and its approved glass phone app (skin), adapted for LaporKaki. Review evidence that shaped it: `docs/design/critique-A.md`, `docs/design/detect-B.md`, `docs/design/reference-style.md`.

## Overview

**Who and where:** a citizen standing on a Malaysian road, phone in one hand, often in bright sun; a council officer clearing a queue; a judge who looks for 90 seconds. **Mode:** Operate (task first). **Feeling:** calm, trustworthy, public-service, quietly confident. Not a startup toy, not a government form.

The look is Apple glass on a soft cool backdrop: black text, white glass cards, one confident blue. The one thing that makes it LaporKaki rather than any app is **the real photo of the real problem**, plus **the council's name** in big type. Every screen puts one of those first.

Three rules beat everything else:
1. **One strong blue thing per screen:** the primary action. Pale tint is only for selected states.
2. **Status speaks in colour plus a word:** Sent (blue), In progress (amber), Fixed (green), Refused (red ring). Never colour alone.
3. **Never white text.** Not on buttons, not on photos, not on toasts.

## Colors

- **Ink** `#000` for all text that matters. **Ink-2** `#3a3a3c` for secondary facts (place, date). **Muted** `#5c5c61` only for captions and placeholders, never for a fact the user needs.
- **Page:** a soft vertical backdrop `#eaf3ff` to `#f7f9fc` behind everything, on phone and desktop. Without it glass is invisible (the main reason the first build looked flat).
- **Accent** `#0a64d6` (5.6:1 on white) for icons, links, progress, the current tab icon, focus rings and the primary button's ring. `#0a84ff` is too pale for text or icons: do not use it.
- **Tint** `#e3f0ff` / **tint-strong** `#cfe4ff`: selected row, active chip, active tab capsule. Not for buttons, not for table headers, not for notices.
- **Control edge** `#85858b`: the visible 1px edge of every input, chip, secondary button and checkbox. The 14% hairline is for decorative dividers only.
- **Status** (dark text on pale fill; the accent is never reused for status): info/Sent `#0a4fa8` on `#e3f0ff`; warn/In progress `#8a4600` on `#fdf0dc`; good/Fixed `#1c6e33` on `#e3f4e7`; bad/Refused `#b0001a` on white with a 1px `#b0001a` ring. **No pink fills anywhere.**
- Severity uses the same scale: Low = neutral pill, Medium = warn, High = bad ring.

## Typography

One system font stack, **four sizes, two weights**:

| Role | Size | Weight | Use |
|---|---|---|---|
| small | 14px / 1.35 | 400, 600 | labels, pills, tab labels, captions, meta |
| body | 16px / 1.45 | 400, 600 | body, buttons, inputs, row titles, ticket facts |
| title | 20px / 1.25, -0.01em | 600 | card and section titles, KPI values, the council name on a ticket |
| display | 28px / 1.1, -0.03em | 600 | one per screen: the page title or the hero number |

- Floor is 14px. No 11, 12 or 13px text. Weights 400 and 600 only (no `font-medium`, no `font-bold`).
- Numbers (counts, days, ringgit, ticket ids) use `tabular-nums`.
- Facts the user acts on (place, council, severity) are body 16px in ink or ink-2, never 14px muted.
- Inputs stay 16px so iOS does not zoom.

## Layout

- **Phone first, one column**, max 430px wide, 16px gutters, 12 to 16px between cards, content padded under the sticky header and above the tab bar (`padding-bottom: calc(var(--tabbar-h) + 16px + env(safe-area-inset-bottom))`).
- **Header:** sticky 48px glass bar with brand mark and one short title. One `h1` per screen.
- **Tab bar:** floating glass capsule, 64px, 8px from the edges plus safe area; 3 tabs for citizens: Report, Dashboard, Help out. The council inbox is not a citizen tab: it lives behind a small "Council view" switch in the header.
- **Desktop (1024px and up):** citizen screens (home, report, review, ticket, help) stay a centred phone column on the backdrop, at most `min(844px, 100dvh - 32px)` tall, never cut off. **Dashboard and inbox go wide** (max 1040px, two columns: KPIs and chart left, table or queue right) because judges see them on a projector and officers work at a desk. The pitch deck is full screen.
- **First viewport rule:** on every screen, the main content and its primary action fit in the first 844px of a phone.
- **Focused detail pages** (ticket, review): back arrow in the header, primary action pinned in a glass footer.

## Elevation & Depth

- Glass recipe: background `rgba(255,255,255,0.88)` (cards, tab bar) or `0.72` (header, footer), `backdrop-filter: blur(22px) saturate(180%)` with the `-webkit-` prefix, edge `inset 0 0 0 0.5px rgba(255,255,255,0.9)` plus a 0.5px hairline border. Solid white fallback under `prefers-reduced-transparency` and when blur is unsupported.
- Card shadow: `0 1px 1px rgba(0,0,0,0.03), 0 10px 30px -14px rgba(20,30,60,0.18)`.
- **Hero card** (one per screen: the photo on home, the AI result on review, the big confirmation on send): gradient white 0.96 to 0.82, ring `0 0 0 1px rgba(10,100,214,0.12)`, shadow `0 16px 36px -18px rgba(20,60,120,0.28)`.
- Tab bar: `0 12px 30px -12px rgba(20,30,60,0.3)`. Sheet: `0 30px 60px -20px rgba(20,30,60,0.4)`. Scrim `rgba(0,0,0,0.22)`.
- Sheets and toasts are **solid white**, never glass.
- Z-order: header 20, footer 20, scrim 40, sheet 41, toast 60.

## Shapes

Radius 8 (thumbs), 12 (inputs, notices), 18 (cards, KPI tiles, photo), 22 (hero card), 32 (sheet). Buttons, pills, chips, segmented controls and the tab bar are full capsules. Icons: 1.75px stroke line icons, 20 to 22px, accent colour when active or leading a primary action, ink otherwise.

## Components

Every tap target is at least 44px. Disabled never fades to low opacity: readable ink-2 text on `sunken` with a control-edge ring, and the reason written under it.

- **Primary button:** capsule 52px, padding 0 20px, 16px 600 **black** label, fill `linear-gradient(180deg,#dcecff,#c7e0ff)`, ring `inset 0 0 0 1.5px rgba(10,100,214,0.45)`, shadow `0 6px 16px -10px rgba(10,100,214,0.45)`, leading icon in accent. Hover: slightly deeper gradient. Pressed: scale 0.98. **Loading: label stays visible** ("Checking photo...", "Sending...") with a spinner beside it, `aria-busy`. Only one per screen.
- **Secondary:** capsule 48px, glass fill, 1px control-edge ring, black label. **Quiet:** accent text, 600, 44px. **Danger:** white, bad text, 1.5px bad ring.
- **Text input / textarea / select:** white, 52px (textarea 88px min), radius 12, 1px inset control-edge ring, 16px. Focus: 3px accent ring at 55%. Error: 2px bad ring plus a 14px bad message under it with `role="alert"`. Label above: 14px 600 ink-2.
- **Card:** glass, radius 18, padding 16, title 20px 600 top-left, optional quiet link top-right. `tight` variant (padding 0) for lists.
- **Status pill:** capsule, 14px 600, 3px 10px, 6px leading dot; tones per Colors. The pill carries the state; text around it stays ink.
- **Ticket row** (inbox, lists): 72px min, 48px photo thumb (radius 8) on the left, title 16px 600, meta line 14px ink-2 (council · place · age), status pill on the right. Divider hairline inset 16px.
- **Photo frame:** radius 18, cover, 16:10 on home, 4:3 on ticket; caption chip is a glass capsule bottom-left with black 14px text. A drawing is allowed only as a small fallback tile, never as the hero.
- **AI result (review screen):** hero card with the photo on top, then the problem name in title 20px, then three fact rows (Place, Council, Severity) in body 16px with icons, then the suggested fix in a quiet box, then "Edit" quiet links per row. While the AI works: skeleton rows with shimmer and the label "Reading your photo...".
- **Send confirmation (the peak):** full hero card: large green tick disc, "Sent to MBSJ" in display 28px, ticket id in tabular 20px, one line "What happens next", one primary button "Track my report". Nothing else on screen.
- **KPI tile:** glass radius 18, value 28px 600 tabular for the hero row (Raised, Solved, Median days to fix), label 14px ink-2 under it; 3 across on desktop, 3 across compact on phone (value 20px).
- **Council bar row** (dashboard): council name 16px 600, a 8px capsule bar (track `sunken`, fill accent for solved share, warn for open), "8 of 12 fixed · 6 days" 14px ink-2. Sort slowest last.
- **Timeline:** vertical, 16px nodes on a 1px hairline rail; done = filled accent, current = accent ring, upcoming = hairline ring; label 16px, date 14px muted.
- **Notice:** radius 12, 14px, leading 18px icon. Info = glass plus accent icon (not a tint fill). Max one notice per screen.
- **Demo label:** one small "Demo" pill in the header on every screen. No other demo disclaimers in the body except the pledge screen ("No real money moves").
- **Empty state:** one 16px 600 title, one ink-2 reason, one primary button.
- **Sheet:** solid white, radius 32, grab bar, title 20px; closes by scrim, Escape and a 44px close button. **Toast:** solid white, radius 18, 14px 600 black, above the tab bar, 6 seconds, `role="status"`.
- **Motion:** colour changes 120 to 150ms; sheet rise 220ms ease-out; page enter 6px rise 340ms `cubic-bezier(0.2,0.7,0.2,1)`; skeleton shimmer 1.4s. All stop under `prefers-reduced-motion`.

## Do's and Don'ts

**Do**
- Lead every citizen screen with the photo or the council name.
- Keep one primary button per screen, and make it the only strongly blue block.
- Use status colours on pills, bars and timeline nodes so the screen shows progress at a glance.
- Write short verbs on buttons: "Report a problem", "Send report", "Mark fixed", "Pledge RM10".
- Bahasa Malaysia labels next to English only where they help ("Lapor"), and let rows wrap (Malay runs about 20% longer).
- Test at 390px and 1280px, and in bright light (contrast at least 4.5:1 for text, 3:1 for control edges).

**Don't**
- No white text, no pink, no purple gradients, no emoji, no exclamation marks.
- No pale-tint primary buttons, tint table headers or tint notices.
- No 13px grey text for facts; no `font-medium` or `font-bold`.
- No grey placeholder drawing as a hero; no "Sample photo" captions in the pitch.
- No staff screens linked from citizen screens (the inbox sits behind "Council view").
- No raw error pages in the demo: every route has a friendly error state, and the demo runs on a production build.

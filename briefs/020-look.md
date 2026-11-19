Read `AGENTS.md` (repo root, section "Look") and `web/AGENTS.md` first. Use the `impeccable` skill for the look. The app is in `web/` (Next.js 16, React 19, Tailwind CSS 4, `src/` dir, alias `@/*`). Read the Tailwind 4 notes you need under `web/node_modules/tailwindcss/` and the Next.js docs under `web/node_modules/next/dist/docs/` before writing.

## Job
The base look and a small set of building blocks. No screens, no navigation, no product words: the theme is not known yet.

## Reference
`briefs/ref/glass.css` is the approved glass look (white, black text, glass panels, macOS blue). Carry its colours, radii, blur and shadows over as tokens. Do not copy its page-shell or nav rules.

## Files you own (edit or create only these)
- `web/src/app/globals.css` (replace the starter content)
- `web/src/components/ui/Card.tsx`
- `web/src/components/ui/Button.tsx`
- `web/src/components/ui/Pill.tsx`
- `web/src/components/ui/Field.tsx`
- `web/src/components/ui/EmptyState.tsx`
- `web/src/components/ui/index.ts`

## Rules for the look
- Light only. Remove the dark-mode block. White background, near-black text. Never white text on anything except the one blue primary button.
- One accent: macOS blue. No pink, no gradients on text, no purple.
- Four type sizes only, as tokens: caption, body, title, display. Body is at least 16px on phones.
- Tokens go in `@theme` so Tailwind utilities exist for them (`bg-glass`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `rounded-card`, `shadow-card`). Any plain CSS you add goes inside `@layer base` or `@layer components`: unlayered rules beat Tailwind 4 utilities and must not be used.
- Glass panel: translucent white, `backdrop-filter: blur`, hairline border, soft shadow. Provide a solid white fallback under `@supports not (backdrop-filter: blur(1px))`.
- Tap targets at least 44px high. Visible focus ring (2px accent, 2px offset) on every interactive part. Respect `prefers-reduced-motion`.
- Text contrast at least 4.5:1, including muted text on glass.

## Components (server-safe unless they need state; plain props; no new dependency)
- `Card`: glass panel, optional `title` and `action` slot, `as` prop for the element.
- `Button`: `variant` `primary | secondary | quiet | danger`, `size` `md | lg`, `loading` (shows a small spinner and sets `aria-busy`, keeps its width), forwards native button props.
- `Pill`: status pill, `tone` `neutral | info | good | warn | bad`. Tone is carried by text and a dot, not colour alone.
- `Field`: label, input slot, hint and error text wired with `aria-describedby` and `aria-invalid`.
- `EmptyState`: one line title, one line hint, optional action.
- `index.ts` re-exports all five.

## Rules
Do not edit `layout.tsx` or `page.tsx`. No git. No shell commands. No other file. End with a report under 150 words listing the files and the token names you defined.

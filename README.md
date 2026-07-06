# ISO — interactive prototype

A mobile-first, interactive front-end prototype of **ISO (Intimate Setting Online)** —
a real-time dating app built around one enforced constraint: **one conversation at a
time.** React + TypeScript + Vite · Tailwind · Zustand · Framer Motion. Everything
hard (matchmaking, the partner, verification, payments) is mocked per the build spec;
no backend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app renders in a phone frame on desktop.
`npm run build` produces a production build (`dist/`).

State persists to `localStorage`, so a demo survives refresh. Reset from the
`?debug` panel or Profile → Settings → *Reset demo data*.

## The `?debug` demo panel

Open **http://localhost:5173/?debug** and tap the dark **⚙︎** button (bottom-right
of the phone). It stays enabled for the browser session. Controls:

| Control | What it does |
|---|---|
| Match result | Force the next queue search to **match** or **no-match** (screen 14) |
| Next persona | Pin which persona the matchmaker draws |
| Partner engine | **scripted** ↔ **LLM** (see below) |
| Partner "keep talking?" | Force the partner's answer: auto / yes / no |
| ISO+ | Toggle the premium unlock |
| Force mutual revival | Surfaces the blind-mutual revival offer (only when you're free — it refuses with a toast mid-chat, by design) |
| Advance time +48h | Simulates the outcome window on an ongoing chat ("Did you two meet up?") and runs revival flag-decay |
| Skip to app | Jump past onboarding straight to the queue |
| Reset all state | Clears persisted state and reloads |

## Optional: LLM-driven conversation partner

By default the partner is scripted per persona. To make the conversation real,
create a `.env` in the project root (see `.env.example`):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Restart `npm run dev`, then flip **Partner engine → LLM** in the `?debug` panel.

How it works: the Vite dev server exposes a proxy at `/api/partner`
([vite.config.ts](vite.config.ts)) that forwards to the Anthropic Messages API and
injects the key **server-side** — the key never appears in browser code or the
bundle. If the key is unset or any call fails, the app silently falls back to the
scripted persona; the demo never breaks.

## Motion system

All motion is driven by named presets in [src/lib/motion.ts](src/lib/motion.ts)
(`snap` / `standard` / `soft` / `gentle` springs + tween durations) — no ad-hoc
easing. The signature moment is the **color wave**
([src/components/ColorWave.tsx](src/components/ColorWave.tsx)): a solid flood of
brand color blooming from the exact tap point, reserved for five thresholds only
(enter queue, match found, mutual keep-talking, "yes we met", clean chat close).
The three tabs are a swipeable track (drag between them; the indicator follows
your finger). `prefers-reduced-motion` swaps waves and slides for quick fades.

**Pacing philosophy (product-owner-tuned):** arrivals are slow — like getting
to know someone — while input feedback stays instant. The splash boots in
stages (gradient → logo → tagline → buttons, ~2.5s; buttons are inert until
they've visibly arrived), screens settle in piece by piece, the match reveal
dwells on the face before the name, and the keep-talking wait is a held
breath (~2–3.5s). Wave timing: **850ms bloom / 650ms clear** (slowed twice
from the brief's 450/380ms).

## Structure

```
src/
├── data/seedData.ts        # personas, prompts, seeded history (verbatim drop-in)
├── store/useIsoStore.ts    # single Zustand store — the one-active-chat invariant
│                           #   lives HERE: enterQueue() is a no-op with a toast
│                           #   while any chat exists
├── lib/
│   ├── matchmaker.ts       # mock queue: 2–6s delay, forced no-match, persona draw
│   ├── partner/            # PartnerEngine interface · scripted · LLM w/ fallback
│   └── time.ts             # demo clock, decay/cooldown windows
├── screens/
│   ├── onboarding/         # 01 splash (reproduces iso-splash.svg) · 02–08
│   ├── core/               # 09–16: queue, searching, match, live room,
│   │                       #   keep-talking (simultaneous reveal), one chat, close
│   ├── plus/               # 17–22: paywall, Memories, live prompts, date planner
│   ├── safety/             # 23–24: report/block sheet, safety center
│   ├── account/            # 25–27: profile hub, settings, edit, subscription
│   └── v2/                 # 28–31: revival offer, closeout (reflection/outcome),
│                           #   trend + weekly recap, burnout nudge
└── components/             # PhoneFrame, TabBar (exactly 3 tabs), ReplyTimer, …
```

## Sharing & testing on other devices

- **On your phone (same Wi-Fi):** `npm run dev:host`, then open the
  `http://<your-ip>:5173` URL Vite prints. The app renders full-bleed on
  mobile viewports.
- **Online for anyone:** pushing `main` to GitHub runs
  [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds
  and publishes to GitHub Pages (SPA fallback included; the LLM partner
  gracefully falls back to scripted mode there since the dev proxy doesn't
  exist on static hosting).
- **Presentation deck:** `slides/ISO_Product_Intro.pptx` — a 10-slide product
  introduction built from real captures. Regenerate screenshots with
  `node scripts/capture.mjs` (dev server running) and rebuild with
  `node slides/build-deck.cjs`.

## UI/UX design document

[public/design-doc.html](public/design-doc.html) — the full design rationale:
every screen and user flow rendered as annotated hi-fi mockups, organized by
flow lane (onboarding → core loop → outcome/revival/burnout → profile/ISO+ →
trust), with each design choice tagged (principle / motion / pacing / copy /
trust) and a "prioritized" note explaining the trade-off. While the dev server
runs it's served at **http://localhost:5173/design-doc.html**; it's also a
self-contained file you can open directly in a browser.

Authoritative docs live in [docs/](docs/) (`ISO_PRD_v2.md`,
`ISO_Prototype_Build_Spec.md`, `APPROVED_PLAN.md`, `ASSETS.md`, wireframe kit).
Validation results: [VALIDATION.md](VALIDATION.md).

# CLAUDE.md — ISO project handoff

You (Claude) are picking up an in-flight project on a fresh account. This file is
the single source of truth for **what exists, where it lives, how it's built, and
the rules you must not break.** Read it fully before touching anything. When in
doubt, prefer the more specific docs it points you to.

---

## 0. TL;DR — what this is

Two shipped, deployed things built by/for **Paul Jeon** (`pjeon1804@gmail.com`,
GitHub `pjeon18`):

1. **ISO** — a high-fidelity, interactive **front-end prototype** of a dating app
   whose entire premise is **one conversation at a time**. React + TypeScript +
   Vite, all backend mocked. 31 screens, a custom motion system, full product docs.
2. **A personal portfolio site** featuring ISO as the flagship case study.

Both are **live on GitHub Pages** and auto-deploy on push to `main`.

| Thing | Live URL | Repo |
|---|---|---|
| ISO prototype | https://pjeon18.github.io/iso-prototype/ | https://github.com/pjeon18/iso-prototype |
| ISO design doc | https://pjeon18.github.io/iso-prototype/design-doc.html | (same repo, `public/design-doc.html`) |
| Portfolio | https://pjeon18.github.io/ | https://github.com/pjeon18/pjeon18.github.io |
| ISO case study | https://pjeon18.github.io/iso.html | (portfolio repo, `iso.html`) |

The prototype has a `?debug` demo panel: append `?debug` to any URL, then tap the
gear (bottom-right of the phone frame).

---

## 1. Local layout

Everything lives under the working directory **`/Users/pauljeon/Downloads/assets/`**
(this is the original design-asset drop; the two git repos are subfolders inside it).

```
assets/                              ← working dir (NOT a git repo itself)
├── CLAUDE.md                        ← this file
├── ASSETS.md                        ← original asset manifest
├── ISO_Wireframe_Kit_reference.html ← the 27-screen lo-fi wireframe blueprint
├── iso-splash.svg, iso-*.svg        ← original brand SVGs (source of truth for the logo)
├── iso-brand-sheet.svg              ← full brand exploration sheet
│
├── iso-prototype/                   ← GIT REPO #1 (the app)  → github.com/pjeon18/iso-prototype
│   ├── CLAUDE.md                    ← the app's own working-context file (design tokens, principles)
│   ├── README.md                    ← setup / run / ?debug / .env / sharing instructions
│   ├── VALIDATION.md                ← traced acceptance criteria + audits (build spec §9 + motion §4)
│   ├── docs/                        ← the authoritative product spine (see §5)
│   │   ├── ISO_PRD_v2.md
│   │   ├── ISO_Prototype_Build_Spec.md
│   │   ├── APPROVED_PLAN.md
│   │   ├── ASSETS.md
│   │   └── ISO_Wireframe_Kit_reference.html
│   ├── public/
│   │   ├── assets/                  ← iso-mark-white.svg, iso-splash.svg, app icon, tagline SVGs
│   │   └── design-doc.html          ← the self-contained UI/UX design document (every screen, annotated)
│   ├── src/                         ← the app (see §4 for the full map)
│   ├── scripts/capture.mjs          ← Playwright screenshot capture of the running app
│   ├── slides/                      ← the product-intro deck + its build script
│   │   ├── build-deck.cjs           ← pptxgenjs deck generator
│   │   ├── ISO_Product_Intro.pptx   ← the generated 10-slide deck
│   │   ├── shots/                   ← captured phone screenshots (source for deck + portfolio)
│   │   └── assets/                  ← bg-gradient.png, iso-mark-white.png (deck assets)
│   ├── .github/workflows/deploy.yml ← GitHub Pages CI (builds with repo-scoped base path)
│   ├── .env.example                 ← ANTHROPIC_API_KEY (optional LLM partner)
│   ├── vite.config.ts               ← Vite config + the /api/partner dev proxy
│   ├── tailwind.config.js, postcss.config.js, tsconfig.json
│   └── package.json
│
└── pjeon18.github.io/               ← GIT REPO #2 (the portfolio) → github.com/pjeon18/pjeon18.github.io
    ├── index.html                   ← portfolio home (hero + featured ISO card)
    ├── iso.html                     ← the ISO case study page
    └── assets/
        ├── site.css                 ← portfolio styles
        ├── shots/                   ← ISO screenshots (copied from the prototype's slides/shots)
        ├── ISO_Product_Intro.pptx   ← downloadable deck
        ├── iso-mark-white.png, bg-gradient.png
```

**Note:** `assets/` itself is not version-controlled; the two subfolders are
independent git repos. The screenshots in the portfolio and deck are **copies** of
`iso-prototype/slides/shots/` — regenerate at the source, then copy outward (see §7).

---

## 2. Who the user is & how to work with them

- **Paul Jeon** — building ISO as a portfolio/case-study project (product design +
  UI/UX + front-end). Values the product's *values being visible in the interface*:
  what it refuses to do, how it paces itself, how it treats people.
- Communicates in terms of feel and taste ("gentler," "more intense," "feels
  cheap"). Translate those into concrete, tokenized changes — don't ask him to
  spec pixel values.
- He reviews by looking at the running app. **Always verify visual changes in the
  browser** (screenshots) before declaring done.
- He has explicitly approved: plan-then-build, tier order, the six engineering
  decisions in `APPROVED_PLAN.md §D`, and the motion brief. Don't reopen those.

---

## 3. THE NON-NEGOTIABLE PRODUCT PRINCIPLES

These are the whole point. Violating one is a failure even if the feature works.
If a request would break one, **stop and flag it** instead of building it.

1. **One conversation at a time is enforced in the STORE**, not the UI. A user with
   an active chat literally cannot queue or open another — `enterQueue()` is a
   no-op with a toast while `activeChat !== null`. Disabled buttons are decoration.
2. **Three tabs only: Queue · Chat · Profile. Never add a matches/inbox tab.**
   Memories, trend, recap, settings, "Maybe We'll Meet Again" all nest under Profile.
3. **No dead chats.** A conversation becomes mutual or ends cleanly back to the
   queue. Nothing rots in an inbox.
4. **Rank experiences, never people.** No scored list of humans anywhere. The trend
   is floor-bounded and can't "crash"; reflection is about the *experience*.
5. **Reflection is a private journal, not an obligation** — no unread counts, no
   reply pressure, no re-rejection. Everything skippable.
6. **Revival ("Maybe We'll Meet Again") is blind + single-slot + flag-decay.**
   One-sided holds are invisible and expire silently; blocks are absolute.
7. **Monetize convenience/expression, never visibility or matches.** Nothing in the
   matchmaker reads `isPlus`.
8. **Reflection is implicit-first** — behavioral signal primary; explicit rating
   optional/weekly.

Design principles layered on top (from the motion work): **loud thresholds, calm
baseline** (color waves at 5 moments only); **slow arrivals, instant feedback**;
**no emoji anywhere** (use the custom icon set — see §4); **one confident orange**,
green (`#00FF77`) reserved for real/mutual/present.

---

## 4. The app — architecture map (`iso-prototype/src/`)

Stack: **React 18 + TypeScript + Vite + Tailwind + React Router + Zustand + Framer
Motion.** No backend; everything mocked.

- **`store/useIsoStore.ts`** — ONE Zustand store, the single source of truth,
  persisted to localStorage. Holds session, `profile`, queue state, the nullable
  singleton `activeChat`, history, reflections/outcomes, `revival` (the one slot),
  blocks/reports, debug. **The one-active-chat invariant lives in the actions here.**
  Key actions: `enterQueue`, `sayHi`, `sendMessage`, `timerLapsed`, `readyToDecide`,
  `answerKeepTalking`, `resolveKeepTalking`, `requestCloseOngoing`, outcome/
  reflection/revival actions, `forceMutualRevival`, `acceptRevival`,
  `releaseRevival`, `advanceTime`, `updateProfile`, `resetAll`.
- **`lib/`**
  - `motion.ts` — the motion token system: `springs` (snap/standard/calm/soft/
    gentle), `durations` (incl. `waveIn`/`waveOut`), easings, `press`, stagger
    helpers. **All motion uses these named presets — no ad-hoc easing.**
  - `matchmaker.ts` — mock queue (2–6s, forced no-match, persona draw, blocks).
  - `partner/` — `types.ts` (PartnerEngine), `scripted.ts` (canned persona replies),
    `llm.ts` (Anthropic via `/api/partner` dev proxy, silent fallback to scripted).
  - `time.ts` — demo clock (+ debug offset), decay/cooldown windows.
  - `assets.ts` — `asset()` helper: base-path-safe public URLs (critical for Pages).
- **`components/`** — `PhoneFrame`, `TabBar` (3 tabs), `Avatar`, `ReplyTimer`,
  `TypingDots`, `Toasts`, `Modal`, `DebugPanel`, `ColorWave` (the signature
  bloom-from-tap threshold effect), `Slider` (`BigSlider` + two-thumb `RangeSlider`),
  **`icons.tsx`** (the custom stroke icon set + `FeelScale` — these REPLACE all
  emoji; when you need a glyph, add to this set, never use an emoji).
- **`screens/`**
  - `onboarding/` — `Splash` (slow staged boot, intense gradient), `Onboarding`
    (10 steps: signup, .edu, photo, basics, 9-photo grid, interests, prompts,
    socials, prefs w/ sliders, permissions).
  - `core/` — `QueueTab`, `Searching`, `MatchFound`, `LiveRoom`, `KeepTalking`
    (simultaneous sealed reveal), `NoMatch`, `ChatTab` (the one chat + close
    confirm), `ClosedView` (polite close).
  - `plus/` — `Paywall`, `Memories`, `LivePrompts` (+ date planner).
  - `safety/` — `ReportBlockSheet`, `SafetyCenter`.
  - `account/` — `ProfileHub` (bento grid), `EditProfile` (3×3 grid + basics +
    interests + socials + prompts), `Settings`, `Subscription`.
  - `v2/` — `Overlays` (closeout wizard, ongoing-outcome prompt, revival offer,
    burnout nudge), `TrendRecap`, `MaybeAgain` (the revival-flag home screen).
- **`styles/tokens.css`** — CSS variables (colors, radii), base component classes
  (`.btn`, `.chip`, `.card`, `.input`), press states. **Green is `#00FF77`.**
- **`App.tsx`** — router + `PhoneFrame` + swipeable 3-tab track + global overlays +
  `ColorWaveHost`. `main.tsx` sets the router `basename` from `BASE_URL`.

### Design tokens (also in `iso-prototype/CLAUDE.md` and `tokens.css`)
`--iso-accent #FF8000` · `--iso-accent-soft #F8BD62` · `--iso-accent-tint #FFE8C1` ·
`--iso-bg #FFF9F0` · `--iso-surface #FFFFFF` · `--iso-text #3A2410` ·
`--iso-text-2 #5A3418` · `--iso-text-3 #6B4A2A` · `--iso-neutral #55555E` ·
**`--iso-green #00FF77`**. Fonts: Poppins (display/headers), Inter (body). Radii:
14/16px cards, 99px pills, 50% avatars. Splash gradient stops (intense variant):
`#FFCE65 → #FF8C2E → #D64400`.

---

## 5. The authoritative product docs (read for intent, not just code)

In `iso-prototype/docs/`. Precedence: **build spec wins on scope; PRD wins on
product intent; APPROVED_PLAN wins on the six engineering decisions it resolves.**

- **`ISO_PRD_v2.md`** — full product spec: problem, principles, all features
  (§9.1–9.13), North Star (real-life dates initiated), screen inventory (31 screens).
- **`ISO_Prototype_Build_Spec.md`** — scopes the PRD to the prototype; stack,
  mocking (§4), fidelity tiers (§5), design tokens (§6), principles (§7),
  acceptance criteria (§8), validation checklist (§9).
- **`APPROVED_PLAN.md`** — the approved architecture + build order + six resolved
  engineering decisions (§D): store-enforced invariant, LLM via dev proxy, reply-
  timer behavior, keep-talking trigger, outcome timing, onboarding skip.
- **The Motion & Polish Brief** (was provided as a separate file during the build;
  its rules are captured in `motion.ts`, `VALIDATION.md §6`, and the design doc):
  loud/quiet hierarchy, the color-wave registers, swipeable tabs, bento profile.
- **`public/design-doc.html`** — the human-facing UI/UX design document: every
  screen rendered as an annotated mockup with the design rationale. Open it in a
  browser (or at the live `/design-doc.html` URL).

---

## 6. Running & building locally

```bash
cd iso-prototype
npm install
npm run dev            # → http://localhost:5173  (add ?debug for the demo panel)
npm run dev:host       # same, exposed on the LAN for phone testing
npm run build          # tsc + vite build → dist/
npm run preview        # serve the production build
```

- Node 20+ (developed on v22). 
- **Optional LLM partner:** copy `.env.example` → `.env`, set `ANTHROPIC_API_KEY`.
  The Vite dev proxy (`vite.config.ts`) injects it server-side at `/api/partner`;
  the key never reaches the browser. Without it, the partner is scripted. On the
  static Pages build there is no proxy, so it's always scripted there.
- Screenshots: with the dev server running, `node scripts/capture.mjs` (needs
  `npx playwright install chromium` once).
- Deck: `node slides/build-deck.cjs` then recompress with the pptx skill's
  `rezip.py` (needs `npm i -D pptxgenjs`; QA render needs LibreOffice + poppler).

---

## 7. Deployment (both sites)

Both repos deploy to **GitHub Pages** and are already enabled.

- **Prototype** (`iso-prototype`): push to `main` triggers
  `.github/workflows/deploy.yml`, which builds with a repo-scoped base path
  (`BASE_PATH="/iso-prototype/"`), copies `index.html`→`404.html` for SPA deep
  links, and publishes `dist/`. Base-path safety relies on `lib/assets.ts` +
  the router `basename` — **keep public asset refs going through `asset()`**, never
  hard-code `/assets/...`.
- **Portfolio** (`pjeon18.github.io`): a plain static site; Pages serves it from
  `main` at the root. No build step. Push and it's live.
- **After changing app screens that appear in the deck/portfolio:** regenerate
  shots (`node scripts/capture.mjs`), rebuild the deck, then
  `cp slides/shots/*.png ../pjeon18.github.io/assets/shots/` and
  `cp slides/ISO_Product_Intro.pptx ../pjeon18.github.io/assets/`, commit both repos.

### Git / GitHub auth note
The user's macOS keychain holds a GitHub HTTPS token (`pjeon18`, `repo`+`workflow`
scopes). Standard `git push` works. Commits in this project end with:
```
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```
Only commit/push when the user asks. If Pages ever 404s after the first workflow
run, enable it via the API (`POST /repos/{owner}/{repo}/pages` with
`{"build_type":"workflow"}` for the app, `{"source":{"branch":"main","path":"/"}}`
for the portfolio) then re-dispatch the workflow.

---

## 8. State of the project (as of this handoff)

**Done & shipped:** the full core loop; onboarding (rebuilt Hinge/Tinder-grade with
9-photo captioned 3×3 grid, custom-chip gender, sliders for all numerics, interests,
socials-connect); reflection + outcome (North Star) + burnout nudge; revival reworked
into "Maybe We'll Meet Again" (dedicated screen + bento card + release flow); ISO+,
Memories, trend/recap, safety, account; the motion system (color waves, swipeable
tabs, gentle pacing); emoji fully purged in favor of the custom icon set; green
corrected to `#00FF77`; the design doc, the deck, the portfolio + case study; both
deployed and verified live.

**Known deferred / open:**
- Persona conversational emoji in `src/data/seedData.ts` were intentionally LEFT in
  (they read as authentic human texting, not UI chrome). If the user wants total
  emoji removal, strip those too.
- The "chat open" shared-element morph is an approximation (documented in VALIDATION).
- 60fps verified on throttled desktop only, not a physical mid-range phone.
- Two-tab live mode via `BroadcastChannel` (build spec §4.3 stretch goal) not built.

**Before declaring any change done:** run `npx tsc -b`, `npm run build`, and verify
in the browser. Update `VALIDATION.md` if you touch acceptance-criteria behavior.

---

## 9. Gotchas

- The swipeable tab track keeps all 3 tab panes mounted — reading `document.body`
  text during tests shows all three; gate on the actual route/visible pane.
- `?debug` persists via `sessionStorage`, so it survives the reset-reload.
- `resetAll()` clears localStorage and reloads — the clean-slate button.
- Deep routes under Profile animate in via a morph/slide; navigate through the
  bento cards or push the route directly.
- Never put the Anthropic key in browser code or commit a real `.env`.

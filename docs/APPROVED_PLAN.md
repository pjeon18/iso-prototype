# ISO prototype — APPROVED Phase 1 plan (do not re-plan)

**Status:** Phase 1 is complete and approved by the product owner. Build against this plan.
On conflict: build spec wins on scope, PRD wins on product intent, this file wins on the
engineering decisions it explicitly resolves (§D below).

---

## A. What the prototype must do, and the validation question

A mobile-first (~390px viewport, rendered in a CSS phone frame on desktop) React +
TypeScript + Vite front-end letting one person experience the entire ISO loop in a
browser: onboarding → queue → live match → real-time conversation with a gentle reply
timer → mutual "keep talking?" → the single ongoing chat → reflection, outcome prompt,
close, re-queue — plus revival, Memories, trend/recap, burnout nudge, and ISO+ surfaces.
All hard parts mocked per build spec §4; no backend.

**Validation question:** *Does the one-conversation-at-a-time loop — with presence,
mutual continuation, reflection, and outcomes — feel better than the roster, and is the
flow coherent?* Done = Tier 1 feels emotionally real, every branch is demonstrable on
command via `?debug`, and nothing violates the eight principles (build spec §7).

## B. Architecture

### File structure

```
iso-prototype/
├── public/assets/            # splash, logomarks, app icons (per ASSETS.md)
├── src/
│   ├── main.tsx / App.tsx    # router + PhoneFrame + TabShell (Queue/Chat/Profile — exactly 3)
│   ├── data/seedData.ts      # provided file, dropped in verbatim
│   ├── store/useIsoStore.ts  # Zustand, persisted to localStorage
│   ├── lib/
│   │   ├── matchmaker.ts     # mock queue: 2–6s delay, forceNoMatch, persona draw
│   │   ├── partner/
│   │   │   ├── types.ts      # PartnerEngine interface
│   │   │   ├── scripted.ts   # opener + rotating replies, human-like delays + typing dots
│   │   │   └── llm.ts        # Anthropic API via persona llmSystemPrompt; graceful fallback
│   │   └── time.ts           # timers, decay windows, "advance time" demo helper
│   ├── screens/
│   │   ├── onboarding/       # 01–08
│   │   ├── core/             # 09–16: Queue, Searching, MatchFound, LiveRoom,
│   │   │                     #   KeepTalking, NoMatch, OneChat, CloseConfirm
│   │   ├── plus/             # 17–22: paywall, bg queue, match-ready toast, Memories,
│   │   │                     #   live prompts, date planner
│   │   ├── safety/           # 23–24: report/block, safety center
│   │   ├── account/          # 25–27: settings, edit profile, subscription
│   │   └── v2/               # 28 RevivalOffer · 29 Reflection · 30 Trend+Recap · 31 BurnoutNudge
│   ├── components/           # Avatar, Pill, TimerRing, TypingDots, Toast, DebugPanel…
│   └── styles/tokens.css     # build spec §6 tokens + --iso-green: #20C55E;
│                             # Poppins (600/700 display) / Inter (400/500 body) via @fontsource
```

### State model — one Zustand store, single source of truth

Slices:
- `session` — onboarding progress, `currentUser`, `isPlus`.
- `queue` — `idle | searching | matched | noMatch`.
- `activeChat` — **nullable singleton**: persona, messages, phase
  (`live | keepTalkingPrompt | ongoing | closed`), turn count, timer state.
- `reflections` + `outcomes` — seeded from `seedHistory`, appended live. The outcome loop
  ("Yes, we met") is real in the data model — it is the North Star atom.
- `revival` — one slot `{ personaId, flaggedAt } | null` with silent decay check;
  `revivalSeed` powers the forced-mutual demo.
- `history` — drives Memories / trend / recap.
- `debug` — initialized from `demoDefaults`, overridden by the `?debug` panel.

**The one-active-chat rule is enforced in the store, not the UI.** `enterQueue()` is a
no-op (with an explanatory toast) whenever `activeChat !== null`; the matchmaker can
never fire while a chat exists. Disabled buttons are decoration; the invariant lives in
the action. Revival honors the same gate ("only when free"). Persist to localStorage so
a demo survives refresh; `?debug` → Reset clears it.

### Mocking

- **Matchmaker** per build spec §4.1: 2–6s randomized delay, occasional/forced no-match,
  personas drawn from `seedData.ts`.
- **Partner engine** behind a common interface. Scripted mode: persona `opener` /
  `replies` / `keepTalkingLine` with randomized 1.5–4s typing delays. LLM mode: Anthropic
  API with the persona's `llmSystemPrompt` + running conversation history; key from env
  (see §D2); silent fallback to scripted if the key is absent or any call fails. Never
  hard-code a key. Partner's "keep talking?" answer follows `keepTalkingDefault` unless
  the debug panel forces yes/no.
- Verification, payments, notifications: stubs per build spec §4.4 (UI-only, succeed
  after a beat, real PRD copy).

### Assets

Reproduce screen 01 from `iso-splash.svg` in code: vertical cream→amber gradient
(`#FFF3DE → #F2A03D`), white chess-piece logomark SVG used as-is (never re-typeset the
"i"), tagline beneath with the word "real" in `--iso-green`. `iso-appicon-dark.svg` as
favicon. Consult `ISO_Wireframe_Kit_reference.html` per screen for layout.

## C. Build order (tiers per build spec §5)

**Tier 1 — core loop, highest fidelity, build first.**
Tokens/fonts/PhoneFrame + 3-tab shell → store skeleton with the one-chat invariant →
screens 09/10/14 (queue, animated matchmaking ring, no-match) → 11 match reveal (Framer
Motion emotional beat) → 12 live room (scripted partner, typing indicator, TimerRing) →
13 keep-talking (both branches, simultaneous reveal) → 15/16 one chat + close confirm →
clean re-queue. Then the `?debug` panel: force match / no-match, persona picker,
LLM-vs-scripted toggle, partner keep-talking yes/no, force mutual revival, advance-time,
skip-to-app, reset. Self-review against Tier 1 acceptance criteria before Tier 2.

**Tier 2.** Onboarding 01–08 with the PRD's real copy and rationale (OTP, .edu,
photo/liveness — all stub-succeed); reflection (optional one-tap at close, frictionless
skip, writes to store); outcome prompt ("Did you two meet up?" — Yes, we met / Not yet /
No; max one active ask; `met` recorded as the North Star atom); revival (private
one-slot flag with replace-prompt, silent flag-decay, blind mutual → screen 28 → **fresh
live room via the normal loop**, never a resurrected thread); burnout nudge after N
low-satisfaction conversations (N from `demoDefaults`). Wire the LLM partner mode here.

**Tier 3.** ISO+ paywall + unlock; background queue + match-ready toast; Memories
(mutual-only, read-only, per-entry wipe, no unread counts / reply affordance / inbox
labeling, ISO+-gated, lives under Profile); trend + one insight + weekly Recap hosting
the batched reflection (seeded so it renders populated; gentle non-crashing curve);
live prompts; date planner; report/block + safety center; settings / edit profile /
subscription.

Then Phase 3: run build spec §9 in full and write `VALIDATION.md`.

## D. Resolved decisions (approved — do not reopen)

1. **Build environment:** Claude Code, in the project repo, running and verifying the
   app for real (dev server, fresh-install check, console-clean happy path).
2. **LLM partner key handling:** add a small **Vite dev-server proxy** (`server.proxy`
   in `vite.config.ts` or a tiny middleware) that forwards `/api/partner` to the
   Anthropic Messages API and injects `ANTHROPIC_API_KEY` from `.env` server-side — the
   key never ships in browser code. Fallback to scripted mode when the env var is unset
   or the call errors. Do **not** use `anthropic-dangerous-direct-browser-access`.
3. **Reply timer expiry:** no penalty at 0 — a soft "still there?" pulse. If a **second
   consecutive** timer lapses, surface "keep talking?" early, framed as "seems like a
   natural pause." Never an abrupt kill; presence, not punishment.
4. **"Keep talking?" trigger:** fires after ~12 total messages **or** when either party
   taps a subtle "ready to decide" affordance, whichever comes first. Simultaneous
   reveal: answers hidden until both have committed.
5. **Outcome prompt timing (demo):** shown (a) on chat close and (b) via the debug
   "advance time" control that simulates the 48h window on an ongoing chat.
6. **Onboarding skip:** `?debug` includes "skip to app" so stakeholder demos can jump
   straight to the queue.

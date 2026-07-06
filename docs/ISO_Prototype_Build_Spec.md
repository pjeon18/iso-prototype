# ISO — Prototype Build Spec (for Claude Code / Claude Fable)

**Companion to:** `ISO_PRD_v2.md` (the authoritative product spec — read it first)
**Purpose of this doc:** scope the PRD down to a **buildable, demo-able, validatable prototype** and make the engineering decisions the PRD deliberately leaves open. Where this doc and the PRD conflict *on scope*, this doc wins. Where they conflict *on product intent or principles*, the PRD wins.

---

## 1. What this prototype is (and is not)

**Is:** a high-fidelity, **mobile-first, interactive front-end prototype** that lets a single person experience the entire ISO loop end-to-end in a browser — onboarding, queueing, a live conversation, the "keep talking?" decision, the one-chat rule, reflection, the outcome loop, revival, Memories, and the recap. It must *feel* real enough to validate the product thesis and demo to stakeholders/investors.

**Is not:** production software. No real accounts, no real user database, no real .edu verification, no payment processing, no production-grade real-time backend, no ML matching. All of that is **mocked** (see §4).

**The validation question this prototype must answer:** *Does the one-conversation-at-a-time loop — with presence, mutual continuation, reflection, and outcomes — feel better than the roster, and is the flow coherent?*

---

## 2. Tech stack (use unless you have a strong, stated reason not to)

- **React + TypeScript + Vite** — fast, standard, easy to run locally.
- **Tailwind CSS** for styling, driven by the design tokens in §6.
- **React Router** for screen navigation.
- **Zustand** (or React Context) for app state — the single source of truth for the user session, queue state, the *one* active chat, reflection data, revival flags, and outcomes. State may persist to `localStorage` so a demo survives refresh.
- **Framer Motion** for the transitions that make it feel alive (matchmaking ring, match reveal, timer, "keep talking?" moment).
- No backend server required for the core prototype. If you add the optional two-tab live mode (§4.3), use the browser `BroadcastChannel` API — still no server.

Keep dependencies minimal. Prefer a clean, well-structured single app over a sprawling monorepo.

---

## 3. Mobile-first framing

- Design for a **~390px-wide phone viewport**, rendered inside a phone frame on desktop (so it demos well on a laptop). All screens use the `9:41` status-bar convention seen in the wireframe kit.
- Three-tab shell for the live app: **Queue** (home), **Chat** (the one connection, if any), **Profile** (settings, ISO+, safety, Memories, trend/recap). **There is intentionally no "matches" or "inbox" tab — never add one.**

---

## 4. How to mock the hard parts

The whole product is real-time and two-sided; a single-user prototype must simulate the second person and the matching. Three mock layers:

### 4.1 Mock matchmaking (required)
- "Enter the queue" → show the searching state with an animated matchmaking ring and a live "online nearby" count → after a short, slightly randomized delay (2–6s) resolve to a **simulated match**.
- Occasionally (configurable, e.g. a "demo controls" toggle) resolve to the **no-match retry** state so that flow is demonstrable.
- Draw simulated partners from a small seed set of personas (name, age, distance, photo/avatar, prompts, a shared ice-breaker).

### 4.2 Simulated conversation partner (required)
- The live room must be **genuinely interactive** — the user types, the partner replies with realistic timing and typing indicators.
- **Default:** scripted/branching canned responses per persona, with human-like delays, good enough to demo.
- **Strongly recommended upgrade:** wire the partner to an LLM so the conversation feels real. Use the **Anthropic API** with a system prompt that gives the partner a persona, the shared ice-breaker, and instructions to behave like a present, curious college student in a one-on-one chat. Keep responses short and chatty. Make the API key configurable via an env var (`.env` / `import.meta.env`), and **fall back gracefully to scripted mode if no key is set** so the prototype always runs. Never hard-code a key.
- The partner also participates in "keep talking?" — sometimes yes, sometimes no (configurable), so both branches are demonstrable.

### 4.3 Optional: real two-tab live mode (stretch)
- Using `BroadcastChannel`, allow two browser tabs on the same machine to queue and match **with each other** and hold a real live conversation. This is the most convincing demo of "presence" but is optional. Ship the simulated-partner mode first; add this only if time allows.

### 4.4 Everything else is a stub
- `.edu` + photo verification: UI only, always "succeeds" after a beat, with the real copy/rationale from the PRD.
- ISO+ paywall: shows the offer and unlocks premium surfaces on tap; **no real payment**.
- Notifications: simulated in-app toasts, not real push.

---

## 5. Prototype scope by fidelity tier

Build in this order. Tier 1 is the demo; Tiers 2–3 make it complete.

### Tier 1 — The core loop (highest fidelity, build first)
Screens (PRD §11): 09 Home/Queue · 10 Searching · 11 Match found · 12 Live room (with reply timer) · 13 Keep talking? · 14 No-match retry · 15 One chat · 16 Close confirm.
Behaviors: presence-based queue, per-turn reply timer (gentle, not punitive), mutual keep-talking (only continues if both opt in), **hard one-active-chat rule** (cannot enter queue while a chat is active), clean close → re-queue. No dead chats ever.

### Tier 2 — Onboarding + the v2 signature features
- Onboarding (screens 01–08): splash, sign up (OTP), .edu verify, photo/liveness, profile basics, prompts, preferences, permissions.
- **Reflection (§9.11):** optional one-tap "how did that feel?" at conversation end (private, experience-not-person). Store the signal.
- **Outcome loop (§9.8):** "Did you two meet up?" prompt after/around an ongoing chat. This is the North Star signal — make it real in the data model.
- **Revival (§9.10):** private one-slot "I'd talk to them again" flag with **flag-decay**; blind double-opt-in; only surfaces when free + cooled down + mutual; on mutual → fresh live room via the normal loop. Provide a demo control to force a mutual revival so it's showable.
- **Anti-burnout nudge (§9.13):** gentle "take a break?" after N low-satisfaction conversations in a session.

### Tier 3 — ISO+, reflection viz, safety, account
- ISO+ paywall + premium unlock (17), background queue (18), match-ready toast (19).
- **Memories (§9.9):** read-only archive of *mutual* conversations — no reply, no unread counts, per-entry wipe. ISO+-gated.
- **Trend + insights + weekly Recap (§9.11–9.12):** private, gentle, non-crashing trend; one insight; Wrapped-style recap that also hosts the weekly batched reflection. Seed with fake historical data so the trend/recap look populated in a demo.
- Live prompts (21), date planner (22), report/block (23), safety center (24), settings (25), edit profile (26), subscription (27).

### Demo controls (build this)
A small hidden/`?debug` panel to: force match vs. no-match, choose the partner persona, toggle LLM vs. scripted partner, make the partner say yes/no to "keep talking?", force a mutual revival, and reset all state. This makes the prototype demonstrable without waiting on randomness.

---

## 6. Design system (extracted from the ISO case study — use these exact tokens)

**Vibe:** warm, intentional, human — not clinical. Soft cream/amber surfaces, one confident orange for primary/live actions, rounded shapes, generous spacing. Reflective surfaces (trend, recap, Memories) should feel like a calm private journal, never a scoreboard.

**Color tokens:**
```
--iso-accent:        #FF8000   /* primary / live / CTA — the one confident color */
--iso-accent-soft:   #F8BD62   /* amber, secondary accent */
--iso-accent-tint:   #FFE8C1   /* light amber fills, chips */
--iso-bg:            #FFF9F0   /* warm cream app background */
--iso-surface:       #FFFFFF   /* cards */
--iso-text:          #3A2410   /* primary warm-brown text */
--iso-text-2:        #5A3418   /* secondary brown */
--iso-text-3:        #6B4A2A   /* tertiary / captions */
--iso-neutral:       #55555E   /* muted gray for metadata */
```

**Type:** display/headers = **Poppins** (600/700); body/UI = **Inter** (400/500). Load via Google Fonts or `@fontsource`.

**Radii:** cards/inputs `14px`; large cards `16px`; pills/buttons `99px`; avatars `50%`.

**Motion:** the matchmaking ring, the match reveal, the reply timer, and the "keep talking?" moment are the emotional beats — animate them with care. Everything else stays calm.

**Grayscale-with-one-accent rule** (from the wireframe kit): the single orange accent marks the primary action / live element so hierarchy is always obvious.

---

## 7. Non-negotiable product principles (do not drift from these)

1. **One conversation at a time is enforced by the product** — a user with an active chat literally cannot queue or start another.
2. **No inbox, no roster, no feed.** Three tabs only. Never add a matches/inbox tab.
3. **No dead chats** — conversations become mutual or end cleanly and return the user to the queue.
4. **Rank experiences, never people.** No scored list of humans anywhere — not in reflection, trends, Memories, or revival.
5. **Reflection, not obligation** — anything lookback-oriented is a private journal: no unread counts, no reply pressure, no re-rejection.
6. **Revival is blind and single-slot** — one-sided flags are invisible and expire silently; no one is ever re-rejected; blocks are absolute.
7. **Monetize convenience/expression, never visibility or matches.**
8. **Reflection is implicit-first** — behavioral signal is primary; explicit rating is optional/weekly, never a per-conversation tax.

If a requested feature would violate any of these, stop and flag it rather than building it.

---

## 8. Acceptance criteria (the prototype is "done" when…)

- The full Tier-1 core loop works end-to-end and *feels* real, including the reply timer and both branches of "keep talking?".
- The one-active-chat rule is genuinely enforced (queueing is blocked while a chat is active).
- Onboarding runs start-to-finish with the PRD's real copy and rationale.
- Reflection, the outcome prompt, and the burnout nudge all function and write to the data model.
- Revival can be triggered (via demo control) and correctly routes a mutual pair into a fresh live room; one-sided flags never notify anyone.
- Memories is read-only and shows only mutual conversations; the trend/recap render with seeded data and never present a person-ranking.
- The three-tab IA is intact; there is no inbox/matches tab anywhere.
- The design matches the tokens in §6.
- It runs locally with a single documented command, and there is a short `README.md`.

---

## 9. Validation checklist (run before declaring done)

1. **Trace every Tier-1 and Tier-2 acceptance criterion above to the running UI** — list each one and confirm it works. Produce a short `VALIDATION.md` reporting pass/fail per item.
2. **Principle audit:** walk §7 and confirm nothing in the build violates a principle (especially: no inbox tab, no person-ranking, revival is blind, one-at-a-time is enforced).
3. **Flow audit:** click through onboarding → queue → match → live room → keep talking (both yes and no) → one chat → outcome → close → re-queue, and confirm there are no dead ends and no way to hold two chats.
4. **Design audit:** confirm tokens, fonts, radii, and the single-accent rule are applied consistently; check the phone frame renders on desktop.
5. **Runs clean:** fresh clone/install, one command to start, no console errors on the happy path.

Report results in `VALIDATION.md`. Fix any failures, then re-verify only the affected items.

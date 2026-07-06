# VALIDATION.md — build spec §9 checklist

Run date: 2026-07-03 · Method: every item exercised against the running app
(dev server, scripted UI interaction + store-state assertions + screenshots),
plus a from-scratch install (`rm -rf node_modules && npm install && npm run build`,
then `npm run dev`).

Legend: **PASS** = traced to the running UI and observed working.

## 1. Acceptance criteria (build spec §8)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1a | Tier-1 core loop works end-to-end and feels real | **PASS** | Full run: queue → searching (animated ring, leave-queue) → match reveal (spring avatar, sparks, shared ice-breaker) → live room (typing dots, human-paced scripted replies) → keep-talking → one chat → close → re-queue |
| 1b | Reply timer: gentle, presence-not-punishment | **PASS** | Calm amber bar, "your turn · 0:37 · presence, not pressure"; at zero → soft system line "Still there? No rush — Maya is still here", no penalty; a **second consecutive** lapse surfaces keep-talking early framed "Seems like a natural pause" (decision D3) |
| 1c | Both branches of "keep talking?" | **PASS** | Trigger fires at exactly 12 human messages ("turns"), via "feeling ready to decide?" tap ("decide"), and via double lapse ("pause"). Simultaneous reveal: answer sealed ("locked in ✓ / deciding…"), both cards flip together. Mutual → ongoing chat + partner keepTalkingLine. Non-mutual → "Not this time. Closed kindly" → polite close screen |
| 2 | One-active-chat rule genuinely enforced | **PASS** | Enforced **in the store**: `enterQueue()` no-ops with toast "One conversation at a time…" while `activeChat !== null` (verified with an ongoing chat — queue state never left idle); matchmaker callback re-checks before matching; `sayHi()` and `acceptRevival()` guard the same invariant |
| 3 | Onboarding start-to-finish with PRD copy | **PASS** | 02 OTP sign-up → 03 .edu verify (non-.edu rejected with trust rationale; "bounds the trust circle" note) → 04 photo/liveness (stub-succeeds, "private, only used to verify") → 05 basics (conversation-first copy) → 06 three prompt cards → 07 preference chips → 08 permissions with plain-language rationale + decline-notifications warning → lands on Queue |
| 4a | Reflection functions and writes to the data model | **PASS** | Optional one-tap (faces + tags) at both close paths; skip is one tap; verified `satisfaction`/`tags` written to the history record; recap hosts the weekly batched reflection |
| 4b | Outcome prompt functions, writes to data model | **PASS** | "Did you two meet up?" on chat close **and** via debug advance-time (48h window) on an ongoing chat; answer recorded (`outcome: "met"` = the North Star atom); dismiss counts as the one ask — advancing time again does **not** re-ask (max one active ask) |
| 4c | Burnout nudge | **PASS** | After 3 unsuccessful/low conversations in a session, "Take a break?" modal on returning to the queue; dismissible, never blocking (re-queue immediately after "keep going" works); counter resets |
| 5a | Revival triggers via demo control → fresh live room | **PASS** | Force mutual revival → screen 28 ("A spark worth revisiting?", blind-mutual + only-while-free copy) → accept → **fresh** live room via the normal loop (match screen "A spark, revisited — live now", 0 messages, timer + keep-talking all apply); slot consumed |
| 5b | One-sided flags never notify anyone | **PASS** | Flagging is silent; decay (14d window, or 3 strong subsequent conversations) silently clears the slot — no toast, no message; declining an offer is silent ("they're never told") |
| 5c | One slot + replace prompt + only-when-free | **PASS** | Second flag prompts "This replaces your current one — an explicit trade"; forcing revival mid-chat refuses with a toast; cooldown respected before natural surfacing |
| 6a | Memories read-only, mutual-only | **PASS** | Only mutual+archived records render (Devon's non-mutual seed entry absent); transcript, ice-breaker, date, private reflection/outcome shown; **no composer, no reply affordance, no unread counts, no inbox/matches labeling**; per-entry "wipe my side" removes the record; ISO+-gated but discoverable; lives under Profile |
| 6b | Trend/recap render seeded, no person-ranking | **PASS** | Gentle amber curve (y-floor — a slow week can't render as a crash), one insight, Wrapped-style weekly recap card with mutual count + real dates recorded + batched skippable reflection; no scored list of humans anywhere |
| 7 | Three-tab IA intact, no inbox/matches tab | **PASS** | Exactly Queue / Chat / Profile (hardcoded); Memories/trend/recap/settings all under Profile |
| 8 | Design matches §6 tokens | **PASS** | Computed styles verified: bg `#FFF9F0`, primary `rgb(255,128,0)` on primary/live elements only, cards `14px`, pills `99px`, Poppins 600/700 headers, Inter body, ink `#3A2410` |
| 9 | Runs locally, one command, README | **PASS** | Fresh `npm install` + `npm run dev` (also `npm run build` clean, `tsc` clean); README documents run, `?debug`, `.env` LLM mode |

## 2. Principle audit (build spec §7 / CLAUDE.md)

| Principle | Result | Notes |
|---|---|---|
| 1. One-at-a-time enforced by the product | **PASS** | Invariant in store actions, not UI; disabled-looking buttons are decoration on top of a hard no-op |
| 2. No inbox / roster / feed; three tabs only | **PASS** | Queue home is a single CTA + live count, no browsing; no fourth tab exists in code |
| 3. No dead chats | **PASS** | Every conversation becomes mutual (one chat) or ends via the polite close screen back to the queue; block also ends cleanly; no thread ever persists un-actioned |
| 4. Trust is table stakes | **PASS** | Verification precedes matching in onboarding; report/block reachable from ⋯ in the live room **and** the ongoing chat; block ends the chat instantly and is permanent |
| 5. Monetize convenience/expression, never visibility/matches | **PASS** | ISO+ = background queue, Memories, live prompts, date planner; paywall states "No pay-to-win, ever"; nothing in the matchmaker reads `isPlus` |
| 6. Get people off the app | **PASS** | Outcome loop is the North Star atom; date planner pushes to a real plan; recap counts real dates |
| 7. Rank experiences, never people | **PASS** | Reflection copy says "about the experience, never a score on them"; trend aggregates the user's own experiences; no ordered list of humans on any surface |
| 8. Reflection, not obligation | **PASS** | Every reflection is skippable in one tap; no unread counts, no streaks, no re-rejection (revival fully blind); recap says "nothing to grade, nothing to grind" |

## 3. Flow audit

Onboarding → queue → match → live room → keep talking **yes** → one chat →
outcome → close → re-queue: **PASS** (continuous run, fresh profile).
Keep talking **no** branch: **PASS** (polite close screen → reflection/flag →
"Find someone new" re-queues cleanly). No-match: **PASS** (graceful retry +
prime-time suggestion, never an error). Dead ends: none found — every terminal
screen has a path back to the queue. Two chats simultaneously: **impossible** —
attempted via queue entry, revival forcing, and direct `sayHi()` during an active
chat; all refused in the store.

## 4. Design audit

**PASS** — tokens (§1.8 above), fonts, radii, single-accent rule (orange only on
primary/live elements; green reserved for positive/presence moments per
ASSETS.md), phone frame renders on desktop, `9:41` status bar convention, splash
reproduces `iso-splash.svg` (gradient stops `#FFE8C1 → #F8BD62 44.7% → #E68C0F`,
white chess-piece logomark extracted from the asset and used as-is, tagline with
"real" in green), `iso-appicon-dark.svg` as favicon.

## 5. Runs clean

**PASS** — from-scratch install (`node_modules` and lockfile deleted):
`npm install` → `npm run build` (tsc + vite, zero errors) → `npm run dev` →
full happy path with **zero console errors or warnings**.

## 6. Motion & polish pass (Motion Brief §10 Phase 4) — run 2026-07-04

### Motion audit

| Item | Result | Notes |
|---|---|---|
| Every transition uses a named preset | **PASS** | All springs/tweens come from `src/lib/motion.ts` (`snap`/`standard`/`soft`/`gentle`, `durations.*`). Documented exemption: ambient presence loops (searching pulses, empty-state breathing, online-count jitter) use bespoke loop timings by design — they are state expressions, not transitions |
| Loud/quiet hierarchy respected | **PASS** | Waves fire on exactly five thresholds (enter queue, match found, mutual yes, "we met", clean close) and nowhere else; shared-element morphs limited to match card, bento cards, memories, chat-open; everything else quiet springs |
| Transitions interruptible | **PASS** | Tab track honors a drag mid-settle (framer drag takes over the motion value); a new wave bloom replaces the in-flight one (`seq` guard, stale callbacks dropped); step changes never gate on exit animations |
| `prefers-reduced-motion` handled | **PASS** | Wave → brief tint (150/200ms opacity); deep-screen slides → fades; onboarding slides → fades; verified via emulated media query |
| Wave timing | **PASS (user-tuned)** | Slowed twice from the brief's 450/380ms on product-owner direction, now **850/650ms**; gentle tempo scales from these |

### Color-wave audit

**PASS** — blooms from the exact tap coordinates (screenshot captured mid-bloom
leaving the CTA); handoff-not-curtain (destination mounts at `onCovered` under
the flood, wave clears to reveal it — never flood → cut); registers correct
(orange: enter queue/match; green: mutual yes + "we met"; soft amber, gentle
tempo: clean close); celebration restrained — the "we met" beat is one green
wave + a single scale-pulse of the confirmation, no confetti anywhere.

### Swipe audit

**PASS** — Queue/Chat/Profile live on a horizontal drag track; content follows
the finger with momentum settle (`standard`); short flick advances one tab;
indicator pill slides continuously with the drag offset (shared motion value);
tabs remain tappable; drag disabled only during full-screen queue takeovers.
Chat tab is always swipeable-to (active chat or designed empty state).

### Profile (bento) audit

**PASS** — uniform 11px gaps, no shared borders/dividers (each card its own
floating surface, layered 2px+16px warm shadows, tinted borders); uneven sizing
(Edit Profile hero spans 2 cols, Memories tall spans 2 rows, ISO+ gradient
square, trailing single card left deliberately asymmetric); bold left-aligned
Poppins 34px header with age/verified/campus in lighter ink; glance-able state
on every card (ISO+ Active, memories count, alerts dot, safety "all clear",
plan price, real-dates count); header-then-cards stagger ~50ms; press dip 0.97;
tap → expand morph into the destination, back → collapse morph home.

### Anti-AI-pattern checklist (§9)

| Tell | Result |
|---|---|
| Uniformity | **PASS** — bento sizes uneven; radii/shadows vary by role (14/16/99px, single-soft vs layered); real type scale (34/27/24/19/15/13/11) |
| Centered-everything | **PASS** — Profile header and onboarding left-aligned; centering reserved for ceremony screens (match, keep-talking) where it's intentional |
| Missing optical correction | **PASS** — icons nudged within cards; ring/avatar optical centers checked by eye at 2× screenshot |
| Generic component soul | **PASS** — no default focus-ring blue, no stock icon set (custom warm strokes + the chess mark), no default easing (presets only) |
| Decorative-not-communicative motion | **PASS** — every wave marks a threshold; pulses express presence; breathing empty state is an invitation; nothing moves "just because" |
| Even/placeholder content | **PASS** — seed history is deliberately uneven (satisfaction 2–5, mixed outcomes/tags) |
| Type clustering near 16px | **PASS** — see scale above |

### Principles intact through the new navigation

**PASS** — still exactly three tabs (now swipeable, still no inbox/matches
surface); the one-chat rule remains enforced in the store, untouched by any
motion work (re-verified: `enterQueue` no-ops with the toast during an ongoing
chat; two-chat attempts all refused); bento is a grid of destinations, never
people; Memories remains read-only.

### Runs clean (motion pass)

**PASS** — `tsc` + `npm run build` clean; fresh reload → full loop
(queue → match → room → decide → ongoing) with zero runtime console errors.
**60fps caveat:** the wave and match reveal animate transform/opacity only
(compositor-friendly, `willChange` set) and hold 60fps on desktop including
CPU-throttled DevTools runs; a real mid-range phone was not available in this
environment — spot-check on device recommended.

### Gentle-pacing pass (2026-07-04, product-owner-directed)

**PASS** — arrivals slowed app-wide while input feedback stays instant:
staged splash boot (gradient alone → logo ~1.1s fade → tagline → buttons;
buttons pointer-inert until their entrance completes, gated on the animation
itself, verified by sampling opacity/pointer-events mid-boot); queue home,
searching, match reveal, keep-talking and onboarding steps all settle in
reading order with 0.55–0.7s soft-eased reveals; page/tab transitions moved
to the `calm` spring; modal entrances softened; keep-talking partner wait
lengthened to 2.2–3.6s; searching phrases turn over at reading pace (2.7s).
Logomark clip fixed: the Figma-export drop-shadow filter regions in
`iso-mark-white.svg` were sliced flat at the letter bottoms — regions widened
and viewBox padded; verified visually. Full loop re-run clean after the pass
(match → opener → simultaneous reveal → ongoing), zero console errors on a
fresh load.

## Fixes made during build/validation (one fix-and-verify cycle)

1. **Partner never replied in the ongoing chat** — the reply scheduler guarded
   `phase !== "live"`, silencing the partner after mutual continuation. Fixed to
   exclude only the `deciding` phase; re-verified (reply arrives in ongoing chat,
   including in LLM mode with silent scripted fallback when no key is set).
2. **Onboarding step transition could wedge** — `AnimatePresence mode="wait"`
   gated the next step on the exit animation completing (stalls in throttled/
   background tabs). Replaced with a keyed entrance-only transition; re-verified
   (all 7 steps walk cleanly).
3. Stray `</AnimatePresence>` from fix 2 broke the dev build momentarily — caught
   by vite overlay, fixed, `tsc` re-run clean.

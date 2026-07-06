# ISO — Product Requirements Document (v2)

**Product:** ISO (Intimate Setting Online) — a real-time dating app for genuine, exclusive, one-on-one connection
**Tagline:** One conversation at a time.
**Document owner:** Product Management
**Status:** Draft for review · v2.1
**Last updated:** July 3, 2026
**Target release:** MVP — Anchor Campus Beta (Fall 2026)

> **What changed in v2.** This version re-anchors the product around *real-world outcomes* and adds a connected set of retention and quality features: a post-date outcome loop, a private satisfaction-and-trend tracker, a read-only conversation archive ("Memories"), a blind double-opt-in "revival" reconnect, an anti-burnout re-queue guardrail, and a weekly Connection Recap. The North Star metric has moved from *mutual keep-talking conversations* to *real-life dates initiated*, with the old metric demoted to a leading indicator. See §4 and §9.8–9.13.
>
> **v2.1 update.** Resolved two open parameters with a "start restrictive, measure, then loosen" discipline: (1) **reflection cadence** is now *implicit-first* — behavioral signal drives matching, an optional one-tap reflection sits at conversation end, and the *primary* explicit reflection is a calm weekly batched moment inside the Recap; (2) **revival launches with exactly one slot** plus a new **flag-decay** mechanic, with loosening to a small reserve treated as a data-driven decision gated on the blind-mutual hit rate. See §9.10–9.12, §4, and §16 (Q10–12).

---

## 1. TL;DR

Modern dating apps monetize attention and optionality. They reward infinite swiping and unlimited parallel chats — the exact behaviors that prevent real connection. Users end up managing a roster of lukewarm "talking stages," ghosting is normalized, and burnout drives them off the platform.

ISO is a dating app built around one enforced constraint: **you can have exactly one live conversation at a time.** Users queue like they're joining a game, get matched in real time with one present person, and talk in a live room with a gentle per-turn reply timer. A conversation only becomes an ongoing chat if **both** people opt in ("Keep talking?"). There is no inbox, no roster, and no feed.

v2 sharpens the point of the whole thing: ISO succeeds when two people *actually meet in real life*. We now measure that directly, ask users how their conversations felt, show each person their own connection trend over time, and — carefully, without rebuilding a roster — let a genuinely great past conversation get a second chance if both people independently want it.

This PRD defines the MVP to prove the core loop on one U.S. college campus, plus the P1 layer that turns a working loop into a durable, quality-driven product.

---

## 2. Problem statement

> Single people seeking genuine connection are overwhelmed by platforms that reward shallow, simultaneous conversations — leaving them burned out and unable to build something exclusive and intentional.

**Root cause (5 Whys / RCA):** The incumbent business model is structurally misaligned with genuine connection. Revenue scales with engagement and optionality — more matches, more boosts, more time in-app — not with outcomes. "Talking stages" and keeping options open are the normalized result of mechanics that make every person feel disposable.

**Symptoms users feel today:** ghosting, a roster of half-finished chats, decision paralysis, feeling like "just a number," and eventual burnout.

**The opening:** No incumbent enforces one conversation at a time. The real-time + exclusive quadrant is wide open, and it directly contradicts the swipe-economy revenue model incumbents depend on — which is why it is defensible.

---

## 3. Goals & non-goals

### 3.1 Objective

Make genuine, exclusive, one-on-one connection the default — not the exception. **We win when two people leave the app together, not when they swipe longer.** v2 makes that objective *measurable* by tracking real-life dates directly.

### 3.2 Goals

1. **Replace the roster** — enforce one live conversation at a time; exclusivity is a mechanic, not a promise.
2. **Require presence** — real-time matching plus a per-turn reply timer so both people show up.
3. **Reduce burnout** — remove infinite options and dead-chat inboxes; actively protect users from grind fatigue.
4. **Drive real-world outcomes** — move matches off the app to actual dates, and measure it.
5. **Reward quality over time** — help each user understand and improve their own connection quality.
6. **Reach product–market fit in a beachhead** — win one U.S. campus with sub-60s liquidity and strong retention.
7. **Establish trust as a baseline** — .edu + photo verification and fast report/block from day one.

### 3.3 Non-goals (out of scope)

- Live audio or video calling (MVP is text-first).
- ML-ranked / algorithmic match optimization (MVP is rule-based; the satisfaction signal informs matching later, never sooner than the data supports).
- Events, IRL meetups, or group features.
- Multi-city or non-campus expansion at MVP.
- **Any ranking, scoring, or leaderboard of *people*.** We rank experiences and personal trends only — never humans. (See §7, principle 7.)
- **Any monetization that sells more matches or paid visibility** — a permanent product constraint.
- A discovery feed, profile browsing, or "likes you" surface.
- Any "your #1 person is available" or optionality-hoarding framing in the revival feature (§9.10).

---

## 4. Success metrics

### 4.1 North Star metric — **v2 change**

**Real-life dates initiated per active user per month** — self-reported via the outcome loop (§9.8). This is the truest expression of "we win when two people leave the app together." It replaces the v1 North Star.

### 4.2 Leading indicator (was the v1 North Star)

**Mutual "keep talking?" conversations per active user per week** — still critical, now positioned as the strongest *leading* signal that a real date is likely to follow. A rising leading indicator with a flat North Star tells us the loop works but the hand-off to real life is broken.

### 4.3 Primary KPIs (MVP / early-P1 acceptance targets)

| Metric | Definition | Target (anchor campus) |
|---|---|---|
| **Real dates initiated** | Self-reported "we met up" per active user / month | Establish baseline in beta; set target after 4 weeks |
| **Match liquidity** | Median queue-to-live-match time, prime-time | ≤ 60 seconds |
| **Queue success rate** | % of queue sessions ending in a live match | ≥ 80% at prime-time |
| **Mutual continue rate** | % of live conversations where both keep talking | ≥ 25% |
| **Conversation satisfaction** | Median post-conversation "how did that feel?" score | Establish baseline; watch trend, not absolute |
| **D7 retention** | % verified new users active at day 7 | ≥ 30% |
| **D30 retention** | % verified new users active at day 30 | ≥ 15% |
| **Verification completion** | % who start onboarding and finish .edu + photo | ≥ 60% |
| **ISO+ conversion** | % of active users subscribing within 30 days | ≥ 4% |

> Targets are proposed for beta and should be re-baselined after 2–4 weeks of real liquidity data.

### 4.4 Guardrail metrics (must not regress)

- **Reports per 1,000 conversations** — trust must not degrade with scale.
- **Median reply time in the live room** — presence health.
- **Involuntary session drops / disconnects** — real-time reliability.
- **Ghost/abandon rate mid-conversation** — the behavior we exist to remove.
- **Satisfaction trend (rolling)** — quality guardrail; a sustained decline is a red flag even if volume is fine.
- **Revival attempts per user** *(new)* — if this climbs abnormally, the revival feature may be driving optionality-hoarding instead of genuine reconnection; investigate.
- **Revival blind-mutual hit rate** *(new)* — how often a reserved flag actually results in a mutual revival offer. If this is near-zero with one slot each, it is the evidence to justify loosening the slot count (§16 Q10) — a diagnostic, not a target to inflate.
- **Reflection prompt completion vs. retention delta** *(new)* — completion rate of the optional reflection *and* whether prompted users retain worse than un-prompted ones. This is the primary signal for tuning reflection cadence (§9.11); a negative retention delta means reflection is causing fatigue.
- **Sessions ending via burnout nudge vs. natural exit** *(new)* — signals whether the re-queue loop is turning into a grind.

### 4.5 Counter-metrics we deliberately do NOT optimize

Time-in-app, total swipes, total matches. Tracked only as diagnostics. Optimizing them recreates the problem.

---

## 5. Target users

**Beachhead:** U.S. college students / young adults, 18–26. Density makes real-time matching work; this cohort is the most fatigued and underserved; `.edu` verification gives a built-in trust layer plus campus-by-campus virality.

### 5.1 Segments

1. **Burned-out daters** — deleted Tinder/Hinge after months of dead-end chats; want something real but distrust apps.
2. **Intentional seekers** — busy, sincere; hate small talk and ghosting; pay for quality, resent pay-to-win.
3. **Safety-first users** — cautious about bad actors; value verification and control over who can reach them.

### 5.2 Primary persona — "Burned-out Bella"

21 · college junior · Seattle. *"I have five chats going and I'm not excited about any of them. It's a part-time job I didn't sign up for."*
**Goals:** meet someone real; feel a genuine spark; less time, more signal.
**Frustrations:** ghosting; feeling like an option; endless low-effort messaging.
**Behaviors:** deleted Hinge twice; dates rarely materialize; prefers meeting IRL.

### 5.3 Why this wedge (research)

~79% of U.S. college students aren't on any dating app (Axios) · 50%+ of Gen Z feel burned out by dating apps, highest of any age band (Forbes Health 2025) · ~90% of Gen Z would rather meet offline (Kinsey / DatingAdvice) · 41% name safety a top concern (2025 survey) · Tinder payers −7% YoY while Hinge revenue +25% — demand is moving toward intention.

---

## 6. Competitive landscape

| Player | Model | Strength | Opening for ISO |
|---|---|---|---|
| **Tinder** | Swipe deck, volume-driven (~9M payers, −7% YoY) | Liquidity & brand | Synonymous with fatigue; bleeding young users |
| **Hinge** | Prompts + likes; "designed to be deleted" (+25% rev) | Intentional brand, strong with Gen Z | Still a roster of async chats; ghosting persists |
| **Bumble** | Women message first; 24h match timer | Safety-forward | Timer adds pressure, not presence; still swipe + backlog |
| **Beli (adjacent)** | Ranking/tracking for restaurants | Habit-forming reflection loop | Inspiration for ISO's *private* satisfaction tracking — applied to *experiences*, never people |

**Positioning:** ISO owns the *real-time + exclusive + outcome-driven* space. One-at-a-time contradicts incumbents' swipe-economy revenue — structurally hard to copy.

---

## 7. Product principles

1. **Constraint is the feature.** One conversation at a time, enforced by the product.
2. **Presence over backlog.** Favor two people here *now* over accumulating options for later.
3. **No dead chats.** A conversation becomes mutual or ends cleanly and returns you to the queue. Nothing rots in an inbox.
4. **Trust is table stakes.** Verification and safety are in the MVP, not a later phase.
5. **Monetize convenience and expression — never visibility or matches.** Permanent line.
6. **Get people off the app.** Success is a real-life date; tools push toward it, then get out of the way.
7. **Rank experiences, never people.** *(new)* We help users understand their own patterns and connection quality over time. We never build a scored list of humans — that is a roster with numbers, the exact thing we're replacing.
8. **Reflection, not obligation.** *(new)* Anything we let users look back on (archive, recap, trends) is a private journal — no unread counts, no reply pressure, no re-rejection.

---

## 8. Scope & prioritization

### 8.1 P0 — MVP (Do Now)

Minimum to run and validate the core loop on one campus.

- `.edu` + photo verification
- Conversation-first profile (prompts, not a résumé)
- Live matchmaking queue (by campus, presence-based)
- Real-time room with reply timer + ice-breakers
- Mutual "keep talking?" → one ongoing chat
- Hard one-active-chat rule
- Report / block + safety center
- **Post-conversation reflection capture** *(new — implicit behavioral signal + an optional one-tap "how did that feel?"; primary explicit reflection is weekly, see P1)*
- **Post-date outcome prompt** *(new — lightweight "did you two meet up?")*

### 8.2 P1 — Quality & ISO+ layer (Schedule)

Ships after the MVP loop is validated. Forms the premium tier (~$14.99/mo) plus retention features.

- Background queue + match-ready alerts
- **Memories: read-only conversation archive** *(new — ISO+)*
- **Live prompts** (song requests, photo-of-day)
- **Built-in date planner**
- **Satisfaction trend + insights** *(new — the visualization layer over the P0 capture)*
- **Weekly Connection Recap** *(new)*
- **Anti-burnout re-queue nudge** *(new — cheap, ships early in P1)*

### 8.3 P2 — Signature differentiators & supporting (Delegate / Later)

- **Revival: blind double-opt-in reconnect** *(new — depends on accumulated reflection/flag data + cooldown infra)*
- Profile editing UI
- Push-notification infrastructure
- Basic analytics dashboards

### 8.4 P3 — Later / Don't (for now)

- Live audio/video · ML-ranked matching · Events & IRL meetups.

---

## 9. Detailed requirements

Requirements use user stories with acceptance criteria. **P0** items are MVP-blocking. New v2 features are §9.8–9.13.

### 9.1 Onboarding & verification (P0)

**Story:** *As a new user, I want to prove I'm a real student and set who I'm looking for, so I can enter a small, trusted room and start matching.*

- Sign up via phone or email with OTP.
- `.edu` email verification via 6-digit code; only `.edu` domains accepted; trust rationale shown inline.
- Photo/liveness verification (pose-matched selfie); stated private, used only to verify.
- Light profile: a few photos, first name, age, gender — deliberately lighter than incumbents (conversation-first).
- 3 prompt cards (label + answer) that seed the first ice-breaker.
- Preferences: interested-in, age range, distance (campus / ≤10mi / city) via chips.
- Location + notification permissions with plain-language rationale; declining notifications warns about missing live matches.
- On completion → Home / Queue.

**Screens:** 01 Splash · 02 Sign up · 03 .edu verification · 04 Photo/liveness · 05 Profile basics · 06 Prompts · 07 Preferences · 08 Permissions.

### 9.2 Live matchmaking queue (P0)

**Story:** *As a verified user, I want to join a queue and be matched with one present, compatible person.*

- Home shows a live "online nearby" count and one primary CTA ("Enter the queue"). No feed, no browsing.
- Queue → searching state with animated indicator + "leave the queue."
- Matcher pairs users who are both in queue, mutually compatible on preferences, and not in an active chat.
- A user with an active ongoing chat cannot enter the queue (enforces one-at-a-time upstream).
- On pairing, both see "Match found — live now": avatar, first name, age, presence, distance, shared ice-breaker, "Say hi" CTA.
- No-match handling: graceful retry / "try prime-time," never an error (screen 14).
- Prime-time events + background queue (P1) concentrate liquidity.

**Screens:** 09 Home/Queue · 10 Searching · 11 Match found · 14 No-match retry.

### 9.3 Live conversation room (P0)

**Story:** *As a matched user, I want a focused, real-time conversation with a gentle sense of pace.*

- Real-time messaging in a dedicated room, seeded with the shared ice-breaker.
- Gentle **per-turn reply timer** framed as presence, not punishment; expiry behavior must not feel like a penalty (design + test — see §10.5).
- Typing/presence indicators.
- Report/block reachable at all times (⋯ menu).
- On leave/disconnect, the other user gets a clear, non-shaming state and a path back to the queue — no silent ghosting.

**Screens:** 12 Live room.

### 9.4 "Keep talking?" & the one-chat rule (P0)

**Story:** *As a user finishing a conversation, I want it to continue only if we both want it to.*

- Both users are prompted with a mutual "Keep talking?" decision.
- Converts to an ongoing chat **only if both opt in**.
- If either declines, it closes politely; both return to the queue. No thread left in an inbox.
- With one ongoing chat, the **hard one-active-chat rule** blocks new queueing until resolved.
- Ongoing chat can be ended ("talk to someone new") via close-confirm → Home/Queue.

**Screens:** 13 Keep talking? · 15 One chat · 16 Close confirm · re-queue → 09.

### 9.5 Trust & safety (P0)

**Story:** *As a young user, I want verified people, control over contact, and fast ways to remove someone.*

- Report/block from every conversation surface, minimal taps.
- Block immediately ends any active conversation and prevents future matching — **and permanently excludes that person from every v2 surface, including Memories visibility and revival eligibility (§9.10).**
- Safety center: reporting history, tips, resources.
- All users `.edu` + photo verified before matching.
- MVP text-first (no audio/video/image DMs beyond profile).
- Backend moderation/report-review queue must exist.

**Screens:** 23 Report/block · 24 Safety center.

### 9.6 ISO+ premium (P1)

**Story:** *As an engaged user, I want convenience and expressive extras — without an unfair advantage.*

Price ~$14.99/mo (validate). Includes:
- **Background queue + match-ready alerts** — queue and leave the app.
- **Live prompts** — song requests, photo-of-day.
- **Date planner** — move a match toward a real-life date.
- **Memories archive** (§9.9).
- **Hard constraint:** ISO+ never grants more matches, paid visibility, or ranking advantage.

**Screens:** 17 ISO+ paywall · 18 Background queue · 19 Match-ready push · 20 Memories (was "Chat history") · 21 Live prompts · 22 Date planner.

### 9.7 Account & settings (P2)

Settings, edit profile, subscription management — from Profile tab / ⋯ menus.
**Screens:** 25 Settings · 26 Edit profile · 27 Subscription.

---

### 9.8 Post-date outcome loop — "Did you meet?" (P0) — **new, highest-priority addition**

**Why P0:** ISO's real goal is getting people off the app. Without this, we can't measure the North Star (§4.1) and we have no truth signal for the satisfaction tracker or revival. It is cheap to build and foundational to everything else in v2.

**Story:** *As someone with (or recently past) an ongoing chat, I want a quick way to say whether we actually met up, so ISO reflects real outcomes — and I get credit for the thing that matters.*

Acceptance criteria:
- After an ongoing chat has existed for a defined window (and/or on chat close), gently prompt: *"Did you two meet up?"* with simple options (e.g., Yes, we met / Not yet / No).
- The prompt is low-friction, dismissible, and never nags (max one active ask per chat; respectful re-ask cadence).
- A "Yes, we met" answer is the atomic unit of the North Star.
- Optionally (and privately) ask a one-tap "How did it go?" to feed the satisfaction tracker.
- Answers are private to the user; the other person is never shown your answer. (A future mutual-confirmation variant is an open question — see §16.)
- Instrument fully: prompt shown, answered, outcome value, time-to-meet from match.

---

### 9.9 Memories — read-only conversation archive (P1, ISO+) — **new**

Replaces the v1 "chat history." Framed as a private journal, **never an inbox.**

**Story:** *As an ISO+ user, I want to look back on past conversations that mattered, so I can revisit meaningful moments — without reopening dead threads.*

Acceptance criteria:
- Memories is a **read-only** archive. **No messaging, no reply affordance, no unread counts, no notifications, no "matches"/"inbox" labeling.**
- Default scope: **mutual conversations only** (both said keep-talking). Non-mutual conversations are not archived by default — see privacy below.
- Each entry shows the conversation transcript, the shared ice-breaker, date, and (if the user recorded them) the private reflection score and outcome.
- **Privacy on the other party:** a user can wipe their side of any archived conversation, removing it from their own Memories. Blocked people never appear. If either party deletes their account, shared content is removed from the other's archive per policy.
- Available only to ISO+; the surface is discoverable but gated for free users (convenience gating, never visibility/matches — on-policy).
- Reachable from the Profile tab. Does **not** add a fourth primary tab (protect the three-tab IA).

**Screen:** 20 Memories.

---

### 9.10 Revival — blind, double-opt-in reconnect (P2) — **new, signature differentiator**

The emotional "second chance" without rebuilding a roster. Designed so it can only be *acted on* when a user is single-threaded, and so no one is ever re-rejected.

**Story:** *As someone who had one conversation that felt genuinely special, I want a chance to reconnect if — and only if — they felt the same, without either of us knowing unless it's mutual.*

**Slot policy (resolved for beta):** launch with **exactly one** active revival flag per user. One slot is maximally anti-roster — reserving someone means *un*-reserving whoever was there before, mirroring the one-at-a-time live constraint — and it is the cleanest story to defend against "isn't this just a roster with extra steps?" Loosening to a small private reserve (2–3) is an explicitly *data-driven* decision, not a launch default: we go one → several only if the data shows the feature rarely fires (see §16 Q10 and the hit-rate metric in §4.3). Going one → three later is an easy, additive change; three → one would feel like taking something away — so we start restrictive.

Acceptance criteria:
- After a conversation, a user may **privately flag** it as "I'd talk to them again." **Exactly one** active revival flag per user at a time. Flagging a new one prompts to replace the existing slot (an explicit trade, reinforcing scarcity).
- **No ranking is ever shown.** No "your #1," no ordered list, no "X is available" targeting language. The flag is a private, single reserve.
- **Flag decay (new):** a reserved flag is not held indefinitely. It quietly expires when either (a) a decay window elapses without a mutual match, or (b) the user has had several strong subsequent conversations after it. Decay preserves "one at a time," prevents anyone from being held on ice forever (an unkindness in itself), and keeps the slot fresh rather than stale. Expiry is silent and non-shaming; the user may re-flag if the person is still eligible.
- Revival only surfaces when **all** of the following are true: (a) the other person **independently** flagged you too (blind mutual), (b) the requesting/receiving user is **currently free** (no active chat), and (c) a **cooldown** since the original conversation has elapsed.
- **Blind by design:** neither person is ever told the other flagged them unless it becomes mutual. A one-sided flag is invisible and expires silently — **no re-rejection is possible.**
- **Safety absolute:** blocks and reports permanently disqualify a pairing from revival; a blocked person can never surface.
- On a mutual revival, both are offered a fresh **live room via the normal core loop** — not a resurrected dead thread. It then behaves exactly like any live conversation (timer, keep-talking, etc.).
- Either party can decline the revival offer; the decline is soft and not attributed.
- **Guardrails:** track **revival attempts per user** (if it climbs, the reserve is being used as a held roster — investigate) *and* the **blind-mutual hit rate** (if the feature almost never fires with one slot each, that is the evidence to justify loosening the count). See §4.3–4.4.

Flow:
```
End of conversation ──► (private) "Would you talk to them again?"  [one slot only]
                                          │
        ... time passes, you have other conversations ...
                                          │
   You're free + cooldown elapsed + THEY independently flagged you (blind, mutual)
                                          │
                        ► "A spark worth revisiting?" ─┬─ Yes ──► fresh live room (core loop)
                                                       └─ No  ──► silent; they are never told
```

**Screen (new):** 28 Revival offer (fresh-loop entry).

---

### 9.11 Satisfaction reflection & trend (P0 capture / P1 visualization) — **new**

Beli-style *reflection*, pointed at experiences and personal patterns — **never at ranking people.** No stock-ticker; a gentle trend that can't "crash" and shame the user.

**Story:** *As a user, I want to quickly say how a conversation felt and, over time, understand my own connection patterns — so I feel my experience improving, not being scored.*

**Cadence policy (resolved):** ISO is deliberately low-volume, and every conversation is already an emotionally loaded event. Rating each one risks turning a human moment into homework and subtly reframes the experience as "grade the person you just talked to." So reflection is **implicit-first**:

1. **Behavioral signal drives matching.** We already have rich implicit signal without asking anyone anything — keep-talking yes/no, reply latency and engagement, whether the conversation reached the outcome loop, and whether they eventually met. This is the primary matching-quality input.
2. **Optional one-tap reflection at conversation end** — offered, never forced; dismissible with zero friction. Best surfaced on *asymmetric* moments (a conversation notably longer/shorter than the user's baseline, or an abrupt end) where explicit signal adds the most and the user actually wants to process it.
3. **The primary explicit reflection is a weekly batched moment** inside the Connection Recap (§9.12) — "here were your conversations this week, how did they feel?" One calm reflective ritual per week, not a tax on every interaction. This is where a Beli-style loop actually shines: the value is periodic reflection on accumulated experiences, not grading a single one.

Acceptance criteria — **capture:**
- Implicit behavioral signal is captured for every conversation as the default matching input.
- An optional one-tap "How did that feel?" (simple scale + optional tags) is available at conversation end; skipping is frictionless and never penalized.
- Explicit reflection is primarily collected weekly and batched into the Recap.
- All reflection is **strictly private** and never shown to the other person.
- Any pairwise element compares *the experience to the user's own baseline* ("that conversation vs. how your conversations usually feel") — **never person-vs-person**, and never producing a visible ranked list of people.
- **Measure, then tune:** instrument prompt-completion rate *and*, critically, whether prompted users retain worse than un-prompted ones. A/B test cadence in beta (per-conversation vs. asymmetric-only vs. weekly-batched-only). If reflection causes fatigue, the retention delta will reveal it before any survey does.
- Do not let thin, self-selected reflection data influence pairing until it clears the data threshold in §16 Q12 — early on it is noisier than the behavioral signal.

Acceptance criteria — **trend + insights (P1):**
- A private personal **trend** view: a gentle line of connection quality over time. **It expresses direction and encouragement, not a volatile score; a slow week must not read as a "crash."**
- Surfaces **insights**, not just numbers (e.g., "you tend to click with people who open with a question"). Insights are private and framed constructively.
- **Never** exposes or implies a ranking of other people.
- Because ISO limits volume, the trend fills slowly — positioned as a long-game self-knowledge/retention feature, not a week-one matching sharpener.

**Screen (new):** 29 Reflection prompt · 30 Personal trend / insights.

---

### 9.12 Weekly Connection Recap (P1) — **new**

The natural home for the tracker *and the primary explicit reflection surface* (§9.11); a private, Wrapped-style retention beat.

**Story:** *As a user, I want a gentle weekly summary of my ISO life and one calm moment to reflect on how my conversations felt, so I feel a sense of progress without being graded after every chat.*

Acceptance criteria:
- Private weekly summary: conversations had, how they felt (aggregate), the personal trend, one insight, and any real dates recorded.
- **Hosts the primary explicit reflection:** a low-pressure "how did these feel?" batched review of the week's conversations, replacing per-conversation grading as the main capture point.
- Positive/encouraging tone; **no public number, no comparison to other users, nothing to "grind."**
- Deliverable in-app and (opt-in) via a single weekly notification.
- Respects the reflection-not-obligation principle: no streak-shaming, fully skippable.

**Screen:** folded into 30 (Personal trend / insights) or a lightweight recap card.

---

### 9.13 Anti-burnout re-queue guardrail (P1) — **new**

Prevents the re-queue loop from becoming a slot machine — directly serves the "reduce burnout" goal even at the cost of a session.

**Story:** *As a user having a rough run, I want ISO to gently suggest a break, so it never feels like the swipe grind I left.*

Acceptance criteria:
- After N unsuccessful/low-satisfaction conversations in a single session (N tunable), show a gentle, dismissible **"Take a break?"** nudge.
- The nudge is supportive, never blocking; the user can continue if they choose.
- Track **sessions ending via burnout nudge vs. natural exit** (§4.4) to tune N and measure impact.
- Intentionally counter to raw engagement — aligned with brand and the reduce-burnout goal.

**Screen (new):** 31 Take-a-break nudge (modal).

---

## 10. Core loop & flows

### 10.1 The core loop (v2, with outcome + reflection)

```
Enter queue → Matched live → Real-time conversation → Both keep talking?
   │                                     │                     │
   │                          (private reflection)     YES ────┴──► One ongoing chat
   │                                     │                     │            │
   │                                     │                     │      "Did you meet?" ──► date recorded (North Star)
   └── Back to queue ◄── Close politely ◄┴──────────── NO ─────┘            │
                                                                     (optional revival flag)
```

No dead chats. Reflection and outcome capture happen at the natural edges; revival flags are private and only act when mutual + free + cooled down.

### 10.2 Onboarding flow

```
Download → Verify .edu → Photo check → Prompts → Preferences → Enter queue
```

### 10.3 Revival flow (blind, double-opt-in)

See §9.10 diagram.

### 10.4 Task mapping (jobs → touchpoint → system response)

| Stage | User's task | Touchpoint | System response |
|---|---|---|---|
| Onboard | Prove I'm a real student | Verify (.edu + selfie) | Issue verified session |
| Set intent | Say who I'm looking for | Prompts + preferences | Build match profile |
| Queue | Find someone now | Live queue | Pair with a present, compatible user |
| Converse | Have a real conversation | Live room + reply timer | Keep both present; relay messages |
| Reflect | Say how it felt | Reflection prompt | Store private signal; feed trend/matching |
| Decide | Choose to continue | "Keep talking?" | One chat only if both say yes |
| Maintain | Talk / plan a date | One chat + ISO+ prompts / date planner | Enforce one-at-a-time; help plan |
| Outcome | Report if we met | "Did you meet?" | Record real date (North Star) |
| Reconnect | Give a great one a second chance | Private revival flag | Offer fresh live room only if mutual + free + cooled down |
| Look back | Revisit meaningful convos | Memories (ISO+) | Read-only archive, no reply |

### 10.5 Design explorations to resolve

- **Reply timer** — duration, expiry behavior, presence-not-pressure framing.
- **"Keep talking?" moment** — timing; simultaneous vs. sequential reveal.
- **No-match retry** — reducing thin-liquidity frustration.
- **Reflection UX** *(new)* — how to make it one-tap and never feel like homework or like scoring a person.
- **Trend visualization** *(new)* — encouraging direction without volatility/"crash" framing.
- **Revival copy & cadence** *(new)* — emotionally warm, zero optionality-hoarding language, safe against re-rejection.
- **Outcome prompt timing** *(new)* — when to ask "did you meet?" without nagging.

---

## 11. Screen inventory (v2 — 31 screens)

**A · Onboarding (1–8):** Splash · Sign up · .edu verification · Photo/liveness · Profile basics · Prompts · Preferences · Permissions.

**B · Core loop (9–16):** Home/Queue · Searching · Match found · Live room · Keep talking? · No-match retry · One chat · Close confirm.

**C · ISO+, safety & account (17–27):** ISO+ paywall · Background queue · Match-ready push · Memories (read-only archive) · Live prompts · Date planner · Report/block · Safety center · Settings · Edit profile · Subscription.

**D · New in v2 (28–31):** 28 Revival offer · 29 Reflection prompt · 30 Personal trend / insights (+ Recap) · 31 Take-a-break nudge.

**IA note:** Still three primary tabs — **Queue**, **Chat**, **Profile**. Memories, trends, recap, and settings all live under Profile. No inbox tab, ever.

---

## 12. Technical considerations & dependencies

> Product-level flags for engineering discovery.

- **Real-time infra** — low-latency bidirectional messaging + presence for matchmaking and the live room. Highest-risk area.
- **Matchmaking service** — queue + pairing on presence, campus, preferences; configurable prime-time + timeouts; rule-based for MVP. *v2:* later can consume the private satisfaction signal as a quality input (never as a paid boost).
- **Verification** — `.edu` OTP + photo/liveness (build vs. vendor decision).
- **Reflection & outcome data store** *(new)* — private per-user signals (satisfaction, outcome, revival flags) with strict access controls; drives trend, recap, matching-quality, revival eligibility.
- **Revival eligibility engine** *(new)* — evaluates blind-mutual flags + free-state + cooldown + block/report exclusions; must be privacy-preserving (no leakage of one-sided flags).
- **Archive service** *(new)* — read-only transcript storage with per-user wipe and account-deletion cascade.
- **Notifications** — background queue + match-ready alerts (P1); recap (P1, opt-in). Critical infra.
- **Moderation/backend** — report intake, block enforcement (now also gating Memories & revival), review queue.
- **Analytics/event pipeline** — full funnel + North Star + new guardrails.
- **Payments** — App Store / Play billing for ISO+.
- **Scaling assumption** — real-time matching needs concurrent density; architecture and GTM both assume geographic concentration.

---

## 13. Analytics & instrumentation

Instrument install → real date. Minimum events:

- **Onboarding funnel:** install → sign-up → .edu verified → photo verified → profile → preferences → permissions → first queue (drop-off per step).
- **Queue:** entered, match found, time-to-match, abandoned, no-match timeout.
- **Conversation:** room opened, messages, median reply latency, disconnect/abandon.
- **Decision:** keep-talking shown, yes/no per side, mutual continue.
- **Reflection** *(new):* prompt shown, answered, score, tags.
- **Outcome** *(new):* "did you meet?" shown, answered, value, time-to-meet.
- **Revival** *(new):* flag set/replaced, flag decayed/expired, blind-mutual detected, offer shown, accepted/declined, revival attempts per user, blind-mutual hit rate.
- **Reflection** *(new):* optional prompt shown, completed, skipped; weekly batched reflection engagement; prompted-vs-unprompted retention cohorts.
- **Memories** *(new):* opened, entry viewed, side wiped.
- **Burnout nudge** *(new):* shown, dismissed, session ended after nudge.
- **Retention:** DAU/WAU, D1/D7/D30 by cohort/campus.
- **Safety:** reports, blocks, moderation resolution time.
- **Monetization:** paywall views, ISO+ conversion, churn.

Every KPI and guardrail in §4 must have events before launch.

---

## 14. Go-to-market & rollout

### 14.1 Strategy — win one campus first

Real-time matching requires density, so launch **hyper-locally on one anchor campus**:

1. **Anchor campus beta** — concentrate acquisition to hit liquidity fast.
2. **Prime-time queue events** — scheduled windows that concentrate concurrent users to clear ≤60s.
3. **Background queue** (P1) — "queue and leave," smoothing off-peak liquidity.
4. **Campus-by-campus expansion** — `.edu` enables clean rollout + word-of-mouth; expand only after the anchor shows healthy liquidity + retention + early real-date signal.

### 14.2 Launch gates

- **Beta → expand:** ≤60s median prime-time match, ≥30% D7, reports/1k below threshold, **and a positive early real-date signal.**
- **ISO+ enable:** stable core loop + ≥1 full cohort past D30.
- **Revival enable** *(new):* only after enough reflection/flag data has accumulated and the blind-mutual + safety logic is validated.

### 14.3 Longer-term milestone

Ship MVP → prove sub-60s liquidity on an anchor campus → show real dates happening → convert an early ISO+ cohort → apply to YC.

---

## 15. Risks & mitigations

| Risk | Description | Mitigation |
|---|---|---|
| **Cold-start liquidity** | Real-time needs concurrency; density is everything | Hyper-local launch + prime-time events + background queue |
| **Trust & safety** | Real-time contact with young users raises stakes | `.edu` + photo verification, reply timers, text-first MVP, instant report/block, moderation queue |
| **Monetizing without pay-to-win** | Selling matches would break exclusivity | ISO+ sells convenience & expression only |
| **Entrenched incumbents** | Match Group & Bumble own market/data/habits | One-at-a-time contradicts their revenue — hard to copy |
| **Changing behavior** | "One at a time" can feel limiting | Frame as a feature; frictionless re-queue; prove better outcomes with data |
| **Real-time reliability** | Disconnects/latency break the core loop | Treat reliability as a P0 guardrail; monitor drops; graceful reconnect |
| **Roster-through-the-backdoor** *(new)* | Trackers/revival could rebuild optionality-hoarding | Rank experiences not people; one revival slot + flag-decay; blind mutual; revival only when free; guardrail metric |
| **Metric shame** *(new)* | A visible "score" that drops could drive churn | No ticker; gentle non-crashing trend; encouraging recap; no public/comparative numbers |
| **Re-rejection harm** *(new)* | Revival could re-expose someone to rejection | Fully blind; one-sided flags invisible and silently expiring |
| **Archive privacy** *(new)* | Read-only history can feel like surveillance | Mutual-only default; per-user wipe; blocks excluded; deletion cascade |

---

## 16. Open questions

1. **Reply timer mechanics** — duration, expiry behavior, presence-not-pressure framing.
2. **"Keep talking?" timing** — turn-count vs. time vs. user-initiated; simultaneous vs. sequential reveal.
3. **No-match experience** — best thin-liquidity fallback.
4. **ISO+ price point** — validate $14.99/mo.
5. **Verification** — build vs. vendor; selfie retention policy.
6. **Moderation staffing** — human review capacity at beta scale.
7. **Anchor campus selection** — density, safety, virality.
8. **Distance/campus boundary** — single campus vs. nearby for liquidity.
9. **Outcome-loop confirmation** *(new)* — keep it private/self-reported, or add an opt-in mutual "we met" confirmation for a truer North Star?
10. **Revival cooldown + slot** *(new)* — **Resolved (default):** launch with **one** active slot plus flag-decay; loosening to a small reserve (2–3) is gated on the blind-mutual hit rate (§4.3) — if the feature rarely fires with one slot each, that is the trigger to loosen. *Still open:* exact cooldown length and decay window (to tune in beta).
11. **Reflection cadence** *(new)* — **Resolved (default):** implicit behavioral signal drives matching; an optional one-tap reflection sits at conversation end (best on asymmetric moments); the primary explicit reflection is weekly and batched into the Recap. A/B test per-conversation vs. asymmetric-only vs. weekly-only in beta, tuning on the reflection-completion-vs-retention delta (§4.4). *Still open:* the winning cadence, pending beta data.
12. **When satisfaction data may influence matching** *(new)* — define the data-volume threshold before reflection signal is allowed to affect pairing, to avoid over-fitting on thin, self-selected data. Until then, behavioral signal is the matching input.
13. **Memories scope** *(new)* — mutual-only vs. optional inclusion of non-mutual with consent.

---

## 17. Milestones (indicative)

| Phase | Focus | Exit criteria |
|---|---|---|
| **M0 — Discovery** | Real-time infra spike; verification vendor; timer/keep-talking/reflection prototypes | Validated approach + tested core interactions |
| **M1 — MVP build** | P0: onboarding+verification, queue, live room, keep-talking/one-chat, safety, **reflection capture, outcome prompt** | Full core loop + outcome capture working end-to-end |
| **M2 — Anchor campus beta** | Concentrated launch + prime-time; measure liquidity, retention, **early real dates** | Hit §14.2 beta→expand gate |
| **M3 — Quality & ISO+** | P1: background queue, **Memories, live prompts, date planner, trend + recap, burnout nudge** | ISO+ conversion target met; retention holds; positive satisfaction trend |
| **M4 — Signature differentiator** | P2: **Revival (blind double-opt-in)**; expand campus-by-campus | Revival live with safety/guardrails validated; second campus reaches liquidity |

---

## Appendix A — Design system direction

Warm and intentional: a soft cream/amber palette (warm neutrals with an orange accent for primary/live actions) — friendly and human, not clinical. Grayscale wireframes reserve a single accent for the primary/live element. Conversation-first throughout; lighter on photos than incumbents. New reflective surfaces (trend, recap, Memories) should feel like a gentle private journal — calm, encouraging, never scoreboard-like.

## Appendix B — Summary of v2 changes

- **North Star** re-anchored to *real-life dates initiated*; mutual keep-talking demoted to leading indicator.
- **New P0:** post-conversation reflection capture; post-date outcome prompt.
- **New P1:** Memories (read-only ISO+ archive); satisfaction trend + insights; weekly Connection Recap; anti-burnout re-queue nudge.
- **New P2:** Revival (blind, double-opt-in, one-slot, cooldown, block-safe reconnect).
- **New principles:** rank experiences not people; reflection not obligation.
- **New guardrails:** revival attempts per user; burnout-nudge session endings; rolling satisfaction trend; archive privacy.
- **Screens:** 27 → 31 (added Revival offer, Reflection prompt, Personal trend/insights + Recap, Take-a-break nudge). IA stays three tabs.

**v2.1 refinements:**
- **Reflection cadence resolved** → implicit-first (behavioral signal drives matching), optional one-tap at conversation end, primary explicit reflection batched weekly into the Recap; A/B tested in beta on completion-vs-retention.
- **Revival slot resolved** → launch at one slot + new **flag-decay** mechanic; loosening to 2–3 is data-driven, gated on the blind-mutual hit rate.
- **New metrics:** revival blind-mutual hit rate; reflection prompt completion vs. retention delta.
- **Recap** now hosts the primary explicit reflection surface.

## Appendix C — Source materials

Synthesized from the ISO Product Pitch & UX Case Study (June 2026), the UX case study, and the 27-screen wireframe kit, extended with v2 feature ideation.

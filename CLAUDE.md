# CLAUDE.md — ISO prototype

This file gives you (Claude Code) persistent context for this repo. Read it at the start of every session.

## What this is
A **mobile-first, interactive front-end prototype** of **ISO (Intimate Setting Online)** — a real-time dating app whose entire premise is **one conversation at a time**. Users queue, get matched live with one present person, talk in a live room with a gentle reply timer, and only continue if **both** opt in ("Keep talking?"). No inbox, no roster, no feed.

## Authoritative docs (read before building)
1. `ISO_PRD_v2.md` — the full product spec. Source of truth for **product intent, features, and principles**.
2. `ISO_Prototype_Build_Spec.md` — scopes the PRD to what to build for the prototype and makes the engineering/mock decisions. Source of truth for **scope, stack, and mocking**. On scope conflicts, the build spec wins; on product-intent conflicts, the PRD wins.

Always re-read the relevant section of the build spec before starting a feature.

## Stack
React + TypeScript + Vite · Tailwind CSS · React Router · Zustand (or Context) for state · Framer Motion for the emotional beats. No backend required (mocks only). Optional two-tab live mode via `BroadcastChannel`.

## Non-negotiable principles (never violate — flag instead of building if asked)
- One conversation at a time is **enforced**: a user with an active chat cannot queue or open another.
- **Three tabs only: Queue, Chat, Profile.** Never add a matches/inbox tab.
- **No dead chats** — conversations become mutual or end cleanly back to the queue.
- **Rank experiences, never people.** No scored list of humans anywhere.
- **Reflection is a private journal, not an obligation** — no unread counts, no reply pressure, no re-rejection.
- **Revival is blind + single-slot + flag-decay** — one-sided flags are invisible and expire silently; blocks are absolute.
- **Monetize convenience/expression, never visibility or matches.**
- **Reflection is implicit-first** — behavioral signal primary; explicit rating optional/weekly.

## Design tokens (warm cream/amber; one confident orange)
`--iso-accent #FF8000` · `--iso-accent-soft #F8BD62` · `--iso-accent-tint #FFE8C1` · `--iso-bg #FFF9F0` · `--iso-surface #FFFFFF` · `--iso-text #3A2410` · `--iso-text-2 #5A3418` · `--iso-text-3 #6B4A2A` · `--iso-neutral #55555E`.
Fonts: Poppins (headers), Inter (body). Radii: 14/16px cards, 99px pills, 50% avatars. Single-accent rule: orange marks the primary/live element only.

## Mocking (see build spec §4)
- Matchmaking: simulated, 2–6s delay, occasional no-match state.
- Partner: scripted personas by default; **optionally LLM-driven via the Anthropic API** (key from env var; graceful fallback to scripted if absent — never hard-code a key).
- Verification, payments, notifications: stubbed.
- Include a `?debug` demo-controls panel (force match/no-match, pick persona, LLM on/off, partner keep-talking yes/no, force revival, reset state).

## Working style
- **Plan before coding.** Before each tier, write a short plan and confirm it against the PRD/build spec.
- Build in the tier order in build spec §5 (core loop first).
- Keep the app clean and well-structured; minimal dependencies.
- After building, run the validation checklist (build spec §9) and write/update `VALIDATION.md`.

## Commands
- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`
(Document these in `README.md`.)

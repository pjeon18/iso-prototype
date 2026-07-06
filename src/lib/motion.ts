import type { Transition } from "framer-motion";

/**
 * ISO motion system — the single source of truth (Motion Brief §1).
 * Every transition in the app uses a named preset from this file; ad-hoc
 * easing per component is an anti-pattern (and a §9 audit failure).
 *
 * Loud/quiet hierarchy:
 *   LOUD   — the color wave (ColorWave.tsx), thresholds only.
 *   MEDIUM — shared-element morphs (match card, bento cards, memories, chat).
 *   QUIET  — everything else: springs, fast, understated.
 */

/** Spring presets — Hinge weight: springy, minimal overshoot. */
export const springs = {
  /** taps, toggles, small state changes */
  snap: { type: "spring", stiffness: 400, damping: 28 },
  /** gesture settles (drag release) — stays responsive under the finger */
  standard: { type: "spring", stiffness: 300, damping: 30 },
  /** page & screen transitions — unhurried, like turning to face someone */
  calm: { type: "spring", stiffness: 190, damping: 30 },
  /** emotional beats: match reveal, keep-talking (slight, tasteful overshoot) */
  soft: { type: "spring", stiffness: 210, damping: 24 },
  /** recedes, dismissals, calming exits */
  gentle: { type: "spring", stiffness: 170, damping: 26 },
} as const satisfies Record<string, Transition>;

/** Tween durations (seconds) — for waves and opacity, where tweens beat springs.
 *  Wave timings slowed twice from the brief's 450/380ms on product-owner
 *  direction: the flood should feel like a breath, not a blink. The whole
 *  pacing philosophy: arrivals are slow (getting to know someone), input
 *  feedback stays instant. */
export const durations = {
  instant: 0.12,
  quick: 0.22,
  base: 0.3,
  /** long content reveals — screen entrances, staged copy */
  reveal: 0.65,
  /** the slowest tier: splash boot, ceremony beats */
  dwell: 1.0,
  waveIn: 0.85,
  waveOut: 0.65,
} as const;

/** wave bloom: launches fast, eases as it fills */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
/** wave recede / calm settles */
export const easeInOutSoft = [0.45, 0, 0.55, 1] as const;

/** Spreadable press state — every interactive element dips and springs back (§7). */
export const press = {
  whileTap: { scale: 0.96 },
  transition: springs.snap,
} as const;

/** Card-sized surfaces dip a touch less (§6). */
export const pressCard = {
  whileTap: { scale: 0.97 },
  transition: springs.snap,
} as const;

/** Stagger helper for lists/bento mounts: 40–60ms steps (§7). */
export const staggerDelay = (i: number, step = 0.05) => i * step;

/** Shared entrance for staggered items. */
export const riseIn = (i = 0, step = 0.05) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { ...springs.snap, delay: staggerDelay(i, step) },
});

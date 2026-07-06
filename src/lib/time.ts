/**
 * Time helpers. The demo clock = real time + a debug offset so the ?debug
 * "advance time" control can simulate the 48h outcome window and revival
 * decay without waiting.
 */

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Revival flag quietly expires after this window (PRD §9.10 flag-decay). */
export const REVIVAL_DECAY_DAYS = 14;
/** Cooldown since the original conversation before a mutual revival can surface. */
export const REVIVAL_COOLDOWN_HOURS = 48;
/** Ongoing-chat window after which the outcome prompt may appear (simulated). */
export const OUTCOME_WINDOW_HOURS = 48;

export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function daysAgoLabel(now: number, at: number): string {
  const d = Math.round((now - at) / DAY);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.round(d / 7);
  return w === 1 ? "last week" : `${w} weeks ago`;
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

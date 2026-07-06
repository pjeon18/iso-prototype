import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { durations, easeOutExpo, easeInOutSoft } from "../lib/motion";

/**
 * The color-wave system (Motion Brief §2) — the LOUDEST thing in the app,
 * reserved for thresholds: enter queue, match found, mutual keep-talking,
 * "yes we met", clean chat close. Nothing else.
 *
 * A solid flood of brand color blooms from the exact tap point, the
 * destination mounts underneath at full cover (`onCovered`), then the wave
 * clears to reveal it — handoff, never curtain. Interruptible: a new bloom
 * replaces the current one. Reduced motion: a brief full-screen tint.
 */

export type WaveColor = "accent" | "green" | "soft";

export interface BloomOptions {
  color: WaveColor;
  /** viewport coordinates of the tap (e.clientX/Y); omit → phone center */
  from?: { x: number; y: number };
  /** fired exactly at full cover — do navigation / state swaps here */
  onCovered?: () => void;
  /** gentle tempo for closure moments (clean chat close) */
  tempo?: "wave" | "gentle";
}

const COLORS: Record<WaveColor, string> = {
  accent: "var(--iso-accent)",
  green: "var(--iso-green)",
  soft: "var(--iso-accent-soft)",
};

type Cmd = BloomOptions & { seq: number };
let dispatch: ((cmd: Cmd) => void) | null = null;
let seq = 0;

/** Imperative trigger — usable from any event handler. */
export function bloomWave(opts: BloomOptions) {
  if (dispatch) dispatch({ ...opts, seq: ++seq });
  else opts.onCovered?.(); // host not mounted (tests/edge) — never block the action
}

/** Convenience: pull tap coordinates off a pointer/mouse event. */
export function tapPoint(e: { clientX: number; clientY: number }) {
  return { x: e.clientX, y: e.clientY };
}

interface ActiveWave extends Cmd {
  cx: number; // phone-local center
  cy: number;
  r: number; // radius that covers the farthest corner
  phase: "bloom" | "clear";
}

export function ColorWaveHost() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [wave, setWave] = useState<ActiveWave | null>(null);
  const waveRef = useRef<ActiveWave | null>(null);
  waveRef.current = wave;
  const reduced = useReducedMotion();

  useEffect(() => {
    dispatch = (cmd) => {
      const host = hostRef.current;
      if (!host) {
        cmd.onCovered?.();
        return;
      }
      const box = host.getBoundingClientRect();
      const cx = cmd.from ? cmd.from.x - box.left : box.width / 2;
      const cy = cmd.from ? cmd.from.y - box.top : box.height / 2;
      const r = Math.hypot(Math.max(cx, box.width - cx), Math.max(cy, box.height - cy));
      // a new bloom interrupts and replaces the current one
      setWave({ ...cmd, cx, cy, r, phase: "bloom" });
    };
    return () => {
      dispatch = null;
    };
  }, []);

  const gentle = wave?.tempo === "gentle";
  const inDur = reduced ? 0.15 : gentle ? durations.waveIn * 0.75 : durations.waveIn;
  const outDur = reduced ? 0.2 : gentle ? durations.waveOut * 1.15 : durations.waveOut;

  return (
    <div ref={hostRef} className="absolute inset-0 pointer-events-none z-[55] overflow-hidden">
      <AnimatePresence>
        {wave && (
          <motion.div
            key={wave.seq}
            className="absolute rounded-full"
            style={{
              left: wave.cx - wave.r,
              top: wave.cy - wave.r,
              width: wave.r * 2,
              height: wave.r * 2,
              background: COLORS[wave.color],
              willChange: "transform, opacity",
            }}
            initial={reduced ? { scale: 1, opacity: 0 } : { scale: 0, opacity: 1 }}
            animate={
              wave.phase === "bloom"
                ? reduced
                  ? { opacity: 1, transition: { duration: inDur } }
                  : { scale: 1, transition: { duration: inDur, ease: easeOutExpo } }
                : { opacity: 0, transition: { duration: outDur, ease: easeInOutSoft } }
            }
            onAnimationComplete={() => {
              const w = waveRef.current;
              if (!w || w.seq !== wave.seq) return; // interrupted — stale callback
              if (w.phase === "bloom") {
                // full cover: swap the world underneath, then clear to reveal it
                w.onCovered?.();
                setWave({ ...w, phase: "clear" });
              } else {
                setWave(null); // cleared
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

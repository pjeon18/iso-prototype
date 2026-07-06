import { useEffect, useRef, useState } from "react";
import { fmtClock } from "../lib/time";

/**
 * The gentle per-turn reply timer — presence, not punishment (PRD §9.3,
 * decision D3). A calm amber bar under the header; it softens (never reddens
 * or alarms) as it drains, and simply rests at zero.
 */
export function ReplyTimer({
  seconds,
  timerKey,
  running,
  onLapse,
}: {
  seconds: number;
  timerKey: number;
  running: boolean;
  onLapse: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const lapsed = useRef(false);
  const onLapseRef = useRef(onLapse);
  onLapseRef.current = onLapse;

  useEffect(() => {
    setLeft(seconds);
    lapsed.current = false;
    if (!running) return;
    const startedAt = performance.now();
    const iv = window.setInterval(() => {
      const remain = seconds - (performance.now() - startedAt) / 1000;
      setLeft(Math.max(0, remain));
      if (remain <= 0 && !lapsed.current) {
        lapsed.current = true;
        window.clearInterval(iv);
        onLapseRef.current();
      }
    }, 200);
    return () => window.clearInterval(iv);
  }, [timerKey, running, seconds]);

  const frac = Math.max(0, Math.min(1, left / seconds));
  const resting = !running;

  return (
    <div className="px-5 pt-2 pb-1 flex-none">
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-[11px] font-medium ${frac === 0 && running ? "soft-glow" : ""}`}
          style={{ color: resting ? "#B29A80" : "var(--iso-text-3)" }}
        >
          {resting
            ? "their turn — take a breath"
            : frac === 0
              ? "no rush — whenever you're ready"
              : `your turn · ${fmtClock(left)}`}
        </span>
        <span className="text-[10px]" style={{ color: "#C4AE93" }}>
          presence, not pressure
        </span>
      </div>
      <div
        className="h-[5px] rounded-pill overflow-hidden"
        style={{ background: "rgba(248,189,98,0.28)" }}
      >
        <div
          className="h-full rounded-pill"
          style={{
            width: `${(resting ? 1 : frac) * 100}%`,
            background: resting ? "rgba(248,189,98,0.45)" : "var(--iso-accent-soft)",
            transition: "width 0.25s linear, background 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

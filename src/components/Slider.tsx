import { useCallback, useRef } from "react";

/**
 * ISO sliders — every numeric input is adjustable by touch, with the number
 * displayed BIG. One thumb for values, two thumbs for ranges.
 */

const TRACK_BG = "rgba(248,189,98,0.3)";
const FILL = "var(--iso-accent)";

function useTrackDrag(onRatio: (r: number) => void) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      onRatio(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
    },
    [onRatio],
  );
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    move(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) move(e.clientX);
  };
  return { trackRef, onPointerDown, onPointerMove };
}

function Thumb({ pct }: { pct: number }) {
  return (
    <div
      className="absolute top-1/2 rounded-full"
      style={{
        left: `${pct}%`,
        width: 30,
        height: 30,
        transform: "translate(-50%,-50%)",
        background: "#fff",
        border: "3px solid var(--iso-accent)",
        boxShadow: "0 4px 12px rgba(58,36,16,0.25)",
        touchAction: "none",
      }}
    />
  );
}

/** Single-value slider with a big Poppins readout. */
export function BigSlider({
  label,
  min,
  max,
  value,
  onChange,
  format = (v) => String(v),
  unit,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  unit?: string;
}) {
  const { trackRef, onPointerDown, onPointerMove } = useTrackDrag((r) =>
    onChange(Math.round(min + r * (max - min))),
  );
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="select-none">
      <div className="flex items-end justify-between mb-1">
        <span className="text-[12px] font-semibold text-ink2">{label}</span>
        <span className="font-display font-bold leading-none text-ink" style={{ fontSize: 44, letterSpacing: "-0.03em" }}>
          {format(value)}
          {unit && (
            <span className="text-[15px] font-semibold ml-1" style={{ color: "var(--iso-text-3)" }}>
              {unit}
            </span>
          )}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative py-3 cursor-pointer"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <div className="h-[7px] rounded-pill" style={{ background: TRACK_BG }}>
          <div className="h-full rounded-pill" style={{ width: `${pct}%`, background: FILL }} />
        </div>
        <Thumb pct={pct} />
      </div>
    </div>
  );
}

/** Two-thumb range slider — drags move whichever end is closer. */
export function RangeSlider({
  label,
  min,
  max,
  lo,
  hi,
  onChange,
  format = (v) => String(v),
  unit,
}: {
  label: string;
  min: number;
  max: number;
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
  format?: (v: number) => string;
  unit?: string;
}) {
  const { trackRef, onPointerDown, onPointerMove } = useTrackDrag((r) => {
    const v = Math.round(min + r * (max - min));
    // move the nearer thumb; never let them cross
    if (Math.abs(v - lo) <= Math.abs(v - hi)) onChange(Math.min(v, hi - 1), hi);
    else onChange(lo, Math.max(v, lo + 1));
  });
  const loPct = ((lo - min) / (max - min)) * 100;
  const hiPct = ((hi - min) / (max - min)) * 100;

  return (
    <div className="select-none">
      <div className="flex items-end justify-between mb-1">
        <span className="text-[12px] font-semibold text-ink2">{label}</span>
        <span className="font-display font-bold leading-none text-ink" style={{ fontSize: 40, letterSpacing: "-0.03em" }}>
          {format(lo)}
          <span style={{ color: "var(--iso-accent)" }}> – </span>
          {format(hi)}
          {unit && (
            <span className="text-[15px] font-semibold ml-1" style={{ color: "var(--iso-text-3)" }}>
              {unit}
            </span>
          )}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative py-3 cursor-pointer"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <div className="h-[7px] rounded-pill" style={{ background: TRACK_BG }}>
          <div
            className="h-full rounded-pill"
            style={{ marginLeft: `${loPct}%`, width: `${hiPct - loPct}%`, background: FILL }}
          />
        </div>
        <Thumb pct={loPct} />
        <Thumb pct={hiPct} />
      </div>
    </div>
  );
}

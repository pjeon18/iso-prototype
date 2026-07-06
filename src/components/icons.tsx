/**
 * The ISO icon set — small warm strokes, no emoji anywhere in the product.
 * Consistent 24-viewBox, round caps, ink-3 by default.
 */

const st = (color: string, w = 1.9) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

export function Icon({
  name,
  size = 20,
  color = "var(--iso-text-3)",
  strokeWidth = 1.9,
}: {
  name: keyof typeof paths;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
      {paths[name](st(color, strokeWidth))}
    </svg>
  );
}

type S = ReturnType<typeof st>;

const paths = {
  heart: (s: S) => (
    <path {...s} d="M12 20s-7-4.6-7-10a4.2 4.2 0 0 1 7-3.1A4.2 4.2 0 0 1 19 10c0 5.4-7 10-7 10Z" />
  ),
  heartFill: (s: S) => (
    <path {...s} fill={s.stroke} d="M12 20s-7-4.6-7-10a4.2 4.2 0 0 1 7-3.1A4.2 4.2 0 0 1 19 10c0 5.4-7 10-7 10Z" />
  ),
  leaf: (s: S) => (
    <>
      <path {...s} d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z" />
      <path {...s} d="M5 19c3.5-3.5 7-7 10-10" />
    </>
  ),
  moon: (s: S) => <path {...s} d="M19 14.5A7.5 7.5 0 0 1 9.5 5 7.8 7.8 0 1 0 19 14.5Z" />,
  lock: (s: S) => (
    <>
      <rect {...s} x="5.5" y="10.5" width="13" height="9" rx="2.4" />
      <path {...s} d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  chat: (s: S) => (
    <path {...s} d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v5a3.5 3.5 0 0 1-3.5 3.5H10l-4.5 3.8c-.6.5-1.5 0-1.5-.8V7.5Z" />
  ),
  coffee: (s: S) => (
    <>
      <path {...s} d="M5 9h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Z" />
      <path {...s} d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 5.5c0-1 .8-1 .8-2M12 5.5c0-1 .8-1 .8-2" />
    </>
  ),
  bookmark: (s: S) => <path {...s} d="M7 3.5h10v17l-5-3.4-5 3.4v-17Z" />,
  music: (s: S) => (
    <>
      <path {...s} d="M9 17.5V6l10-2v11.5" />
      <circle {...s} cx="6.8" cy="17.5" r="2.3" />
      <circle {...s} cx="16.8" cy="15.5" r="2.3" />
    </>
  ),
  camera: (s: S) => (
    <>
      <path {...s} d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
      <circle {...s} cx="12" cy="12.5" r="3.4" />
    </>
  ),
  calendar: (s: S) => (
    <>
      <rect {...s} x="4.5" y="6" width="15" height="14" rx="2.4" />
      <path {...s} d="M4.5 10.5h15M8.5 4v3.5M15.5 4v3.5" />
    </>
  ),
  pin: (s: S) => (
    <>
      <path {...s} d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z" />
      <circle {...s} cx="12" cy="9.8" r="2.4" />
    </>
  ),
  bell: (s: S) => (
    <>
      <path {...s} d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path {...s} d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  bellOff: (s: S) => (
    <>
      <path {...s} d="M8.2 5.4A6 6 0 0 1 18 10c0 3 .8 4.5 1.3 5.2M6.1 9.4C6 9.6 6 9.8 6 10c0 4-1.5 5.5-1.5 5.5h11M10 19a2.2 2.2 0 0 0 4 0" />
      <path {...s} d="M4 4l16 16" />
    </>
  ),
  flag: (s: S) => <path {...s} d="M6 21V4.5m0 0c2.5-1.8 5-1.2 7 0s4.5 1.6 6 .5V13c-1.5 1.1-4 .7-6-.5s-4.5-1.8-7 0" />,
  block: (s: S) => (
    <>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M6.3 6.3l11.4 11.4" />
    </>
  ),
  shield: (s: S) => (
    <>
      <path {...s} d="M12 3.5 19 6v6c0 4.4-3 7.4-7 8.5-4-1.1-7-4.1-7-8.5V6l7-2.5Z" />
      <path {...s} d="m9.2 11.8 2 2 3.6-3.9" />
    </>
  ),
  check: (s: S) => <path {...s} d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: (s: S) => (
    <>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M12 7.5V12l3 2.5" />
    </>
  ),
  sprout: (s: S) => (
    <>
      <path {...s} d="M12 21v-8" />
      <path {...s} d="M12 13c0-3.5-2.5-6-6.5-6C5.5 10.5 8 13 12 13ZM12 10c0-3 2.2-5.5 6-5.5 0 3.5-2.2 5.5-6 5.5" />
    </>
  ),
  pause: (s: S) => (
    <>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M10 9v6M14 9v6" />
    </>
  ),
  send: (s: S) => <path {...s} d="M4 12h14M13 6l6 6-6 6" />,
  sparkle: (s: S) => (
    <path {...s} d="M12 4.5 13.8 10 19.5 12l-5.7 2-1.8 5.5L10.2 14 4.5 12l5.7-2L12 4.5Z" />
  ),
} as const;

export type IconName = keyof typeof paths;

/* -------------------------------------------------------------------------
 * FeelScale — the one-tap reflection scale (replaces emoji faces).
 * Five dots that warm up from left to right; tapping records 1–5.
 * ---------------------------------------------------------------------- */
const FEELS: { v: number; label: string; fill: string }[] = [
  { v: 1, label: "rough", fill: "rgba(107,74,42,0.28)" },
  { v: 2, label: "flat", fill: "rgba(248,189,98,0.45)" },
  { v: 3, label: "fine", fill: "#F8BD62" },
  { v: 4, label: "warm", fill: "#F2A03D" },
  { v: 5, label: "glowing", fill: "var(--iso-accent)" },
];

export function FeelScale({
  onPick,
  compact = false,
  light = false,
}: {
  onPick: (v: number) => void;
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`flex justify-center ${compact ? "gap-2.5" : "gap-4"}`}>
      {FEELS.map((f) => (
        <button
          key={f.v}
          aria-label={f.label}
          className="border-none bg-transparent cursor-pointer p-0 flex flex-col items-center gap-1.5 hover:scale-110 transition-transform"
          onClick={() => onPick(f.v)}
        >
          <span
            className="rounded-full"
            style={{
              width: compact ? 18 : 26,
              height: compact ? 18 : 26,
              background: light ? `rgba(255,255,255,${0.25 + f.v * 0.15})` : f.fill,
              boxShadow: f.v === 5 && !light ? "0 3px 10px rgba(255,128,0,0.4)" : undefined,
            }}
          />
          {!compact && (
            <span className="text-[9.5px] font-medium" style={{ color: light ? "rgba(255,255,255,0.9)" : "var(--iso-text-3)" }}>
              {f.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

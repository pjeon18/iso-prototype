import { useMemo, useState } from "react";
import { seedInsights } from "../../data/seedData";
import { DAY, daysAgoLabel } from "../../lib/time";
import { personaById, useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "../account/ProfileHub";

const FACES = [
  { v: 1, e: "😕" },
  { v: 2, e: "😐" },
  { v: 3, e: "🙂" },
  { v: 4, e: "😊" },
  { v: 5, e: "🤩" },
];

/**
 * Screen 30 — personal trend + one insight + the weekly Connection Recap,
 * which hosts the primary batched reflection (§9.11–9.12). Private, gentle,
 * encouraging — never a score, never a ranking of people, can't "crash".
 */
export function TrendRecap() {
  const history = useIsoStore((s) => s.history);
  const blocked = useIsoStore((s) => s.blocked);
  const reflectRecord = useIsoStore((s) => s.reflectRecord);
  const nowMs = useIsoStore((s) => s.now)();
  const [recapDone, setRecapDone] = useState(false);

  const records = useMemo(
    () =>
      history
        .filter((r) => !blocked.includes(r.personaId))
        .sort((a, b) => a.endedAt - b.endedAt),
    [history, blocked],
  );
  const scored = records.filter((r) => r.satisfaction !== null);
  const datesMet = records.filter((r) => r.outcome === "met").length;
  const mutuals = records.filter((r) => r.mutualContinued).length;

  const weekRecords = records.filter((r) => nowMs - r.endedAt <= 7 * DAY);
  const weekUnscored = weekRecords.filter((r) => r.satisfaction === null);

  // gentle non-crashing curve: floor the visual range so a slow week reads
  // as "resting", never as a plunge (PRD §9.11 — no ticker, no shame)
  const points = scored.map((r, i) => {
    const x = scored.length === 1 ? 50 : (i / (scored.length - 1)) * 100;
    const y = 78 - ((r.satisfaction! - 1) / 4) * 48; // y in [30, 78] — never hits the floor
    return { x, y };
  });
  const path = points.length
    ? points
        .map((p, i) => {
          if (i === 0) return `M ${p.x} ${p.y}`;
          const prev = points[i - 1];
          const cx = (prev.x + p.x) / 2;
          return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
        })
        .join(" ")
    : "";

  const insight = useMemo(() => {
    const tags = records.flatMap((r) => r.tags);
    if (tags.includes("made me laugh")) return seedInsights[2];
    if (tags.includes("curious") || tags.includes("thoughtful")) return seedInsights[0];
    return seedInsights[1];
  }, [records]);

  return (
    <SubScreen title="Your trend">
      <p className="text-[12px] text-ink3 -mt-1 mb-4">
        Private, just for you. This is about your experiences over time —
        never a score, and never a ranking of people.
      </p>

      {/* the gentle trend */}
      <div className="card p-4">
        <p className="text-[13px] font-semibold text-ink2">How your conversations have felt</p>
        {scored.length === 0 ? (
          // zero-history: encouraging, floor-bounded — never reads as a crash (§8)
          <div className="py-6 text-center">
            <span className="text-[24px]">🌱</span>
            <p className="text-[13px] text-ink2 mt-2 font-medium">Your story starts now.</p>
            <p className="text-[11.5px] text-ink3 mt-1 max-w-[230px] mx-auto">
              After your first conversation, a gentle line begins here. It
              grows slowly, on purpose — and it can't crash.
            </p>
          </div>
        ) : (
        <svg viewBox="0 0 100 90" className="w-full mt-2" style={{ height: 110 }}>
          <defs>
            <linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8BD62" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F8BD62" stopOpacity="0" />
            </linearGradient>
          </defs>
          {path && (
            <>
              <path d={`${path} L 100 90 L 0 90 Z`} fill="url(#fillg)" stroke="none" />
              <path d={path} fill="none" stroke="var(--iso-accent)" strokeWidth="2.5" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.6" fill="#fff" stroke="var(--iso-accent)" strokeWidth="1.8" />
              ))}
            </>
          )}
        </svg>
        )}
        {scored.length > 0 && (
          <p className="text-[11.5px] text-ink3">
            {scored.length < 3
              ? "Your trend fills slowly — ISO is low-volume on purpose."
              : "Trending warm. Direction over numbers — a slow week is just a slow week."}
          </p>
        )}
      </div>

      {/* one insight */}
      <div className="card p-4 mt-2.5" style={{ background: "var(--iso-accent-tint)", border: "1px solid rgba(240,201,138,0.9)" }}>
        <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ color: "#8A4A12" }}>
          One insight
        </p>
        <p className="text-[13.5px] mt-1 leading-snug" style={{ color: "#5A3418" }}>
          {insight}
        </p>
      </div>

      {/* weekly recap — hosts the primary batched reflection */}
      <div
        className="rounded-card-lg p-5 mt-2.5 text-white"
        style={{ background: "linear-gradient(150deg, #F2A03D, #E68C0F)" }}
      >
        <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase opacity-90">
          Your weekly recap
        </p>
        <p className="font-display font-semibold text-[19px] mt-1.5 leading-snug">
          {weekRecords.length === 0
            ? "A quiet week — the queue's there when you are."
            : `${weekRecords.length} real conversation${weekRecords.length > 1 ? "s" : ""} this week.`}
        </p>
        <div className="flex gap-4 mt-3 text-[12.5px]">
          <span>🧡 {mutuals} mutual</span>
          <span>☕️ {datesMet} real date{datesMet === 1 ? "" : "s"} recorded</span>
        </div>

        {weekUnscored.length > 0 && !recapDone ? (
          <div className="mt-4 rounded-card p-3.5" style={{ background: "rgba(255,255,255,0.16)" }}>
            <p className="text-[12.5px] font-medium">
              One calm moment: how did these feel? (skip freely)
            </p>
            {weekUnscored.map((r) => (
              <div key={r.id} className="flex items-center gap-2 mt-2.5">
                <span className="text-[12px] flex-1 opacity-95">
                  {personaById(r.personaId).name} · {daysAgoLabel(nowMs, r.endedAt)}
                </span>
                {FACES.map((f) => (
                  <button
                    key={f.v}
                    className="border-none bg-transparent cursor-pointer text-[17px] p-0 hover:scale-110 transition-transform"
                    onClick={() => reflectRecord(r.id, f.v, [])}
                  >
                    {f.e}
                  </button>
                ))}
              </div>
            ))}
            <button
              className="border-none bg-transparent cursor-pointer text-[11.5px] underline mt-2.5 p-0 text-white/90"
              onClick={() => setRecapDone(true)}
            >
              skip this week
            </button>
          </div>
        ) : (
          <p className="text-[12px] mt-3 opacity-90">
            {weekRecords.length > 0 ? "All reflected — nothing to grade, nothing to grind. ✨" : ""}
          </p>
        )}
      </div>
    </SubScreen>
  );
}

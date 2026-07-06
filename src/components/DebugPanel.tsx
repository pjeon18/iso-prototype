import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { personas } from "../data/seedData";
import { DEBUG_PANEL_ENABLED, useIsoStore } from "../store/useIsoStore";

/** ?debug demo-controls panel (build spec §5, decisions D5/D6). */
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const s = useIsoStore();
  if (!DEBUG_PANEL_ENABLED) return null;

  const row = "flex items-center justify-between gap-2 py-2 border-b border-black/5";
  const lbl = "text-[12px] font-medium text-ink2";
  const seg = (on: boolean) =>
    `px-2.5 py-1 rounded-pill text-[11px] font-semibold cursor-pointer border ${
      on ? "bg-ink text-white border-ink" : "bg-transparent text-ink3 border-black/15"
    }`;

  return (
    <>
      {/* z-60 keeps the gear above the open panel so it always toggles */}
      <button
        aria-label="debug"
        onClick={() => setOpen((o) => !o)}
        className="absolute bottom-40 right-3 z-[60] w-9 h-9 rounded-full border-none cursor-pointer text-[15px]"
        style={{ background: "#3A2410", color: "#F8BD62", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}
      >
        {open ? "✕" : "⚙︎"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="absolute top-14 bottom-14 right-2 z-50 w-[240px] rounded-card-lg p-3 scroll-y"
            style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 10px 40px rgba(58,36,16,0.3)", border: "1px solid rgba(90,52,24,0.12)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-display font-semibold text-[13px] text-ink">Demo controls</div>
              <button
                aria-label="minimize demo controls"
                className="border-none bg-transparent cursor-pointer text-[13px] text-ink3 px-1"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={row}>
              <span className={lbl}>Match result</span>
              <div className="flex gap-1">
                <button className={seg(!s.debug.forceNoMatch)} onClick={() => s.setDebug({ forceNoMatch: false })}>match</button>
                <button className={seg(s.debug.forceNoMatch)} onClick={() => s.setDebug({ forceNoMatch: true })}>none</button>
              </div>
            </div>

            <div className="py-2 border-b border-black/5">
              <div className={lbl}>Next persona</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button className={seg(s.debug.personaOverride === null)} onClick={() => s.setDebug({ personaOverride: null })}>any</button>
                {personas.map((p) => (
                  <button key={p.id} className={seg(s.debug.personaOverride === p.id)} onClick={() => s.setDebug({ personaOverride: p.id })}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={row}>
              <span className={lbl}>Partner engine</span>
              <div className="flex gap-1">
                <button className={seg(s.debug.partnerMode === "scripted")} onClick={() => s.setDebug({ partnerMode: "scripted" })}>scripted</button>
                <button className={seg(s.debug.partnerMode === "llm")} onClick={() => s.setDebug({ partnerMode: "llm" })}>LLM</button>
              </div>
            </div>

            <div className={row}>
              <span className={lbl}>Partner “keep talking?”</span>
              <div className="flex gap-1">
                {(["auto", "yes", "no"] as const).map((v) => (
                  <button key={v} className={seg(s.debug.partnerKeepTalking === v)} onClick={() => s.setDebug({ partnerKeepTalking: v })}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className={row}>
              <span className={lbl}>ISO+</span>
              <button className={seg(s.isPlus)} onClick={() => (s.isPlus ? s.cancelPlus() : s.unlockPlus())}>
                {s.isPlus ? "on" : "off"}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <button
                className="btn btn-sec !py-2 !text-[12px]"
                onClick={() => {
                  s.forceMutualRevival();
                  if (!s.activeChat) navigate("/queue");
                }}
              >
                Force mutual revival
              </button>
              <button className="btn btn-sec !py-2 !text-[12px]" onClick={() => s.advanceTime(48)}>
                Advance time +48h
              </button>
              <button
                className="btn btn-sec !py-2 !text-[12px]"
                onClick={() => {
                  s.skipToApp();
                  navigate("/queue");
                  setOpen(false);
                }}
              >
                Skip to app
              </button>
              <button className="btn btn-danger !py-2 !text-[12px]" onClick={() => s.resetAll()}>
                Reset all state
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

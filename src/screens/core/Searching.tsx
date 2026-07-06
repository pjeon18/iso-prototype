import { useEffect, useState } from "react";
import { asset } from "../../lib/assets";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { springs } from "../../lib/motion";
import { demoDefaults } from "../../data/seedData";
import { useIsoStore } from "../../store/useIsoStore";

const phrases = [
  "scanning campus…",
  "checking who's free right now…",
  "presence first — no ghosts here…",
  "almost there…",
];

/**
 * Screen 10 — Searching. This is where presence begins (Motion Brief §8):
 * concentric accent pulses, a live counting "N nearby", and the center disc
 * that the match card will grow out of (layoutId shared element, §4).
 */
export function Searching() {
  const leaveQueue = useIsoStore((s) => s.leaveQueue);
  const [i, setI] = useState(0);
  const [nearby, setNearby] = useState(demoDefaults.onlineNearby);

  useEffect(() => {
    // phrases turn over at a reading pace, not a ticker pace
    const iv = window.setInterval(() => setI((n) => (n + 1) % phrases.length), 2700);
    const cv = window.setInterval(
      () => setNearby((n) => Math.max(900, n + Math.round(Math.random() * 26 - 12))),
      1400,
    );
    return () => {
      window.clearInterval(iv);
      window.clearInterval(cv);
    };
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="Finding…" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.span
          className="text-[11px] font-bold tracking-[0.18em] uppercase"
          style={{ color: "var(--iso-accent)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Live matchmaking
        </motion.span>

        {/* the matchmaking ring */}
        <div className="relative mt-8 w-[132px] h-[132px]">
          {/* concentric presence pulses */}
          {[0, 1].map((k) => (
            <motion.div
              key={k}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--iso-accent)" }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.75], opacity: [0.45, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: k * 1.1, ease: "easeOut" }}
            />
          ))}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 15%, var(--iso-accent-soft) 55%, var(--iso-accent) 100%)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* the disc the match card grows out of (§4 shared element) */}
          <motion.div
            layoutId="match-hero"
            transition={springs.soft}
            className="absolute inset-[18px] rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #F8BD62, #F2A03D)" }}
          >
            <motion.img
              src={asset("assets/iso-mark-white.svg")}
              alt=""
              className="w-[52px]"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          {/* orbiting presence dot */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute -top-[3px] left-1/2 -ml-[6px] w-3 h-3 rounded-full"
              style={{ background: "var(--iso-green)", boxShadow: "0 0 10px rgba(32,197,94,0.7)" }}
            />
          </motion.div>
        </div>

        <div className="h-6 mt-6">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={i}
              className="text-[12.5px] text-ink3 inline-block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {phrases[i]}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.h2
          className="font-display font-semibold text-[19px] mt-3 text-ink"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Finding someone who's here now
        </motion.h2>
        <motion.p
          className="text-[13px] mt-2 text-ink3 max-w-[240px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            {nearby.toLocaleString()} nearby right now
          </span>
          <br />
          Both of you show up, or nobody does.
        </motion.p>
      </div>
      <motion.div
        className="px-6 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.7 }}
      >
        <button className="btn btn-sec" onClick={leaveQueue}>
          Leave the queue
        </button>
      </motion.div>
    </div>
  );
}

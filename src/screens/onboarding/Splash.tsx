import { useState } from "react";
import { asset } from "../../lib/assets";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useIsoStore } from "../../store/useIsoStore";

/**
 * Screen 01 — Splash, reproduced from the brand splash.
 *
 * Paced like a real app boot, deliberately unhurried: the screen opens on a
 * deep, intense amber that slowly warms toward the brand gradient; the mark
 * fades in alone, holds; the tagline arrives well after; and only much later
 * do the buttons ease up. Getting to know someone starts slow.
 */

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function Splash() {
  const navigate = useNavigate();
  const skipToApp = useIsoStore((s) => s.skipToApp);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  // beats (seconds): intense bg settles → logo → long hold → tagline → buttons
  const t = reduced
    ? { logo: 0.05, logoDur: 0.3, tag: 0.3, tagDur: 0.3, cta: 0.6, ctaDur: 0.3, bg: 0.3 }
    : { logo: 0.9, logoDur: 2.0, tag: 3.4, tagDur: 1.6, cta: 5.4, ctaDur: 1.4, bg: 4.5 };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "#D64400" }}>
      {/* the background eases from an intense ember up to the full brand
          gradient — the whole screen slowly warms as you arrive */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FFCE65 0%, #FF8C2E 49.5%, #D64400 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: t.bg, duration: reduced ? 0.3 : 3.2, ease: "easeInOut" }}
      />
      {/* a slow radial glow breathing behind the mark */}
      {!reduced && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(420px 420px at 50% 42%, rgba(255,220,150,0.55), transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.9, 0.6], scale: [0.9, 1.05, 1] }}
          transition={{ delay: t.logo, duration: 5, ease: "easeInOut" }}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.img
          src={asset("assets/iso-mark-white.svg")}
          alt="ISO"
          className="w-[166px] mt-16"
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: t.logo, duration: t.logoDur, ease: easeSoft }}
        />
        <motion.img
          src={asset("assets/tagline-real.svg")}
          alt="its time for a real one-on-one."
          className="mt-8 w-[248px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: t.tag, duration: t.tagDur, ease: easeSoft }}
        />
      </div>

      {/* layout space reserved from the start — nothing jumps when these arrive */}
      <motion.div
        className="px-6 pb-10 flex flex-col gap-2.5 relative z-10"
        style={{ pointerEvents: ready ? "auto" : "none" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: t.cta, duration: t.ctaDur, ease: easeSoft }}
        onAnimationComplete={() => setReady(true)}
      >
        <button
          className="btn"
          style={{ background: "#fff", color: "var(--iso-text)" }}
          onClick={() => navigate("/onboarding")}
        >
          Get started
        </button>
        <button
          className="btn"
          style={{ background: "transparent", color: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(255,255,255,0.6)" }}
          onClick={() => {
            skipToApp();
            navigate("/queue");
          }}
        >
          I have an account
        </button>
        <motion.p
          className="text-center text-[11px] mt-1"
          style={{ color: "rgba(255,255,255,0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: t.cta + 0.5, duration: 1.0 }}
        >
          One conversation at a time.
        </motion.p>
      </motion.div>
    </div>
  );
}

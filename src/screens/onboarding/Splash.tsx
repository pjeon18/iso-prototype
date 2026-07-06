import { useState } from "react";
import { asset } from "../../lib/assets";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { durations } from "../../lib/motion";
import { useIsoStore } from "../../store/useIsoStore";

/**
 * Screen 01 — Splash, reproduced from assets/iso-splash.svg.
 *
 * Paced like a real app boot, not a static slide: the gradient breathes
 * alone for a beat, the mark arrives slowly, the tagline follows, and only
 * then do the buttons fade up. Getting to know someone starts unhurried.
 */

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function Splash() {
  const navigate = useNavigate();
  const skipToApp = useIsoStore((s) => s.skipToApp);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  // beats (seconds): gradient alone → logo → tagline → buttons
  const t = reduced
    ? { logo: 0.05, logoDur: 0.3, tag: 0.25, tagDur: 0.3, cta: 0.5, ctaDur: 0.3 }
    : { logo: 0.35, logoDur: 1.1, tag: 1.5, tagDur: 0.8, cta: 2.5, ctaDur: 0.9 };

  // buttons accept input only once their entrance has actually played —
  // gated on the animation itself, not a wall-clock timer

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #FFE8C1 0%, #F8BD62 44.7%, #E68C0F 100%)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.img
          src={asset("assets/iso-mark-white.svg")}
          alt="ISO"
          className="w-[158px] mt-16"
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: t.logo, duration: t.logoDur, ease: easeSoft }}
        />
        <motion.p
          className="mt-7 font-display font-semibold text-[17px] text-white text-center"
          style={{ textShadow: "0 1px 3px rgba(126,46,2,0.25)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: t.tag, duration: t.tagDur, ease: easeSoft }}
        >
          its time for a <span style={{ color: "var(--iso-green)" }}>real</span>{" "}
          one-on-one.
        </motion.p>
      </div>

      {/* layout space is reserved from the start — nothing jumps when these arrive */}
      <motion.div
        className="px-6 pb-10 flex flex-col gap-2.5"
        style={{ pointerEvents: ready ? "auto" : "none" }}
        initial={{ opacity: 0, y: 22 }}
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
          transition={{ delay: t.cta + 0.4, duration: durations.reveal }}
        >
          One conversation at a time.
        </motion.p>
      </motion.div>
    </div>
  );
}

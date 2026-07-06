import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { Avatar } from "../../components/Avatar";
import { press, springs } from "../../lib/motion";
import { personaById, useIsoStore } from "../../store/useIsoStore";

/**
 * Screen 11 — Match found. The card GROWS OUT of the matchmaking ring
 * (layoutId shared element, `soft` spring with a slight overshoot), then the
 * reveal stages in: name → presence → ice-breaker (+80ms) → CTA (§2.2).
 */
export function MatchFound() {
  const navigate = useNavigate();
  const personaId = useIsoStore((s) => s.queue.matchedPersonaId);
  const isRevival = useIsoStore((s) => s.queue.nextIsRevival);
  const sayHi = useIsoStore((s) => s.sayHi);
  const leaveQueue = useIsoStore((s) => s.leaveQueue);
  if (!personaId) return null;
  const persona = personaById(personaId);

  return (
    <div
      className="flex-1 min-h-0 flex flex-col relative overflow-hidden"
      style={{
        background:
          "radial-gradient(420px 380px at 50% 26%, #FFE8C1 0%, var(--iso-bg) 70%)",
      }}
    >
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.span
          className="text-[11px] font-bold tracking-[0.18em] uppercase"
          style={{ color: "var(--iso-accent)" }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.soft, delay: 0.15 }}
        >
          {isRevival ? "A spark, revisited — live now" : "It's a match — live now"}
        </motion.span>

        {/* arrival burst — one brief ring, not fireworks */}
        <div className="relative mt-7">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2.5px solid var(--iso-accent)" }}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          />
          {/* the shared element — same layoutId as the searching disc */}
          <motion.div layoutId="match-hero" transition={springs.soft} className="rounded-full">
            <Avatar persona={persona} size={104} ring />
          </motion.div>
        </div>

        {/* hold on the face for a beat before the name arrives — you'd look
            at someone before reading their name tag */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.soft, delay: 0.55 }}
        >
          <h1 className="font-display font-bold text-[27px] mt-5 text-ink">
            {persona.name}, {persona.age}
          </h1>
          <p className="text-[13px] mt-1 text-ink3 flex items-center justify-center gap-1.5">
            <span className="pulse-dot" /> online now · {persona.distanceMi} mi ·{" "}
            {persona.campus}
          </p>
        </motion.div>

        {/* card lands, then the ice-breaker text fades up ~80ms later */}
        <motion.div
          className="card w-full mt-7 p-4 text-left"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.soft, delay: 0.95 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <span
              className="text-[10.5px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "var(--iso-accent)" }}
            >
              Shared ice-breaker
            </span>
            <p className="text-[15px] mt-1.5 text-ink font-medium leading-snug">
              “{persona.iceBreaker}”
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="px-6 pb-8 flex flex-col gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.soft, delay: 1.35 }}
      >
        <motion.button
          {...press}
          className="btn btn-pri"
          onClick={() => {
            sayHi();
            navigate("/room");
          }}
        >
          Say hi →
        </motion.button>
        <button className="btn btn-ghost !py-2 !text-[13px]" onClick={leaveQueue}>
          Not now — back to the queue
        </button>
      </motion.div>
    </div>
  );
}

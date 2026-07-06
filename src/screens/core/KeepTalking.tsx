import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { Avatar, MeAvatar } from "../../components/Avatar";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { Icon } from "../../components/icons";
import { press, springs } from "../../lib/motion";
import { personaById, useIsoStore } from "../../store/useIsoStore";

const headline: Record<string, string> = {
  turns: "That was a good one.",
  decide: "Ready to decide.",
  pause: "Seems like a natural pause.",
};

/**
 * Screen 13 — "Keep talking?" A dedicated full-screen moment with weight.
 * Answers are hidden until BOTH have committed, then revealed together
 * (decision D4: simultaneous reveal).
 */
export function KeepTalking() {
  const navigate = useNavigate();
  const chat = useIsoStore((s) => s.activeChat)!;
  const answer = useIsoStore((s) => s.answerKeepTalking);
  const resolve = useIsoStore((s) => s.resolveKeepTalking);
  const persona = personaById(chat.personaId);
  const kt = chat.keepTalking;
  const mutual = kt.revealed && kt.me === true && kt.partner === true;

  return (
    <div
      className="flex-1 min-h-0 h-full flex flex-col"
      style={{ background: "radial-gradient(400px 360px at 50% 20%, #FFE8C1 0%, var(--iso-bg) 72%)" }}
    >
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springs.gentle, delay: 0.2 }}
        >
          <Avatar persona={persona} size={64} ring />
        </motion.div>

        {/* the question arrives after you've had a moment with the face */}
        <motion.h1
          className="font-display font-bold text-[24px] mt-5 text-ink"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {headline[kt.reason ?? "turns"]}
        </motion.h1>
        <motion.p
          className="text-[14px] mt-2 text-ink3 max-w-[270px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Keep this as your <b>one</b> ongoing chat?
        </motion.p>

        {/* the two sealed answers — simultaneous reveal */}
        <motion.div
          className="flex gap-3 mt-8 w-full max-w-[300px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <RevealCard
            label="You"
            avatar={<MeAvatar size={30} />}
            committed={kt.me !== null}
            revealed={kt.revealed}
            saidYes={kt.me === true}
            waitingText={kt.me === null ? "deciding…" : "locked in"}
          />
          <RevealCard
            label={persona.name}
            avatar={<Avatar persona={persona} size={30} />}
            committed={kt.revealed}
            revealed={kt.revealed}
            saidYes={kt.partner === true}
            waitingText={kt.me === null ? "deciding…" : "deciding…"}
          />
        </motion.div>

        <div className="h-16 mt-5 flex items-center">
          <AnimatePresence mode="wait">
            {kt.revealed && (
              <motion.p
                key="verdict"
                className="font-display font-semibold text-[17px]"
                style={{ color: mutual ? "var(--iso-green)" : "var(--iso-text-2)" }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springs.soft, delay: 0.75 }}
              >
                {mutual
                  ? "It's mutual — you both said yes"
                  : "Not this time. Closed kindly, nothing left behind."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="px-6 pb-9 flex flex-col gap-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {kt.me === null ? (
          <>
            <button className="btn btn-pri" onClick={() => answer(true)}>
              Yes — keep talking
            </button>
            <button className="btn btn-sec" onClick={() => answer(false)}>
              No — back to the queue
            </button>
            <p className="text-center text-[11.5px] mt-1 text-ink3">
              Both of you have to say yes. Neither sees the other's answer
              until you've both decided.
            </p>
          </>
        ) : !kt.revealed ? (
          <p className="text-center text-[13px] text-ink3 py-4">
            Your answer is sealed — waiting for {persona.name}…
          </p>
        ) : (
          <motion.button
            {...press}
            className="btn btn-pri"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.soft, delay: 0.9 }}
            onClick={(e) => {
              if (mutual) {
                // LOUD threshold: a connection forming — restrained green (§2)
                bloomWave({
                  color: "green",
                  from: tapPoint(e),
                  onCovered: () => {
                    resolve();
                    navigate("/chat");
                  },
                });
              } else {
                resolve(); // quiet — the polite close is a soft landing already
              }
            }}
          >
            {mutual ? "Open your chat →" : "Okay"}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

function RevealCard({
  label,
  avatar,
  committed,
  revealed,
  saidYes,
  waitingText,
}: {
  label: string;
  avatar: React.ReactNode;
  committed: boolean;
  revealed: boolean;
  saidYes: boolean;
  waitingText: string;
}) {
  return (
    <div className="flex-1" style={{ perspective: 600 }}>
      <motion.div
        className="relative w-full h-[108px]"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.55, delay: revealed ? 0.15 : 0 }}
      >
        {/* sealed face */}
        <div
          className="card absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2"
          style={{ backfaceVisibility: "hidden" }}
        >
          {avatar}
          <span className="text-[12px] font-semibold text-ink2">{label}</span>
          <span className="text-[11px] text-ink3">{committed && !revealed ? "locked in" : waitingText}</span>
        </div>
        {/* revealed face */}
        <div
          className="card absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: saidYes ? "#F0FBF3" : "var(--iso-surface)",
            borderColor: saidYes ? "rgba(32,197,94,0.35)" : undefined,
          }}
        >
          <Icon name={saidYes ? "heartFill" : "leaf"} size={22} color={saidYes ? "var(--iso-green)" : "var(--iso-text-3)"} />
          <span className="text-[12px] font-semibold text-ink2">{label}</span>
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: saidYes ? "var(--iso-green)" : "var(--iso-text-3)" }}
          >
            {saidYes ? "keep talking" : "back to queue"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

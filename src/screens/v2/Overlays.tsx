import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../components/Modal";
import { Avatar } from "../../components/Avatar";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { Icon, FeelScale } from "../../components/icons";
import { springs } from "../../lib/motion";
import { revivalSeed } from "../../data/seedData";
import { personaById, useIsoStore } from "../../store/useIsoStore";

const TAGS = ["easy", "made me laugh", "kind", "spark", "felt off", "rushed"];

/**
 * Close-out wizard after ending an ongoing chat:
 * outcome (§9.8, the North Star atom) → optional reflection (§9.11, screen 29)
 * → private revival flag (§9.10). Every step is one-tap and skippable.
 */
export function CloseoutWizard() {
  const closeout = useIsoStore((s) => s.closeout);
  const answerOutcome = useIsoStore((s) => s.answerOutcome);
  const answerReflection = useIsoStore((s) => s.answerReflection);
  const skip = useIsoStore((s) => s.skipCloseoutStage);
  const flagRevival = useIsoStore((s) => s.flagRevivalFromCloseout);
  const slot = useIsoStore((s) => s.revival.slot);
  const [tags, setTags] = useState<string[]>([]);
  const [confirmReplace, setConfirmReplace] = useState(false);

  if (!closeout) return null;
  const persona = personaById(closeout.personaId);
  const slotConflict = slot !== null && slot.personaId !== closeout.personaId;

  return (
    <Modal open onClose={skip}>
      {closeout.stage === "outcome" && (
        <div className="text-center">
          <div className="flex justify-center"><Icon name="coffee" size={26} color="var(--iso-accent)" /></div>
          <h3 className="font-display font-semibold text-[19px] mt-2 text-ink">
            Did you two meet up?
          </h3>
          <p className="text-[12.5px] mt-1.5 text-ink3">
            Just for you — {persona.name} never sees your answer.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              className="btn btn-pri"
              onClick={(e) =>
                // the North Star beat: earned, calm joy — green wave, no confetti
                bloomWave({
                  color: "green",
                  from: tapPoint(e),
                  onCovered: () => answerOutcome("met"),
                })
              }
            >
              Yes, we met
            </button>
            <div className="flex gap-2">
              <button className="btn btn-sec !py-2.5" onClick={() => answerOutcome("not_yet")}>
                Not yet
              </button>
              <button className="btn btn-sec !py-2.5" onClick={() => answerOutcome("no")}>
                No
              </button>
            </div>
            <button className="btn btn-ghost !py-1.5 !text-[12.5px]" onClick={skip}>
              skip
            </button>
          </div>
        </div>
      )}

      {closeout.stage === "reflection" && (
        // one subtle settling pulse when arriving from the "we met" wave
        <motion.div
          className="text-center"
          initial={{ scale: 0.94 }}
          animate={{ scale: 1 }}
          transition={springs.soft}
        >
          <h3 className="font-display font-semibold text-[19px] text-ink">
            How did that feel?
          </h3>
          <p className="text-[12px] mt-1.5 text-ink3">
            Private, about the experience — never a score on {persona.name}.
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {TAGS.map((t) => (
              <button
                key={t}
                className={`chip !py-1 !px-2.5 !text-[11.5px] ${tags.includes(t) ? "chip-on" : ""}`}
                onClick={() =>
                  setTags((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))
                }
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-5 mb-1">
            <FeelScale
              onPick={(v) => {
                answerReflection(v, tags);
                setTags([]);
              }}
            />
          </div>
          <button className="btn btn-ghost !py-1.5 !text-[12.5px] mt-3" onClick={skip}>
            skip
          </button>
        </motion.div>
      )}

      {closeout.stage === "revival" && (
        <div className="text-center">
          <div className="flex justify-center"><Icon name="heart" size={26} color="var(--iso-accent)" /></div>
          <h3 className="font-display font-semibold text-[19px] mt-2 text-ink">
            Hold {persona.name} in “Maybe We'll Meet Again”?
          </h3>
          {confirmReplace ? (
            <>
              <p className="text-[12.5px] mt-2 text-ink3 leading-relaxed">
                You can hold <b>one</b> person. Choosing {persona.name} lets go
                of whoever you're holding now — an explicit trade.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <button className="btn btn-pri" onClick={() => flagRevival(true)}>
                  Hold {persona.name} instead
                </button>
                <button className="btn btn-ghost !py-2" onClick={() => setConfirmReplace(false)}>
                  Never mind
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12.5px] mt-2 text-ink3 leading-relaxed">
                Hold this one, privately. They'll never know — unless they
                independently hold you too. If they don't, it quietly fades.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <button
                  className="btn btn-pri"
                  onClick={() => (slotConflict ? setConfirmReplace(true) : flagRevival(true))}
                >
                  Hold {persona.name}
                </button>
                <button className="btn btn-ghost !py-2" onClick={() => flagRevival(false)}>
                  No thanks
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

/** Outcome prompt on a *still-ongoing* chat, fired by the 48h window (D5). */
export function OngoingOutcomePrompt() {
  const open = useIsoStore((s) => s.outcomePromptOpen);
  const chat = useIsoStore((s) => s.activeChat);
  const answer = useIsoStore((s) => s.answerOngoingOutcome);
  const dismiss = useIsoStore((s) => s.dismissOngoingOutcome);
  if (!open || !chat) return null;
  const persona = personaById(chat.personaId);

  return (
    <Modal open onClose={dismiss}>
      <div className="text-center">
        <div className="flex justify-center"><Icon name="coffee" size={26} color="var(--iso-accent)" /></div>
        <h3 className="font-display font-semibold text-[19px] mt-2 text-ink">
          Did you two meet up?
        </h3>
        <p className="text-[12.5px] mt-1.5 text-ink3">
          It's been a couple of days with {persona.name}. Private — they never
          see your answer, and we won't ask again.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <button
            className="btn btn-pri"
            onClick={(e) =>
              bloomWave({ color: "green", from: tapPoint(e), onCovered: () => answer("met") })
            }
          >
            Yes, we met
          </button>
          <div className="flex gap-2">
            <button className="btn btn-sec !py-2.5" onClick={() => answer("not_yet")}>
              Not yet
            </button>
            <button className="btn btn-sec !py-2.5" onClick={() => answer("no")}>
              No
            </button>
          </div>
          <button className="btn btn-ghost !py-1.5 !text-[12.5px]" onClick={dismiss}>
            later
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Screen 28 — Revival offer: blind, mutual, only when free; fresh loop. */
export function RevivalOffer() {
  const offer = useIsoStore((s) => s.revival.offer);
  const accept = useIsoStore((s) => s.acceptRevival);
  const decline = useIsoStore((s) => s.declineRevival);
  const onboarded = useIsoStore((s) => s.onboarded);
  if (!offer || !onboarded) return null;
  const persona = personaById(offer.personaId);

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-40 flex flex-col"
        style={{
          background: "linear-gradient(180deg, #FFE8C1 0%, #F8BD62 55%, #F2A03D 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.2 }}
          >
            <Avatar persona={persona} size={92} ring />
          </motion.div>
          <motion.h1
            className="font-display font-bold text-[25px] mt-6"
            style={{ color: "#5A3418" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            {revivalSeed.offerCopy}
          </motion.h1>
          <motion.p
            className="text-[14px] mt-3 leading-relaxed max-w-[280px]"
            style={{ color: "#6B4A2A" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            You and {persona.name} both — separately, without knowing —
            flagged that conversation. That only surfaces when it's mutual,
            and only while you're free.
          </motion.p>
          <motion.p
            className="text-[12px] mt-3"
            style={{ color: "#6B4A2A", opacity: 0.85 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.8 }}
          >
            A fresh live room — same rules, same timer, new start.
          </motion.p>
        </div>
        <motion.div
          className="px-6 pb-10 flex flex-col gap-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button className="btn btn-pri" onClick={accept}>
            Yes — take me there
          </button>
          <button
            className="btn"
            style={{ background: "transparent", color: "#5A3418", border: "1.5px solid rgba(90,52,24,0.35)" }}
            onClick={decline}
          >
            Not this time
          </button>
          <p className="text-center text-[11px] mt-1" style={{ color: "#6B4A2A" }}>
            Declining is silent — they're never told.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Screen 31 — the anti-burnout nudge. Supportive, dismissible, never blocking. */
export function BurnoutNudge() {
  const open = useIsoStore((s) => s.session.burnoutOpen);
  const dismiss = useIsoStore((s) => s.dismissBurnout);
  if (!open) return null;

  return (
    <Modal open onClose={() => dismiss(false)}>
      <div className="text-center">
        <div className="flex justify-center"><Icon name="pause" size={28} color="var(--iso-accent)" /></div>
        <h3 className="font-display font-semibold text-[19px] mt-2 text-ink">
          Take a break?
        </h3>
        <p className="text-[13px] mt-2 text-ink3 leading-relaxed">
          A few conversations in a row didn't land — that's on the night, not
          on you. The queue will still be here later, and good things happen
          when it doesn't feel like a grind.
        </p>
        <div className="flex flex-col gap-2 mt-5">
          <button className="btn btn-pri" onClick={() => dismiss(true)}>
            Good call — pausing for tonight
          </button>
          <button className="btn btn-ghost !py-2" onClick={() => dismiss(false)}>
            I'm okay — keep going
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { Icon, FeelScale } from "../../components/icons";
import {
  personaById,
  shouldNudgeBurnout,
  useIsoStore,
} from "../../store/useIsoStore";

const TAGS = ["easy", "made me laugh", "kind", "felt off", "rushed"];

/**
 * Polite close after a non-mutual "keep talking?" (screen 14 family).
 * No dead chat, no inbox — plus the optional one-tap reflection (§9.11)
 * and the private one-slot revival flag (§9.10).
 */
export function ClosedView() {
  const navigate = useNavigate();
  const personaId = useIsoStore((s) => s.lastClosedPersonaId)!;
  const recordId = useIsoStore((s) => s.lastClosedRecordId);
  const clearLastClosed = useIsoStore((s) => s.clearLastClosed);
  const enterQueue = useIsoStore((s) => s.enterQueue);
  const reflectRecord = useIsoStore((s) => s.reflectRecord);
  const flagRevival = useIsoStore((s) => s.flagRevival);
  const slot = useIsoStore((s) => s.revival.slot);
  const persona = personaById(personaId);

  const [tags, setTags] = useState<string[]>([]);
  const [reflected, setReflected] = useState<number | null>(null);
  const [flagged, setFlagged] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const slotConflict = slot !== null && slot.personaId !== personaId;

  const doFlag = () => {
    flagRevival(personaId);
    setFlagged(true);
    setConfirmReplace(false);
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col bg-cream">
      <StatusBar />
      <div className="flex-1 min-h-0 scroll-y flex flex-col items-center px-6 text-center pt-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
        >
          <Icon name="leaf" size={40} color="var(--iso-accent-soft)" />
        </motion.div>
        <h2 className="font-display font-semibold text-[21px] mt-3 text-ink">
          No worries — that happens
        </h2>
        <p className="text-[13.5px] mt-2 text-ink3 max-w-[260px]">
          Closed kindly, for both of you. No dead chat left behind, nothing
          rotting in an inbox.
        </p>

        {/* optional one-tap reflection — private, about the experience */}
        {recordId && (
          <div className="card w-full mt-6 p-4">
            {reflected === null ? (
              <>
                <p className="text-[13px] font-semibold text-ink2">
                  How did that feel?
                </p>
                <p className="text-[11px] mt-0.5 text-ink3">
                  Private, just for you — about the experience, never a score
                  on a person. Skip freely.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {TAGS.map((t) => (
                    <button
                      key={t}
                      className={`chip !py-1 !px-2.5 !text-[11.5px] ${tags.includes(t) ? "chip-on" : ""}`}
                      onClick={() =>
                        setTags((cur) =>
                          cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
                        )
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <FeelScale
                    onPick={(v) => {
                      reflectRecord(recordId, v, tags);
                      setReflected(v);
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-[13px] py-2" style={{ color: "var(--iso-green)" }}>
                Noted — private, just for you
              </p>
            )}
          </div>
        )}

        {/* private revival flag — one slot only, blind */}
        <div className="card w-full mt-3 p-4 mb-4">
          {flagged ? (
            <p className="text-[12.5px] text-ink2 py-1">
              Held privately. They'll only ever know if they hold you
              too — and it quietly expires if it stays one-sided.
            </p>
          ) : confirmReplace ? (
            <>
              <p className="text-[12.5px] text-ink2">
                You can hold <b>one</b> person in “Maybe We'll Meet Again.”
                Choosing {persona.name} lets go of whoever's there now.
              </p>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-sec !py-2 !text-[12.5px]" onClick={() => setConfirmReplace(false)}>
                  Never mind
                </button>
                <button className="btn btn-pri !py-2 !text-[12.5px]" onClick={doFlag}>
                  Hold {persona.name}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-ink2">
                Maybe you'll meet again?
              </p>
              <p className="text-[11px] mt-0.5 text-ink3">
                Hold {persona.name}, privately. They'll never know — unless
                they independently hold you too.
              </p>
              <button
                className="btn btn-sec !py-2 !text-[12.5px] mt-3"
                onClick={() => (slotConflict ? setConfirmReplace(true) : doFlag())}
              >
                Hold this one
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-8 flex flex-col gap-2 flex-none">
        <button
          className="btn btn-pri"
          onClick={(e) => {
            if (shouldNudgeBurnout()) {
              // the nudge moment stays calm — no wave over it
              clearLastClosed();
              navigate("/queue");
              return;
            }
            bloomWave({
              color: "accent",
              from: tapPoint(e),
              onCovered: () => {
                clearLastClosed();
                enterQueue();
                navigate("/queue");
              },
            });
          }}
        >
          Find someone new
        </button>
        <button
          className="btn btn-ghost !py-2.5"
          onClick={() => {
            clearLastClosed();
            navigate("/queue");
          }}
        >
          Take a break
        </button>
      </div>
    </div>
  );
}

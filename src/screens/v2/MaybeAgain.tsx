import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../../components/Avatar";
import { Icon } from "../../components/icons";
import { springs } from "../../lib/motion";
import { REVIVAL_DECAY_DAYS } from "../../lib/time";
import { personaById, useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "../account/ProfileHub";

/**
 * "Maybe We'll Meet Again" — the single revival flag, given its own home
 * (PRD §9.10). Exactly one slot; blind and double-opt-in; it only ever
 * surfaces if the other person independently held you too. This screen lets
 * you see your one held person and quietly release them — never a roster.
 */
export function MaybeAgain() {
  const slot = useIsoStore((s) => s.revival.slot);
  const releaseRevival = useIsoStore((s) => s.releaseRevival);
  const nowMs = useIsoStore((s) => s.now)();
  const [confirm, setConfirm] = useState(false);

  const persona = slot ? personaById(slot.personaId) : null;
  const daysHeld = slot ? Math.floor((nowMs - slot.flaggedAt) / 86_400_000) : 0;
  const daysLeft = Math.max(0, REVIVAL_DECAY_DAYS - daysHeld);

  return (
    <SubScreen title="Maybe We'll Meet Again">
      <p className="text-[12.5px] text-ink3 -mt-1 mb-4 leading-relaxed">
        You can hold <b>one</b> person here — a single conversation that felt
        worth a second chance. It's completely private. If they ever hold you
        back, ISO opens a fresh live room for you both. If they don't, it simply
        fades. No one is ever told.
      </p>

      {slot && persona ? (
        <motion.div
          className="card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.soft}
        >
          <div className="flex items-center gap-3.5">
            <Avatar persona={persona} size={58} ring />
            <div className="min-w-0">
              <p className="font-display font-semibold text-[18px] text-ink leading-tight">
                {persona.name}, {persona.age}
              </p>
              <p className="text-[12px] text-ink3 mt-0.5">{persona.campus}</p>
            </div>
          </div>

          <div
            className="mt-4 rounded-card px-3.5 py-3 flex items-center gap-2.5"
            style={{ background: "rgba(0,255,119,0.1)", border: "1px solid rgba(0,255,119,0.32)" }}
          >
            <Icon name="heartFill" size={18} color="var(--iso-green)" />
            <span className="text-[12.5px]" style={{ color: "var(--iso-text-2)" }}>
              Held quietly for {daysHeld === 0 ? "today" : `${daysHeld} day${daysHeld === 1 ? "" : "s"}`}
              {daysLeft > 0 ? ` · fades on its own in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : " · fading soon"}.
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5">
            <Icon name="lock" size={16} color="var(--iso-text-3)" />
            <p className="text-[11.5px] text-ink3 leading-relaxed">
              {persona.name} has no idea they're here. This never becomes a chat
              on its own — only a genuine, independent match from their side can
              bring you back together.
            </p>
          </div>

          {confirm ? (
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost !py-2.5 flex-1" onClick={() => setConfirm(false)}>
                Keep holding
              </button>
              <button
                className="btn btn-danger !py-2.5 flex-1"
                onClick={() => {
                  releaseRevival();
                  setConfirm(false);
                }}
              >
                Release
              </button>
            </div>
          ) : (
            <button className="btn btn-sec mt-4" onClick={() => setConfirm(true)}>
              Release this one
            </button>
          )}
        </motion.div>
      ) : (
        <div className="card p-6 text-center">
          <div className="flex justify-center mb-3">
            <Icon name="heart" size={34} color="var(--iso-accent-soft)" />
          </div>
          <p className="text-[14px] font-semibold text-ink">No one held right now</p>
          <p className="text-[12.5px] text-ink3 mt-1.5 leading-relaxed">
            When a conversation ends and it felt like it could have been
            something, you'll get the choice to hold them here. Just one, at a
            time — like everything on ISO.
          </p>
        </div>
      )}

      <p className="text-[11px] text-ink3 text-center mt-5 leading-relaxed">
        One slot, on purpose. Reserving someone new replaces whoever was here —
        the same one-at-a-time that makes the live room matter.
      </p>
    </SubScreen>
  );
}

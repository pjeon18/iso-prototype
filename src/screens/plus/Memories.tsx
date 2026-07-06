import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../../components/Avatar";
import { Icon } from "../../components/icons";
import { springs, staggerDelay } from "../../lib/motion";
import { daysAgoLabel } from "../../lib/time";
import {
  personaById,
  useIsoStore,
  type ConversationRecord,
} from "../../store/useIsoStore";
import { SubScreen } from "../account/ProfileHub";

const OUTCOME_LABEL: Record<string, string> = {
  met: "you met up",
  not_yet: "not yet",
  no: "didn't meet",
  none: "",
};

/**
 * Screen 20 — Memories: a private, READ-ONLY journal of mutual conversations.
 * No reply affordance, no unread counts, no inbox labeling — ever (§9.9).
 */
export function Memories() {
  const navigate = useNavigate();
  const isPlus = useIsoStore((s) => s.isPlus);
  const blocked = useIsoStore((s) => s.blocked);
  const history = useIsoStore((s) => s.history);
  const nowMs = useIsoStore((s) => s.now)();

  const entries = history
    .filter((r) => r.archived && r.mutualContinued && !blocked.includes(r.personaId))
    .sort((a, b) => b.endedAt - a.endedAt);

  return (
    <SubScreen title="Memories">
      <p className="text-[12px] text-ink3 -mt-1 mb-4">
        A private journal of conversations where you both said yes. Read-only —
        nothing here can be replied to, and no one is waiting.
      </p>

      {!isPlus ? (
        <div className="card p-5 text-center">
          <div className="flex justify-center"><Icon name="clock" size={26} color="var(--iso-accent)" /></div>
          <p className="text-[14px] font-semibold text-ink mt-2">Memories is part of ISO+</p>
          <p className="text-[12px] text-ink3 mt-1.5 leading-relaxed">
            Look back on the conversations that mattered. Convenience only —
            it never affects matching.
          </p>
          <button className="btn btn-pri !py-2.5 !text-[13.5px] mt-4" onClick={() => navigate("/plus")}>
            See ISO+
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="card p-5 text-center text-[13px] text-ink3">
          No mutual conversations yet — your journal fills slowly, on purpose.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((r, i) => (
            <MemoryEntry key={r.id} r={r} nowMs={nowMs} index={i} />
          ))}
        </div>
      )}
    </SubScreen>
  );
}

function MemoryEntry({
  r,
  nowMs,
  index,
}: {
  r: ConversationRecord;
  nowMs: number;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const wipeMemory = useIsoStore((s) => s.wipeMemory);
  const persona = personaById(r.personaId);

  // seeded entries have no stored transcript — synthesize a short excerpt
  const transcript =
    r.messages.filter((m) => m.from !== "system").length > 0
      ? r.messages.filter((m) => m.from !== "system")
      : [
          { id: "x1", from: "partner" as const, text: persona.scripted.opener, at: 0 },
          { id: "x2", from: "me" as const, text: "haha okay that's a strong open", at: 0 },
          { id: "x3", from: "partner" as const, text: persona.scripted.replies[0], at: 0 },
        ];

  return (
    // §4: the memory expands from its position in the list; back collapses it.
    // `layout` animates the card and its siblings as the detail unfolds.
    <motion.div
      layout
      className="card p-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.standard, delay: staggerDelay(index) }}
    >
      <button
        className="flex items-center gap-3 w-full text-left border-none bg-transparent cursor-pointer p-0"
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar persona={persona} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink">{persona.name}</p>
          <p className="text-[11.5px] text-ink3 truncate">
            {daysAgoLabel(nowMs, r.endedAt)}
            {r.outcome !== "none" && ` · ${OUTCOME_LABEL[r.outcome]}`}
          </p>
        </div>
        <span className="text-ink3">{open ? "▾" : "›"}</span>
      </button>

      <AnimatePresence initial={false}>
      {open && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.25 }}
          className="mt-3 pt-3 border-t"
          style={{ borderColor: "rgba(90,52,24,0.1)" }}
        >
          <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--iso-accent)" }}>
            Shared ice-breaker
          </p>
          <p className="text-[12.5px] text-ink2 mt-0.5 mb-3">{persona.iceBreaker}</p>

          <div className="flex flex-col gap-1.5">
            {transcript.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-[12.5px] ${
                  m.from === "me" ? "self-end" : "self-start"
                }`}
                style={
                  m.from === "me"
                    ? { background: "var(--iso-accent-tint)", color: "#8A4A12" }
                    : { background: "rgba(90,52,24,0.06)", color: "var(--iso-text-2)" }
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          {(r.satisfaction !== null || r.tags.length > 0) && (
            <p className="text-[11.5px] text-ink3 mt-3 flex items-center gap-1 flex-wrap">
              Your private reflection:
              {r.satisfaction !== null &&
                Array.from({ length: r.satisfaction }).map((_, k) => (
                  <Icon key={k} name="heartFill" size={12} color="var(--iso-green)" />
                ))}
              {r.tags.length > 0 && <span>· {r.tags.join(", ")}</span>}
            </p>
          )}

          {confirmWipe ? (
            <div className="flex gap-2 mt-3">
              <button className="btn btn-ghost !py-2 !text-[12px]" onClick={() => setConfirmWipe(false)}>
                Keep it
              </button>
              <button className="btn btn-danger !py-2 !text-[12px]" onClick={() => wipeMemory(r.id)}>
                Wipe my side
              </button>
            </div>
          ) : (
            <button
              className="border-none bg-transparent cursor-pointer text-[11.5px] mt-3 p-0 underline"
              style={{ color: "var(--iso-text-3)" }}
              onClick={() => setConfirmWipe(true)}
            >
              Wipe this from my Memories
            </button>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

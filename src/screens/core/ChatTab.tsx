import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { Avatar } from "../../components/Avatar";
import { TypingDots } from "../../components/TypingDots";
import { Modal } from "../../components/Modal";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { personaById, useIsoStore } from "../../store/useIsoStore";
import { Bubble } from "./LiveRoom";
import { ReportBlockSheet } from "../safety/ReportBlockSheet";
import { LivePromptsTray } from "../plus/LivePrompts";

/** Screen 15 — the ONE ongoing chat (Chat tab). Screen 16 — close confirm. */
export function ChatTab() {
  const chat = useIsoStore((s) => s.activeChat);
  const navigate = useNavigate();

  if (!chat) return <EmptyChat />;
  if (chat.phase !== "ongoing") return <LiveHandoff onGo={() => navigate("/room")} />;
  return <OneChat />;
}

function EmptyChat() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="ISO" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* a designed empty state, not a grey void (§8): a slow breathing
            invitation where the one conversation will live */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "1.5px solid var(--iso-accent-soft)" }}
            animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-[26px]"
            style={{ background: "var(--iso-accent-tint)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            💬
          </motion.div>
        </div>
        <h2 className="font-display font-semibold text-[19px] mt-4 text-ink">
          No connection right now
        </h2>
        <p className="text-[13.5px] mt-2 text-ink3 max-w-[250px]">
          When you and someone both say “keep talking,” your one chat lives
          here. Just one — that's the point.
        </p>
        <button className="btn btn-pri mt-7" onClick={() => navigate("/queue")}>
          Meet someone in the queue
        </button>
      </div>
    </div>
  );
}

function LiveHandoff({ onGo }: { onGo: () => void }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="ISO" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <span className="chip chip-on !cursor-default">
          <span className="pulse-dot" /> live now
        </span>
        <h2 className="font-display font-semibold text-[19px] mt-4 text-ink">
          You're in a live room
        </h2>
        <p className="text-[13.5px] mt-2 text-ink3">They're waiting — don't ghost.</p>
        <button className="btn btn-pri mt-7" onClick={onGo}>
          Return to the room
        </button>
      </div>
    </div>
  );
}

function OneChat() {
  const navigate = useNavigate();
  const chat = useIsoStore((s) => s.activeChat)!;
  const sendMessage = useIsoStore((s) => s.sendMessage);
  const requestCloseOngoing = useIsoStore((s) => s.requestCloseOngoing);
  const persona = personaById(chat.personaId);
  const [draft, setDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e6, behavior: "smooth" });
  }, [chat.messages.length, chat.partnerTyping]);

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col bg-cream relative">
      <StatusBar right="ISO" />
      <div className="text-center pb-1.5 flex-none">
        <span className="chip chip-on !cursor-default !py-1 !text-[11.5px]">
          Your one connection
        </span>
      </div>

      <div
        className="flex items-center gap-3 px-5 py-2 flex-none border-b"
        style={{ borderColor: "rgba(90,52,24,0.10)" }}
      >
        <Avatar persona={persona} size={36} />
        <div>
          <div className="font-display font-semibold text-[15px] text-ink leading-tight">
            {persona.name}
          </div>
          <div className="text-[11.5px] text-ink3">you both said yes 🎉</div>
        </div>
        <div className="flex-1" />
        <button
          aria-label="safety menu"
          className="border-none bg-transparent cursor-pointer text-[20px] text-ink3 px-2"
          onClick={() => setSafetyOpen(true)}
        >
          ⋯
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 scroll-y px-5 py-3 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {chat.messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          {chat.partnerTyping && (
            <motion.div
              key="typing"
              className="self-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LivePromptsTray />

      <button
        className="mx-4 mb-2 flex items-center gap-2 rounded-card px-3.5 py-2.5 text-[12px] cursor-pointer flex-none border"
        style={{
          background: "var(--iso-surface)",
          borderColor: "rgba(90,52,24,0.12)",
          color: "var(--iso-text-2)",
        }}
        onClick={() => setConfirmOpen(true)}
      >
        🔒 Talk to someone new?
        <span className="flex-1" />
        <span className="text-ink3">›</span>
      </button>

      <div className="flex items-center gap-2.5 px-4 pb-5 flex-none">
        <input
          className="input !rounded-pill !py-3"
          placeholder={`Message ${persona.name}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          aria-label="send"
          className="w-11 h-11 rounded-full border-none cursor-pointer flex-none flex items-center justify-center"
          style={{ background: draft.trim() ? "var(--iso-accent)" : "rgba(255,128,0,0.35)" }}
          onClick={send}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Screen 16 — close confirmation: the exclusivity guardrail */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="text-center">
          <div className="text-[30px]">🔒</div>
          <h3 className="font-display font-semibold text-[19px] mt-2 text-ink">
            Close your chat with {persona.name}?
          </h3>
          <p className="text-[13px] mt-2 text-ink3 leading-relaxed">
            ISO keeps you to one conversation at a time. To meet someone new,
            you'll end this one — kindly, for both of you.
          </p>
          <div className="flex flex-col gap-2 mt-5">
            <button className="btn btn-sec" onClick={() => setConfirmOpen(false)}>
              Keep talking to {persona.name}
            </button>
            <button
              className="btn btn-danger"
              onClick={(e) => {
                // closure, not celebration — a soft amber settle back to Queue
                bloomWave({
                  color: "soft",
                  tempo: "gentle",
                  from: tapPoint(e),
                  onCovered: () => {
                    setConfirmOpen(false);
                    requestCloseOngoing();
                    navigate("/queue");
                  },
                });
              }}
            >
              Close & re-enter the queue
            </button>
          </div>
        </div>
      </Modal>

      <ReportBlockSheet open={safetyOpen} onClose={() => setSafetyOpen(false)} personaId={persona.id} />
    </div>
  );
}

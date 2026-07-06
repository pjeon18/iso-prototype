import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { Avatar } from "../../components/Avatar";
import { TypingDots } from "../../components/TypingDots";
import { ReplyTimer } from "../../components/ReplyTimer";
import { springs } from "../../lib/motion";
import { demoDefaults } from "../../data/seedData";
import { personaById, useIsoStore, type Message } from "../../store/useIsoStore";
import { KeepTalking } from "./KeepTalking";
import { ClosedView } from "./ClosedView";
import { ReportBlockSheet } from "../safety/ReportBlockSheet";

/** Screen 12 — the live room. Presence, gentle pace, one person. */
export function LiveRoom() {
  const chat = useIsoStore((s) => s.activeChat);
  const lastClosed = useIsoStore((s) => s.lastClosedPersonaId);

  if (!chat) {
    return lastClosed ? <ClosedView /> : <Navigate to="/queue" replace />;
  }
  if (chat.phase === "ongoing") return <Navigate to="/chat" replace />;
  if (chat.phase === "deciding") return <KeepTalking />;
  return <RoomLive />;
}

function RoomLive() {
  const chat = useIsoStore((s) => s.activeChat)!;
  const sendMessage = useIsoStore((s) => s.sendMessage);
  const timerLapsed = useIsoStore((s) => s.timerLapsed);
  const readyToDecide = useIsoStore((s) => s.readyToDecide);
  const persona = personaById(chat.personaId);
  const [draft, setDraft] = useState("");
  const [safetyOpen, setSafetyOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const humanMsgs = chat.messages.filter((m) => m.from !== "system");
  const last = humanMsgs[humanMsgs.length - 1];
  const myTurn = !!last && last.from === "partner" && !chat.partnerTyping;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e6, behavior: "smooth" });
  }, [chat.messages.length, chat.partnerTyping]);

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    // chat-open continuity (§4, approximated): the room settles in on a soft
    // spring from the summary you tapped, rather than cutting
    <motion.div
      className="flex-1 min-h-0 h-full flex flex-col bg-cream"
      initial={{ opacity: 0, scale: 0.965, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springs.soft}
    >
      <StatusBar right={<span style={{ color: "var(--iso-accent)" }}>● LIVE</span>} />

      {/* header */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 flex-none border-b"
        style={{ borderColor: "rgba(90,52,24,0.10)" }}
      >
        <Avatar persona={persona} size={38} />
        <div className="min-w-0">
          <div className="font-display font-semibold text-[15px] text-ink leading-tight">
            {persona.name}, {persona.age}
          </div>
          <div className="text-[11.5px] flex items-center gap-1.5" style={{ color: "var(--iso-green)" }}>
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> here now ·{" "}
            <span className="text-ink3">{persona.distanceMi} mi</span>
          </div>
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

      <ReplyTimer
        seconds={demoDefaults.replyTimerSeconds}
        timerKey={chat.timerKey}
        running={myTurn}
        onLapse={timerLapsed}
      />

      {/* thread */}
      <div ref={scrollRef} className="flex-1 min-h-0 scroll-y px-5 py-3 flex flex-col gap-2">
        <div
          className="card p-3 mb-1 text-left"
          style={{ background: "var(--iso-accent-tint)", border: "1px solid rgba(240,201,138,0.8)" }}
        >
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "#8A4A12" }}>
            Shared ice-breaker
          </span>
          <p className="text-[13.5px] mt-0.5 leading-snug" style={{ color: "#5A3418" }}>
            {persona.iceBreaker}
          </p>
        </div>

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

      {/* subtle "ready to decide" affordance (decision D4) */}
      {humanMsgs.length >= 4 && (
        <button
          className="border-none bg-transparent cursor-pointer text-[12px] py-1 flex-none"
          style={{ color: "var(--iso-text-3)", textDecoration: "underline", textDecorationColor: "rgba(107,74,42,0.3)" }}
          onClick={readyToDecide}
        >
          feeling ready to decide?
        </button>
      )}

      {/* composer */}
      <div className="flex items-center gap-2.5 px-4 pb-5 pt-2 flex-none">
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
          style={{
            background: draft.trim() ? "var(--iso-accent)" : "rgba(255,128,0,0.35)",
            transition: "background 0.2s",
          }}
          onClick={send}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <ReportBlockSheet open={safetyOpen} onClose={() => setSafetyOpen(false)} personaId={persona.id} />
    </motion.div>
  );
}

export function Bubble({ m }: { m: Message }) {
  if (m.from === "system") {
    return (
      <motion.div
        className="self-center text-center text-[11.5px] px-4 py-1 rounded-pill my-0.5"
        style={{ color: "var(--iso-text-3)", background: "rgba(248,189,98,0.18)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {m.text}
      </motion.div>
    );
  }
  const mine = m.from === "me";
  return (
    <motion.div
      className={`max-w-[78%] px-4 py-2.5 text-[14px] leading-snug ${
        mine ? "self-end rounded-2xl rounded-br-md" : "self-start rounded-2xl rounded-bl-md"
      }`}
      style={
        mine
          ? { background: "var(--iso-accent)", color: "#fff" }
          : { background: "var(--iso-surface)", color: "var(--iso-text)", border: "1px solid rgba(90,52,24,0.08)" }
      }
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    >
      {m.text}
    </motion.div>
  );
}

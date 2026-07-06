import { useEffect, useState } from "react";
import { asset } from "../../lib/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGroup, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { Icon } from "../../components/icons";
import { press } from "../../lib/motion";
import { demoDefaults } from "../../data/seedData";
import {
  openBurnout,
  personaById,
  shouldNudgeBurnout,
  useIsoStore,
} from "../../store/useIsoStore";
import { Searching } from "./Searching";
import { MatchFound } from "./MatchFound";
import { NoMatch } from "./NoMatch";

/** Screen 09 — Home/Queue (+ routes to 10/11/14 by queue state).
 *  LayoutGroup lets the match card grow out of the matchmaking ring (§4). */
export function QueueTab() {
  const status = useIsoStore((s) => s.queue.status);
  const background = useIsoStore((s) => s.queue.background);

  return (
    <LayoutGroup id="queue">
      {status === "searching" && !background ? (
        <Searching />
      ) : status === "matched" ? (
        <MatchFound />
      ) : status === "noMatch" ? (
        <NoMatch />
      ) : (
        <QueueHome />
      )}
    </LayoutGroup>
  );
}

function QueueHome() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const enterQueue = useIsoStore((s) => s.enterQueue);
  const leaveQueue = useIsoStore((s) => s.leaveQueue);
  const activeChat = useIsoStore((s) => s.activeChat);
  const isPlus = useIsoStore((s) => s.isPlus);
  const backgroundSearching = useIsoStore(
    (s) => s.queue.status === "searching" && s.queue.background,
  );
  const [online, setOnline] = useState(demoDefaults.onlineNearby);

  // living "online nearby" count
  useEffect(() => {
    const iv = window.setInterval(() => {
      setOnline((n) => Math.max(900, n + Math.round(Math.random() * 30 - 14)));
    }, 3500);
    return () => window.clearInterval(iv);
  }, []);

  // anti-burnout guardrail: gentle, dismissible, never blocking (§9.13).
  // Panes stay mounted on the swipe track, so gate on actually being here.
  useEffect(() => {
    if (pathname === "/queue" && !activeChat && shouldNudgeBurnout()) openBurnout();
  }, [activeChat, pathname]);

  const partner = activeChat ? personaById(activeChat.personaId) : null;

  // home settles in piece by piece on arrival — a room you walk into,
  // not a slide that's already playing
  const settle = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="ISO" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.span
          className="chip chip-on !cursor-default"
          style={{ fontSize: 12.5 }}
          {...settle(0.15)}
        >
          <span className="pulse-dot" /> {online.toLocaleString()} online nearby
        </motion.span>

        <motion.h1
          className="font-display font-bold text-[26px] leading-tight mt-5 text-ink"
          {...settle(0.35)}
        >
          Ready to meet someone?
        </motion.h1>
        <motion.p className="text-[14px] mt-2 text-ink3 max-w-[260px]" {...settle(0.55)}>
          One person, online now. No swiping, no roster — just a real
          conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="mt-8 w-[108px] h-[108px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(160deg, #F8BD62, #F2A03D)",
              boxShadow: "0 14px 34px rgba(242,160,61,0.4)",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={asset("assets/iso-mark-white.svg")} alt="" className="w-[62px]" />
          </motion.div>
        </motion.div>

        {partner && (
          <div className="card w-full mt-8 p-4 text-left">
            <p className="text-[13px] text-ink2 leading-snug">
              You're talking with <b>{partner.name}</b> right now — ISO keeps
              you to one conversation at a time.
            </p>
            <button
              className="btn btn-pri !py-2.5 !text-[13.5px] mt-3"
              onClick={() =>
                navigate(activeChat!.phase === "ongoing" ? "/chat" : "/room")
              }
            >
              Return to your conversation
            </button>
          </div>
        )}

        {backgroundSearching && (
          <div className="card w-full mt-8 p-4 text-left">
            <p className="text-[13px] text-ink2 leading-snug">
              <b>Queued in the background</b> — do your thing, we'll ping you
              the moment a match is live.
            </p>
            <button className="btn btn-sec !py-2.5 !text-[13.5px] mt-3" onClick={leaveQueue}>
              Pause background queue
            </button>
          </div>
        )}
      </div>

      <motion.div className="px-6 pb-4 flex flex-col gap-2.5" {...settle(1.0)}>
        <motion.button
          {...press}
          className="btn btn-pri inline-flex items-center justify-center gap-2"
          style={partner ? { opacity: 0.55, boxShadow: "none" } : undefined}
          onClick={(e) => {
            if (partner) {
              enterQueue(); // store no-op + toast — the invariant speaks, no wave
              return;
            }
            // LOUD threshold: committing to be present (Motion Brief §2)
            bloomWave({
              color: "accent",
              from: tapPoint(e),
              onCovered: () => enterQueue(),
            });
          }}
        >
          {partner && <Icon name="lock" size={16} color="#fff" />}
          Enter the queue
        </motion.button>
        {!backgroundSearching && (
          <button
            className="btn btn-sec !py-3 !text-[14px] inline-flex items-center justify-center gap-2"
            onClick={() => (isPlus ? enterQueue(true) : navigate("/plus"))}
          >
            <Icon name="moon" size={16} color="var(--iso-text-2)" />
            Background queue
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-pill"
              style={{ background: "var(--iso-accent-tint)", color: "#8A4A12" }}
            >
              ISO+
            </span>
          </button>
        )}
      </motion.div>
    </div>
  );
}

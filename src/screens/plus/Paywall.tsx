import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { useIsoStore } from "../../store/useIsoStore";

const PERKS = [
  { icon: "🌙", title: "Background queue", body: "Queue up, close the app — we ping you when a match is live." },
  { icon: "🕰️", title: "Memories", body: "A private, read-only journal of the conversations that mattered." },
  { icon: "🎵", title: "Live prompts", body: "Song requests, photo-of-the-day — expression, in the moment." },
  { icon: "📅", title: "Date planner", body: "Move your one chat toward a real-life date, faster." },
];

/** Screen 17 — ISO+ paywall. Convenience & expression — never matches. */
export function Paywall() {
  const navigate = useNavigate();
  const unlockPlus = useIsoStore((s) => s.unlockPlus);
  const isPlus = useIsoStore((s) => s.isPlus);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="ISO+" />
      <div className="flex-1 min-h-0 scroll-y px-6">
        <div className="text-center pt-4">
          <h1 className="font-display font-bold text-[26px] text-ink">ISO+</h1>
          <p className="text-[13.5px] mt-1 text-ink3">Date on your schedule.</p>
        </div>
        <div className="flex flex-col gap-2.5 mt-6">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              className="card p-4 flex gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
            >
              <span className="text-[22px]">{p.icon}</span>
              <div>
                <p className="text-[14px] font-semibold text-ink">{p.title}</p>
                <p className="text-[12px] text-ink3 mt-0.5 leading-snug">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[12px] mt-5 text-ink2 font-medium">
          No pay-to-win, ever. ISO+ never buys you more matches, visibility,
          or a better spot in anyone's queue — that line is permanent.
        </p>
      </div>
      <div className="px-6 pb-8 pt-3 flex flex-col gap-2 flex-none">
        {isPlus ? (
          <button className="btn btn-sec" onClick={() => navigate(-1)}>
            You're already a member ✨ — back
          </button>
        ) : (
          <>
            <button
              className="btn btn-pri"
              onClick={() => {
                unlockPlus();
                navigate(-1);
              }}
            >
              Try ISO+ · $14.99/mo
            </button>
            <button className="btn btn-ghost !py-2" onClick={() => navigate(-1)}>
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}

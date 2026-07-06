import { motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { bloomWave, tapPoint } from "../../components/ColorWave";
import { Icon } from "../../components/icons";
import { useIsoStore } from "../../store/useIsoStore";

/** Screen 14 — No-match retry: graceful, never an error. */
export function NoMatch() {
  const dismissNoMatch = useIsoStore((s) => s.dismissNoMatch);
  const enterQueue = useIsoStore((s) => s.enterQueue);
  const toast = useIsoStore((s) => s.toast);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
        >
          <Icon name="leaf" size={44} color="var(--iso-accent-soft)" />
        </motion.div>
        <h2 className="font-display font-semibold text-[21px] mt-4 text-ink">
          Campus is quiet right now
        </h2>
        <p className="text-[13.5px] mt-2.5 text-ink3 max-w-[260px] leading-relaxed">
          No one compatible is free this exact minute — that's the point. When
          you do match, they're <i>really</i> here.
        </p>
        <div
          className="card w-full mt-6 p-3.5 text-[12.5px] text-ink2 flex items-center gap-2.5 text-left"
        >
          <Icon name="moon" size={18} color="var(--iso-accent)" />
          <span>
            <b>Prime time is 9–11pm</b> — that's when your campus shows up.
          </span>
        </div>
      </div>
      <div className="px-6 pb-8 flex flex-col gap-2">
        <button
          className="btn btn-pri"
          onClick={(e) =>
            bloomWave({ color: "accent", from: tapPoint(e), onCovered: () => enterQueue() })
          }
        >
          Try again
        </button>
        <button
          className="btn btn-sec"
          onClick={() => {
            dismissNoMatch();
            toast("We'll be here at prime time.");
          }}
        >
          Come back at prime time
        </button>
      </div>
    </div>
  );
}

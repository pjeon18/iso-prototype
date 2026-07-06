import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIsoStore } from "../store/useIsoStore";

export function Toasts() {
  const toasts = useIsoStore((s) => s.toasts);
  const dismiss = useIsoStore((s) => s.dismissToast);
  const navigate = useNavigate();

  return (
    <div className="absolute left-0 right-0 bottom-24 z-50 flex flex-col items-center gap-2 px-6 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto max-w-full rounded-card-lg px-4 py-3 text-[13px] leading-snug shadow-lg"
            style={{
              background: "#3A2410",
              color: "#FFF3DE",
              boxShadow: "0 10px 30px rgba(58,36,16,0.35)",
            }}
          >
            <div className="flex items-center gap-3">
              <span>{t.text}</span>
              {t.action?.kind === "openMatch" && (
                <button
                  className="flex-none rounded-pill px-3 py-1.5 text-[12px] font-semibold border-none cursor-pointer"
                  style={{ background: "var(--iso-accent)", color: "#fff" }}
                  onClick={() => {
                    dismiss(t.id);
                    navigate("/queue");
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { springs } from "../lib/motion";

/** Center modal + bottom sheet, scoped to the phone frame. */
export function Modal({
  open,
  onClose,
  children,
  sheet = false,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  sheet?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`absolute inset-0 z-40 flex ${sheet ? "items-end" : "items-center"} justify-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(58,36,16,0.45)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />
          <motion.div
            className={`relative z-10 w-full ${sheet ? "" : "px-6"}`}
            initial={sheet ? { y: "100%" } : { scale: 0.94, opacity: 0, y: 12 }}
            animate={sheet ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={sheet ? { y: "100%" } : { scale: 0.96, opacity: 0, y: 6 }}
            transition={springs.soft}
          >
            <div
              className={sheet ? "rounded-t-[24px] px-6 pt-3 pb-8" : "rounded-[22px] p-6"}
              style={{
                background: "var(--iso-surface)",
                boxShadow: "0 -8px 40px rgba(58,36,16,0.18)",
              }}
            >
              {sheet && (
                <div
                  className="w-10 h-1 rounded-pill mx-auto mb-4"
                  style={{ background: "rgba(107,74,42,0.25)" }}
                />
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

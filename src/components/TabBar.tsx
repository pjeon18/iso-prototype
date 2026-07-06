import { NavLink } from "react-router-dom";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useIsoStore } from "../store/useIsoStore";

/**
 * The three-tab IA: Queue · Chat · Profile. Deliberately nothing else —
 * no matches tab, no inbox tab, ever (build spec §7.2).
 * The indicator pill slides continuously with the track drag (§3).
 */
const tabs = [
  {
    to: "/queue",
    label: "Queue",
    icon: (on: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.2" stroke={on ? "var(--iso-accent)" : "#A08A72"} strokeWidth="2" />
        <circle cx="12" cy="12" r="2.6" fill={on ? "var(--iso-accent)" : "#A08A72"} />
      </svg>
    ),
  },
  {
    to: "/chat",
    label: "Chat",
    icon: (on: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6a3.5 3.5 0 0 1-3.5 3.5H10l-4.2 3.6c-.6.5-1.3 0-1.3-.7V6.5Z"
          stroke={on ? "var(--iso-accent)" : "#A08A72"}
          strokeWidth="2"
          fill={on ? "var(--iso-accent-tint)" : "none"}
        />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (on: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.2" r="3.6" stroke={on ? "var(--iso-accent)" : "#A08A72"} strokeWidth="2" />
        <path
          d="M4.8 20c.9-3.4 3.8-5.2 7.2-5.2s6.3 1.8 7.2 5.2"
          stroke={on ? "var(--iso-accent)" : "#A08A72"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const PILL_W = 44;

export function TabBar({ x, paneW }: { x: MotionValue<number>; paneW: number }) {
  const hasChat = useIsoStore((s) => s.activeChat !== null);
  // track x ∈ [0, -2·paneW] → tab progress ∈ [0, 2] → pill position
  const slotW = paneW / 3;
  const pillX = useTransform(x, (v) => {
    const progress = paneW > 0 ? Math.max(0, Math.min(2, -v / paneW)) : 0;
    return progress * slotW + (slotW - PILL_W) / 2;
  });

  return (
    <nav
      className="flex-none relative flex items-stretch border-t bg-surface"
      style={{ borderColor: "rgba(90,52,24,0.10)", paddingBottom: 10 }}
    >
      <motion.div
        className="absolute top-1.5 h-[3.5px] rounded-pill"
        style={{ x: pillX, width: PILL_W, background: "var(--iso-accent)" }}
      />
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className="flex-1 flex flex-col items-center gap-0.5 pt-3 no-underline relative"
        >
          {({ isActive }) => (
            <>
              {t.icon(isActive)}
              <span
                className="text-[10.5px] font-medium"
                style={{ color: isActive ? "var(--iso-accent)" : "#A08A72" }}
              >
                {t.label}
              </span>
              {t.to === "/chat" && hasChat && (
                <span
                  className="absolute top-2.5 right-[calc(50%-22px)] w-2 h-2 rounded-full"
                  style={{ background: "var(--iso-green)" }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

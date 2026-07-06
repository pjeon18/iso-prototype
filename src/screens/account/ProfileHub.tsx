import { useEffect, useRef, useState } from "react";
import { asset } from "../../lib/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { MeAvatar } from "../../components/Avatar";
import { pressCard, riseIn, springs } from "../../lib/motion";
import { useIsoStore } from "../../store/useIsoStore";

/**
 * Profile tab — aesthetic bento grid of DESTINATIONS (Motion Brief §6).
 * Never a feed, never a list of people, never an inbox. Uneven card sizes
 * for hierarchy, uniform gaps, cards as distinct floating surfaces, a
 * glance-able bit of state on each, shared-element expand into each screen.
 */

// ---- icons: small custom strokes in the warm system (no stock icon soul) ----
const stroke = { stroke: "var(--iso-text-3)", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const Icons = {
  edit: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path {...stroke} d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20Z" />
      <path {...stroke} d="M13.5 7l3 3" />
    </svg>
  ),
  plus: (
    // the chess-piece mark, tiny — ISO+'s own glyph
    <img src={asset("assets/iso-mark-white.svg")} alt="" style={{ width: 30, filter: "drop-shadow(0 1px 1px rgba(126,46,2,0.25))" }} />
  ),
  bell: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path {...stroke} d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path {...stroke} d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  ),
  memories: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path {...stroke} d="M6 3.5h12v17l-6-3.6-6 3.6v-17Z" />
    </svg>
  ),
  shield: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path {...stroke} d="M12 3.5 19 6v6c0 4.4-3 7.4-7 8.5-4-1.1-7-4.1-7-8.5V6l7-2.5Z" />
      <path {...stroke} d="m9.2 11.8 2 2 3.6-3.9" />
    </svg>
  ),
  gear: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <circle {...stroke} cx="12" cy="12" r="3.2" />
      <path {...stroke} d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4" />
    </svg>
  ),
  card: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <rect {...stroke} x="3.5" y="6" width="17" height="12.5" rx="2.5" />
      <path {...stroke} d="M3.5 10.5h17" />
    </svg>
  ),
  trend: (
    <svg width="21" height="21" viewBox="0 0 24 24">
      <path {...stroke} d="M4 17c3-1 4-6.5 7-6.5s3.5 4 6 4c1.4 0 2.4-.9 3-1.8" />
    </svg>
  ),
};

interface Card {
  key: string;
  to: string;
  label: string;
  state: React.ReactNode;
  icon: React.ReactNode;
  size: "hero" | "tall" | "square";
  treatment?: "plus" | "journal";
}

// rect registry so the collapse morph can find its way home
let pendingCollapseKey: string | null = null;

export function ProfileHub() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useIsoStore((s) => s.user);
  const isPlus = useIsoStore((s) => s.isPlus);
  const history = useIsoStore((s) => s.history);
  const blocked = useIsoStore((s) => s.blocked);
  const reports = useIsoStore((s) => s.reports);

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [morph, setMorph] = useState<null | {
    key: string;
    mode: "expand" | "collapse";
    rect: { left: number; top: number; width: number; height: number };
  }>(null);

  const memoriesCount = history.filter(
    (r) => r.archived && r.mutualContinued && !blocked.includes(r.personaId),
  ).length;
  const datesMet = history.filter((r) => r.outcome === "met").length;

  const cards: Card[] = [
    { key: "edit", to: "/profile/edit", label: "Edit profile", size: "hero", icon: Icons.edit,
      state: `${user.prompts.length} prompts · conversation-first` },
    { key: "memories", to: "/profile/memories", label: "Memories", size: "tall", icon: Icons.memories, treatment: "journal",
      state: isPlus ? `${memoriesCount} saved — private` : "part of ISO+" },
    { key: "plus", to: isPlus ? "/profile/subscription" : "/plus", label: "ISO+", size: "square", icon: Icons.plus, treatment: "plus",
      state: isPlus ? "Active ✨" : "Try it" },
    { key: "notifications", to: "/profile/settings", label: "Notifications", size: "square", icon: Icons.bell,
      state: (
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--iso-green)" }} />
          match alerts on
        </span>
      ) },
    { key: "safety", to: "/profile/safety", label: "Safety center", size: "square", icon: Icons.shield,
      state: reports.length + blocked.length === 0 ? "all clear" : `${reports.length + blocked.length} handled` },
    { key: "settings", to: "/profile/settings", label: "Settings", size: "square", icon: Icons.gear, state: "alerts · account" },
    { key: "subscription", to: "/profile/subscription", label: "Subscription", size: "square", icon: Icons.card,
      state: isPlus ? "$14.99/mo" : "free plan" },
    { key: "trend", to: "/profile/trend", label: "Your trend", size: "square", icon: Icons.trend,
      state: datesMet > 0 ? `${datesMet} real date${datesMet > 1 ? "s" : ""} ☕️` : "story starts now" },
  ];

  const fullRect = () => {
    const r = rootRef.current!.getBoundingClientRect();
    return { left: 0, top: 0, width: r.width, height: r.height };
  };

  const openCard = (card: Card, el: HTMLElement) => {
    const root = rootRef.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setMorph({
      key: card.key,
      mode: "expand",
      rect: { left: r.left - root.left, top: r.top - root.top, width: r.width, height: r.height },
    });
  };

  // collapse morph plays when we land back on /profile after an expand
  useEffect(() => {
    if (pathname === "/profile" && pendingCollapseKey) {
      const key = pendingCollapseKey;
      pendingCollapseKey = null;
      const el = cardRefs.current.get(key);
      const root = rootRef.current;
      if (!el || !root) return;
      const rootR = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setMorph({
        key,
        mode: "collapse",
        rect: { left: r.left - rootR.left, top: r.top - rootR.top, width: r.width, height: r.height },
      });
    }
  }, [pathname]);

  return (
    <div ref={rootRef} className="flex-1 min-h-0 flex flex-col bg-cream relative overflow-hidden">
      <StatusBar right="ISO" />
      <div className="flex-1 min-h-0 scroll-y px-5 pb-6">
        {/* asymmetric header — the name owns the top-left */}
        <motion.div
          className="flex items-start justify-between pt-5 pb-6 pr-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snap}
        >
          <div>
            <h1
              className="font-display font-bold text-[34px] leading-[1.05] text-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              {user.firstName}
            </h1>
            <p className="text-[15px] mt-1.5 text-ink3">
              {user.age} · <span style={{ color: "var(--iso-green)" }}>✓</span> verified
            </p>
            <p className="text-[12px] mt-0.5 text-ink3 opacity-80">
              {user.campus}
              {isPlus && " · ISO+ member"}
            </p>
          </div>
          <MeAvatar size={56} />
        </motion.div>

        {/* bento grid — distinct floating cards, uniform 11px gaps, uneven sizes */}
        <div
          className="grid grid-cols-2"
          style={{ gap: 11, gridAutoRows: 96 }}
        >
          {cards.map((card, i) => (
            <BentoCard
              key={card.key}
              card={card}
              index={i}
              registerRef={(el) => el && cardRefs.current.set(card.key, el)}
              onOpen={(el) => openCard(card, el)}
            />
          ))}
        </div>
        <p className="text-center text-[11px] text-ink3 mt-6 mb-1">
          One conversation at a time. 🧡
        </p>
      </div>

      {/* the expanding/collapsing clone — the card becomes the screen (§4) */}
      <AnimatePresence>
        {morph && (
          <motion.div
            key={`${morph.key}-${morph.mode}`}
            className="absolute rounded-card-lg z-30"
            style={{ background: "var(--iso-bg)", boxShadow: "0 10px 30px rgba(58,36,16,0.14)" }}
            initial={morph.mode === "expand" ? { ...morph.rect, borderRadius: 14, backgroundColor: "#FFFFFF" } : { ...fullRect(), borderRadius: 0, backgroundColor: "#FFF9F0" }}
            animate={morph.mode === "expand" ? { ...fullRect(), borderRadius: 0, backgroundColor: "#FFF9F0" } : { ...morph.rect, borderRadius: 14, backgroundColor: "#FFFFFF", opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={springs.soft}
            onAnimationComplete={() => {
              if (morph.mode === "expand") {
                if (pendingCollapseKey === morph.key) return; // already navigated
                pendingCollapseKey = morph.key;
                const dest = cards.find((c) => c.key === morph.key)!;
                navigate(dest.to, { state: { morph: true } });
                window.setTimeout(() => setMorph(null), 320);
              } else {
                setMorph(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BentoCard({
  card,
  index,
  registerRef,
  onOpen,
}: {
  card: Card;
  index: number;
  registerRef: (el: HTMLElement | null) => void;
  onOpen: (el: HTMLElement) => void;
}) {
  const span =
    card.size === "hero" ? "col-span-2" : card.size === "tall" ? "row-span-2" : "";
  const isPlusCard = card.treatment === "plus";
  const isJournal = card.treatment === "journal";

  return (
    <motion.button
      ref={registerRef as (el: HTMLButtonElement | null) => void}
      {...pressCard}
      {...riseIn(index + 1)}
      className={`${span} text-left border-none cursor-pointer flex flex-col justify-between rounded-card`}
      style={{
        padding: "16px 17px",
        background: isPlusCard
          ? "linear-gradient(150deg, var(--iso-accent) 0%, var(--iso-accent-soft) 105%)"
          : isJournal
            ? "linear-gradient(170deg, #FFFDF8 0%, var(--iso-accent-tint) 130%)"
            : "var(--iso-surface)",
        border: "1px solid rgba(90,52,24,0.07)",
        boxShadow: "0 1px 2px rgba(58,36,16,0.08), 0 10px 24px rgba(58,36,16,0.06)",
        borderRadius: card.size === "hero" ? 16 : 14,
      }}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <span className="flex items-start justify-between w-full">
        {card.icon}
        <span
          className="text-[13px]"
          style={{ color: isPlusCard ? "rgba(255,255,255,0.9)" : "var(--iso-text-3)" }}
        >
          ›
        </span>
      </span>
      <span>
        <span
          className="block font-display font-semibold text-[15px] leading-tight"
          style={{ color: isPlusCard ? "#fff" : "var(--iso-text)" }}
        >
          {card.label}
        </span>
        <span
          className="block text-[11.5px] mt-1"
          style={{ color: isPlusCard ? "rgba(255,255,255,0.88)" : "var(--iso-text-3)" }}
        >
          {card.state}
        </span>
      </span>
    </motion.button>
  );
}

export function SubScreen({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-cream">
      <StatusBar right="ISO" />
      <div className="flex items-center gap-2 px-4 py-1 flex-none">
        <button
          className="border-none bg-transparent cursor-pointer text-[15px] text-ink2 px-2 py-1"
          onClick={() => navigate("/profile")}
        >
          ‹ Back
        </button>
        <h2 className="font-display font-semibold text-[17px] text-ink">{title}</h2>
      </div>
      <div className="flex-1 min-h-0 scroll-y px-6 py-3">{children}</div>
    </div>
  );
}

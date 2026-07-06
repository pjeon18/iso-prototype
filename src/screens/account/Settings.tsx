import { useState } from "react";
import { useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "./ProfileHub";

/** Screen 25 — Settings (stubs with honest copy). */
export function Settings() {
  const toast = useIsoStore((s) => s.toast);
  const resetAll = useIsoStore((s) => s.resetAll);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [recapNotif, setRecapNotif] = useState(false);

  const Toggle = ({
    label,
    body,
    on,
    set,
  }: {
    label: string;
    body: string;
    on: boolean;
    set: (v: boolean) => void;
  }) => (
    <button className="card p-4 flex items-center gap-3 text-left w-full border-none cursor-pointer" onClick={() => set(!on)}>
      <span className="flex-1">
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        <span className="block text-[12px] text-ink3 mt-0.5">{body}</span>
      </span>
      <span className="w-11 rounded-pill relative flex-none transition-colors" style={{ background: on ? "var(--iso-green)" : "rgba(107,74,42,0.25)", height: 26 }}>
        <span className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 22 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </span>
    </button>
  );

  return (
    <SubScreen title="Settings">
      <div className="flex flex-col gap-2">
        <Toggle
          label="Match-ready alerts"
          body="The one notification that matters — a real person is live."
          on={matchAlerts}
          set={setMatchAlerts}
        />
        <Toggle
          label="Weekly recap"
          body="One calm summary a week. Opt-in, never a streak."
          on={recapNotif}
          set={setRecapNotif}
        />
        <button className="card p-4 text-left w-full border-none cursor-pointer text-[14px] text-ink2" onClick={() => toast("Only verified students can ever match with you — that's not a setting, it's the product.")}>
          Who can match with me ›
        </button>
        <button className="card p-4 text-left w-full border-none cursor-pointer text-[14px] text-ink2" onClick={() => toast("Signed out (demo stub).")}>
          Log out
        </button>
        <button className="card p-4 text-left w-full border-none cursor-pointer text-[14px]" style={{ color: "#8a4a4a" }} onClick={resetAll}>
          Reset demo data
        </button>
      </div>
      <p className="text-[11px] text-ink3 text-center mt-5">
        Notice what's missing: no “manage your matches,” no read receipts to
        buy, no visibility boosts. There's nothing here to grind.
      </p>
    </SubScreen>
  );
}

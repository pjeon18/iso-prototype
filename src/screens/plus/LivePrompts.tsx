import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal";
import { Icon, type IconName } from "../../components/icons";
import { personaById, useIsoStore } from "../../store/useIsoStore";

/**
 * Screens 21 + 22 — ISO+ live prompts tray (song / photo / date planner)
 * inside the one ongoing chat. Convenience & expression only — never
 * visibility or matches.
 */
export function LivePromptsTray() {
  const navigate = useNavigate();
  const isPlus = useIsoStore((s) => s.isPlus);
  const sendMessage = useIsoStore((s) => s.sendMessage);
  const toast = useIsoStore((s) => s.toast);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const gate = (fn: () => void) => () => {
    if (!isPlus) {
      navigate("/plus");
      return;
    }
    fn();
  };

  return (
    <>
      <div className="flex gap-2 px-4 pb-2 flex-none">
        <TrayBtn icon="music" label="Song" onClick={gate(() => sendMessage("song request: play me the song you've had on repeat"))} plus={!isPlus} />
        <TrayBtn icon="camera" label="Photo" onClick={gate(() => sendMessage("photo of your day — go"))} plus={!isPlus} />
        <TrayBtn icon="calendar" label="Plan" onClick={gate(() => setPlannerOpen(true))} plus={!isPlus} />
      </div>
      <DatePlannerSheet open={plannerOpen} onClose={() => setPlannerOpen(false)} onPlanned={() => toast("Date planned — now go actually meet.")} />
    </>
  );
}

function TrayBtn({ icon, label, onClick, plus }: { icon: IconName; label: string; onClick: () => void; plus: boolean }) {
  return (
    <button
      className="flex-1 rounded-card border px-2 py-2 text-[12px] font-medium cursor-pointer relative flex items-center justify-center gap-1.5"
      style={{
        background: "var(--iso-surface)",
        borderColor: "rgba(90,52,24,0.12)",
        color: "var(--iso-text-2)",
        opacity: plus ? 0.75 : 1,
      }}
      onClick={onClick}
    >
      <Icon name={icon} size={15} color="var(--iso-text-2)" />
      {label}
      {plus && (
        <span
          className="absolute -top-1.5 -right-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded-pill"
          style={{ background: "var(--iso-accent-tint)", color: "#8A4A12" }}
        >
          ISO+
        </span>
      )}
    </button>
  );
}

/** Screen 22 — Date planner: move the match toward a real-life date. */
function DatePlannerSheet({
  open,
  onClose,
  onPlanned,
}: {
  open: boolean;
  onClose: () => void;
  onPlanned: () => void;
}) {
  const chat = useIsoStore((s) => s.activeChat);
  const sendMessage = useIsoStore((s) => s.sendMessage);
  const [when, setWhen] = useState("Thursday · 7pm");
  const [where, setWhere] = useState("Café Solstice (0.3 mi)");
  const persona = chat ? personaById(chat.personaId) : null;

  return (
    <Modal open={open} onClose={onClose} sheet>
      <h3 className="font-display font-semibold text-[17px] text-ink">Plan it together</h3>
      <p className="text-[12px] mt-0.5 text-ink3">
        The whole point is leaving the app{persona ? ` — with ${persona.name}` : ""}.
      </p>
      <div className="flex flex-col gap-2.5 mt-4">
        <div>
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--iso-accent)" }}>
            When
          </span>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {["Thursday · 7pm", "Friday · 6:30pm", "Sat · afternoon"].map((w) => (
              <button key={w} className={`chip !text-[12px] ${when === w ? "chip-on" : ""}`} onClick={() => setWhen(w)}>
                {w}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--iso-accent)" }}>
            Where (suggested nearby)
          </span>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {["Café Solstice (0.3 mi)", "Mini golf (1.1 mi)", "The bad museum (0.8 mi)"].map((w) => (
              <button key={w} className={`chip !text-[12px] ${where === w ? "chip-on" : ""}`} onClick={() => setWhere(w)}>
                {w}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn btn-pri mt-2"
          onClick={() => {
            sendMessage(`date idea: ${where.replace(/ \(.*\)/, "")}, ${when} — in?`);
            onPlanned();
            onClose();
          }}
        >
          Suggest it in chat
        </button>
      </div>
    </Modal>
  );
}

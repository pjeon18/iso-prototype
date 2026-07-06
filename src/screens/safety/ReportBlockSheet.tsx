import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/icons";
import { personaById, useIsoStore } from "../../store/useIsoStore";

const REASONS = ["Made me uncomfortable", "Inappropriate messages", "Spam or fake profile", "Something else"];

/** Screen 23 — Report / block bottom sheet. Instant, private, minimal taps. */
export function ReportBlockSheet({
  open,
  onClose,
  personaId,
}: {
  open: boolean;
  onClose: () => void;
  personaId: string;
}) {
  const navigate = useNavigate();
  const reportPersona = useIsoStore((s) => s.reportPersona);
  const blockPersona = useIsoStore((s) => s.blockPersona);
  const toast = useIsoStore((s) => s.toast);
  const persona = personaById(personaId);
  const [mode, setMode] = useState<"menu" | "report" | "block">("menu");

  const close = () => {
    setMode("menu");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} sheet>
      {mode === "menu" && (
        <>
          <h3 className="font-display font-semibold text-[17px] text-ink">Keep ISO safe</h3>
          <p className="text-[12px] mt-0.5 text-ink3">
            Private — {persona.name} is never told.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button className="card p-3.5 text-left text-[14px] text-ink2 cursor-pointer border-none w-full flex items-center gap-2.5" onClick={() => setMode("report")}>
              <Icon name="flag" size={17} color="var(--iso-text-2)" /> Report a problem
            </button>
            <button className="card p-3.5 text-left text-[14px] text-ink2 cursor-pointer border-none w-full flex items-center gap-2.5" onClick={() => setMode("block")}>
              <Icon name="block" size={17} color="var(--iso-text-2)" /> Block & end chat
            </button>
            <button
              className="card p-3.5 text-left text-[14px] text-ink2 cursor-pointer border-none w-full flex items-center gap-2.5"
              onClick={() => {
                toast("Notifications muted for this chat.");
                close();
              }}
            >
              <Icon name="bellOff" size={17} color="var(--iso-text-2)" /> Mute notifications
            </button>
            <button className="btn btn-ghost !py-2.5" onClick={close}>
              Cancel
            </button>
          </div>
        </>
      )}

      {mode === "report" && (
        <>
          <h3 className="font-display font-semibold text-[17px] text-ink">What happened?</h3>
          <p className="text-[12px] mt-0.5 text-ink3">
            Our team reviews every report. {persona.name} won't know.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            {REASONS.map((r) => (
              <button
                key={r}
                className="card p-3.5 text-left text-[14px] text-ink2 cursor-pointer border-none w-full"
                onClick={() => {
                  reportPersona(personaId, r);
                  close();
                }}
              >
                {r}
              </button>
            ))}
            <button className="btn btn-ghost !py-2.5" onClick={() => setMode("menu")}>
              Back
            </button>
          </div>
        </>
      )}

      {mode === "block" && (
        <>
          <h3 className="font-display font-semibold text-[17px] text-ink">
            Block {persona.name}?
          </h3>
          <p className="text-[12.5px] mt-2 text-ink3 leading-relaxed">
            This ends the conversation immediately. They can never match with
            you, appear in your Memories, or be revived — permanently. They
            aren't notified.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              className="btn btn-danger"
              onClick={() => {
                blockPersona(personaId);
                close();
                navigate("/queue");
              }}
            >
              Block & end chat
            </button>
            <button className="btn btn-ghost !py-2.5" onClick={() => setMode("menu")}>
              Back
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

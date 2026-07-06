import { useNavigate } from "react-router-dom";
import { useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "./ProfileHub";

/** Screen 27 — Subscription management. */
export function Subscription() {
  const navigate = useNavigate();
  const isPlus = useIsoStore((s) => s.isPlus);
  const cancelPlus = useIsoStore((s) => s.cancelPlus);

  return (
    <SubScreen title="Subscription">
      {isPlus ? (
        <>
          <div className="card p-5 text-center">
            <span className="text-[26px]">✨</span>
            <p className="font-display font-semibold text-[17px] text-ink mt-1.5">ISO+ · active</p>
            <p className="text-[12.5px] text-ink3 mt-1">$14.99/mo · renews on the 1st (demo)</p>
          </div>
          <p className="text-[12px] text-ink3 mt-3 leading-relaxed text-center">
            ISO+ is convenience and expression only. Cancelling never affects
            who you match with — it can't, by design.
          </p>
          <button className="btn btn-sec mt-4" onClick={cancelPlus}>
            Cancel ISO+
          </button>
        </>
      ) : (
        <>
          <div className="card p-5 text-center">
            <p className="font-display font-semibold text-[17px] text-ink">No subscription</p>
            <p className="text-[12.5px] text-ink3 mt-1.5">
              The core experience — the queue, the room, your one chat — is
              free, forever.
            </p>
          </div>
          <button className="btn btn-pri mt-4" onClick={() => navigate("/plus")}>
            See what ISO+ adds
          </button>
        </>
      )}
    </SubScreen>
  );
}

import { personaById, useIsoStore } from "../../store/useIsoStore";
import { Icon } from "../../components/icons";
import { daysAgoLabel } from "../../lib/time";
import { SubScreen } from "../account/ProfileHub";

/** Screen 24 — Safety center: history, tips, resources. */
export function SafetyCenter() {
  const reports = useIsoStore((s) => s.reports);
  const blocked = useIsoStore((s) => s.blocked);
  const nowMs = useIsoStore((s) => s.now)();

  return (
    <SubScreen title="Safety center">
      <div className="card p-4">
        <p className="text-[13px] font-semibold text-ink2">Your trust status</p>
        <p className="text-[12.5px] text-ink3 mt-1.5 leading-relaxed">
          <span style={{ color: "var(--iso-green)" }}>✓</span> .edu verified ·{" "}
          <span style={{ color: "var(--iso-green)" }}>✓</span> photo verified
          <br />
          Everyone you can match with is verified the same way — before their
          first match, not after.
        </p>
      </div>

      <div className="card p-4 mt-2.5">
        <p className="text-[13px] font-semibold text-ink2">Your reports & blocks</p>
        {reports.length === 0 && blocked.length === 0 ? (
          <p className="text-[12.5px] text-ink3 mt-1.5">
            Nothing here — and if there ever is, it's private and acted on
            fast.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-1.5">
            {reports.map((r, i) => (
              <p key={i} className="text-[12.5px] text-ink3 flex items-start gap-1.5">
                <Icon name="flag" size={14} color="var(--iso-text-3)" />
                <span>
                  Reported {personaById(r.personaId).name} — “{r.reason}” ·{" "}
                  {daysAgoLabel(nowMs, r.at)} · under review
                </span>
              </p>
            ))}
            {blocked.map((id) => (
              <p key={id} className="text-[12.5px] text-ink3 flex items-start gap-1.5">
                <Icon name="block" size={14} color="var(--iso-text-3)" />
                <span>
                  Blocked {personaById(id).name} — permanent, everywhere
                  (matching, Memories, revival)
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 mt-2.5">
        <p className="text-[13px] font-semibold text-ink2">Meeting up, safely</p>
        <ul className="text-[12.5px] text-ink3 mt-1.5 leading-relaxed pl-4 m-0">
          <li>First dates in public places — campus cafés count.</li>
          <li>Tell a friend where you're going; share your live location.</li>
          <li>Report and block work from every conversation, in two taps.</li>
          <li>Blocking is silent — they're never told.</li>
        </ul>
      </div>

      <div className="card p-4 mt-2.5">
        <p className="text-[13px] font-semibold text-ink2">Resources</p>
        <p className="text-[12.5px] text-ink3 mt-1.5 leading-relaxed">
          Campus safety escort: (206) 555-0100 · RAINN hotline: 800-656-4673 ·
          Crisis Text Line: text HOME to 741741
        </p>
      </div>
    </SubScreen>
  );
}

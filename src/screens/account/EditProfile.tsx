import { useState } from "react";
import { useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "./ProfileHub";

/** Screen 26 — Edit profile & prompts. */
export function EditProfile() {
  const user = useIsoStore((s) => s.user);
  const toast = useIsoStore((s) => s.toast);
  const [answers, setAnswers] = useState(user.prompts.map((p) => p.answer));

  const save = () => {
    useIsoStore.setState((s) => ({
      user: {
        ...s.user,
        prompts: s.user.prompts.map((p, i) => ({ ...p, answer: answers[i] })),
      },
    }));
    toast("Saved — your next ice-breaker comes from these.");
  };

  return (
    <SubScreen title="Edit profile">
      <div className="flex gap-2.5">
        {["🙂", "+", "+"].map((c, i) => (
          <div
            key={i}
            className="flex-1 h-[76px] rounded-card border-2 border-dashed flex items-center justify-center text-[22px]"
            style={{ borderColor: "rgba(107,74,42,0.3)", color: "var(--iso-text-3)", background: i === 0 ? "var(--iso-accent-tint)" : "transparent" }}
          >
            {c}
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-ink3 mt-2">
        A few photos is plenty — the conversation is the profile here.
      </p>

      <div className="flex flex-col gap-2.5 mt-4">
        <input className="input" defaultValue={user.firstName} />
        <input className="input" defaultValue={String(user.age)} inputMode="numeric" />
        {user.prompts.map((p, i) => (
          <div key={p.label} className="card p-3.5">
            <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--iso-accent)" }}>
              {p.label}
            </span>
            <textarea
              className="input !border-none !p-0 !rounded-none mt-1 resize-none text-[13.5px]"
              rows={2}
              value={answers[i]}
              onChange={(e) => setAnswers((cur) => cur.map((a, j) => (j === i ? e.target.value : a)))}
            />
          </div>
        ))}
        <button className="btn btn-pri mt-1" onClick={save}>
          Save
        </button>
      </div>
    </SubScreen>
  );
}

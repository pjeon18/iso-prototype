import { useState } from "react";
import { BigSlider } from "../../components/Slider";
import { Icon } from "../../components/icons";
import { photoFill } from "../onboarding/Onboarding";
import { useIsoStore } from "../../store/useIsoStore";
import { SubScreen } from "./ProfileHub";

const SOCIAL_META: Record<string, { name: string; mono: string; tone: string }> = {
  instagram: { name: "Instagram", mono: "Ig", tone: "#C13584" },
  spotify: { name: "Spotify", mono: "Sp", tone: "#1DB954" },
  beli: { name: "Beli", mono: "Be", tone: "#E4572E" },
  linkedin: { name: "LinkedIn", mono: "Li", tone: "#0A66C2" },
  letterboxd: { name: "Letterboxd", mono: "Lb", tone: "#445566" },
};

const ftIn = (cm: number) => {
  const t = Math.round(cm / 2.54);
  return `${Math.floor(t / 12)}'${t % 12}"`;
};

/** Screen 26 — the profile itself: 3×3 photo grid, basics, prompts, socials. */
export function EditProfile() {
  const user = useIsoStore((s) => s.user);
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);
  const toast = useIsoStore((s) => s.toast);
  const [answers, setAnswers] = useState(user.prompts.map((p) => p.answer));
  const [sel, setSel] = useState<number | null>(null);

  const setPhoto = (id: number, patch: Partial<(typeof profile.photos)[0]>) =>
    updateProfile({ photos: profile.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  const savePrompts = () => {
    useIsoStore.setState((s) => ({
      user: { ...s.user, prompts: s.user.prompts.map((p, i) => ({ ...p, answer: answers[i] })) },
    }));
    toast("Saved — your next ice-breaker comes from these.");
  };

  return (
    <SubScreen title="Your profile">
      {/* the 3×3 grid — photos with captions, like the best of a camera roll */}
      <p className="text-[12px] font-semibold text-ink2 mb-1.5">Your grid</p>
      <div className="grid grid-cols-3 gap-1.5">
        {profile.photos.map((p) => (
          <button
            key={p.id}
            className="relative border-none cursor-pointer p-0 overflow-hidden"
            style={{
              aspectRatio: "1",
              borderRadius: 10,
              background: p.filled ? photoFill(p.hue) : "rgba(248,189,98,0.16)",
              outline: sel === p.id ? "2.5px solid var(--iso-accent)" : p.filled ? "none" : "1.5px dashed rgba(107,74,42,0.28)",
              outlineOffset: -2,
            }}
            onClick={() => {
              if (!p.filled) setPhoto(p.id, { filled: true });
              setSel(sel === p.id ? null : p.id);
            }}
          >
            {!p.filled && (
              <span className="text-[22px] font-display" style={{ color: "rgba(107,74,42,0.5)" }}>
                +
              </span>
            )}
            {p.filled && p.caption && (
              <span
                className="absolute left-0 right-0 bottom-0 px-1.5 py-1 text-left text-[8px] leading-tight text-white truncate"
                style={{ background: "linear-gradient(transparent, rgba(58,36,16,0.65))" }}
              >
                {p.caption}
              </span>
            )}
          </button>
        ))}
      </div>
      {sel !== null && profile.photos[sel].filled && (
        <div className="card p-3 mt-2">
          <input
            className="input !py-2.5"
            placeholder="Caption this photo"
            value={profile.photos[sel].caption}
            onChange={(e) => setPhoto(sel, { caption: e.target.value })}
            maxLength={60}
          />
          <button
            className="border-none bg-transparent cursor-pointer text-[11.5px] mt-2 p-0 underline"
            style={{ color: "var(--iso-text-3)" }}
            onClick={() => {
              setPhoto(sel, { filled: false, caption: "" });
              setSel(null);
            }}
          >
            Remove photo
          </button>
        </div>
      )}

      {/* basics */}
      <p className="text-[12px] font-semibold text-ink2 mt-5 mb-1.5">Basics</p>
      <div className="card p-4 flex flex-col gap-2 text-[13.5px] text-ink2">
        <div className="flex justify-between">
          <span>{user.firstName} · {profile.gender}</span>
          <span className="font-semibold text-ink">{profile.age} · {ftIn(profile.heightCm)}</span>
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-ink3">
          <Icon name="pin" size={15} /> {profile.location}
          {profile.hometown && <span>· from {profile.hometown}</span>}
        </div>
        {profile.work && <div className="text-[12.5px] text-ink3">{profile.work}</div>}
      </div>
      <div className="card p-4 mt-2">
        <BigSlider label="Age" min={18} max={35} value={profile.age} onChange={(v) => updateProfile({ age: v })} />
      </div>

      {/* interests */}
      {profile.interests.length > 0 && (
        <>
          <p className="text-[12px] font-semibold text-ink2 mt-5 mb-1.5">Interests</p>
          <div className="flex gap-1.5 flex-wrap">
            {profile.interests.map((i) => (
              <span key={i} className="chip chip-on !cursor-default">{i}</span>
            ))}
          </div>
        </>
      )}

      {/* connected apps */}
      <p className="text-[12px] font-semibold text-ink2 mt-5 mb-1.5">Connected</p>
      {profile.socials.length === 0 ? (
        <p className="text-[12px] text-ink3">
          Nothing connected — add Instagram, Spotify, Beli and more during
          onboarding, or tap below.
        </p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {profile.socials.map((id) => {
            const m = SOCIAL_META[id];
            if (!m) return null;
            return (
              <span key={id} className="card !rounded-pill px-3 py-1.5 flex items-center gap-2 text-[12px] font-semibold text-ink2">
                <span
                  className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[9px] font-display font-bold text-white"
                  style={{ background: m.tone }}
                >
                  {m.mono}
                </span>
                {m.name}
              </span>
            );
          })}
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap mt-2">
        {Object.entries(SOCIAL_META)
          .filter(([id]) => !profile.socials.includes(id))
          .map(([id, m]) => (
            <button
              key={id}
              className="chip"
              onClick={() => updateProfile({ socials: [...profile.socials, id] })}
            >
              + {m.name}
            </button>
          ))}
      </div>

      {/* prompts */}
      <p className="text-[12px] font-semibold text-ink2 mt-5 mb-1.5">Prompts</p>
      <div className="flex flex-col gap-2.5">
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
        <button className="btn btn-pri mt-1 mb-4" onClick={savePrompts}>
          Save
        </button>
      </div>
    </SubScreen>
  );
}

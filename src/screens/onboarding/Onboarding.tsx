import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { BigSlider, RangeSlider } from "../../components/Slider";
import { Icon } from "../../components/icons";
import { springs } from "../../lib/motion";
import { currentUser } from "../../data/seedData";
import { useIsoStore } from "../../store/useIsoStore";

/**
 * Screens 02–08+ — onboarding. Verification is UI-only and always succeeds
 * after a beat (build spec §4.4). The profile section is Hinge/Tinder-grade:
 * real basics, a 3×3 photo grid with captions, interests, socials — and every
 * numeric input is a slider with the number displayed big.
 */

const STEPS = [
  "signup", "edu", "photo", "basics", "photos", "interests", "prompts", "socials", "prefs", "perms",
] as const;
type Step = (typeof STEPS)[number];

export function Onboarding() {
  const [step, setStep] = useState<Step>("signup");
  const reduced = useReducedMotion();
  const idx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)]);

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col bg-cream">
      <StatusBar right={`${idx + 1}/${STEPS.length}`} />
      <div className="px-6 pt-1 flex-none">
        <div className="h-1 rounded-pill overflow-hidden" style={{ background: "rgba(248,189,98,0.3)" }}>
          <motion.div
            className="h-full rounded-pill"
            style={{ background: "var(--iso-accent)" }}
            animate={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
      {/* forward through a sequence slides LEFT (motion brief §5), unhurried */}
      <motion.div
        key={step}
        className="flex-1 min-h-0 flex flex-col"
        initial={reduced ? { opacity: 0 } : { opacity: 0.15, x: "50%" }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduced ? { duration: 0.22 } : springs.calm}
      >
        {step === "signup" && <SignUp onNext={next} />}
        {step === "edu" && <EduVerify onNext={next} />}
        {step === "photo" && <PhotoVerify onNext={next} />}
        {step === "basics" && <Basics onNext={next} />}
        {step === "photos" && <PhotoGrid onNext={next} />}
        {step === "interests" && <Interests onNext={next} />}
        {step === "prompts" && <Prompts onNext={next} />}
        {step === "socials" && <Socials onNext={next} />}
        {step === "prefs" && <Prefs onNext={next} />}
        {step === "perms" && <Perms />}
      </motion.div>
    </div>
  );
}

function Frame({
  title,
  caption,
  children,
  cta,
  onCta,
  ctaDisabled,
  skippable,
}: {
  title: string;
  caption?: string;
  children?: React.ReactNode;
  cta: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  skippable?: boolean;
}) {
  const stage = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col px-6 pt-5">
      <motion.div {...stage(0.25)}>
        <h2 className="font-display font-semibold text-[22px] text-ink">{title}</h2>
        {caption && <p className="text-[13px] mt-1.5 text-ink3 leading-relaxed">{caption}</p>}
      </motion.div>
      <motion.div className="flex-1 min-h-0 scroll-y mt-5 flex flex-col gap-3 pb-2" {...stage(0.5)}>
        {children}
      </motion.div>
      <motion.div className="pb-8 pt-3 flex-none" {...stage(0.75)}>
        <button className="btn btn-pri" disabled={ctaDisabled} onClick={onCta}>
          {cta}
        </button>
        {skippable && (
          <button className="btn btn-ghost !py-2 !text-[12.5px] mt-1" onClick={onCta}>
            skip for now
          </button>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ 02 */
function SignUp({ onNext }: { onNext: () => void }) {
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const sendCode = () => {
    if (!contact.trim()) return;
    setSent(true);
    window.setTimeout(() => setCode("482 913"), 900);
  };

  return (
    <Frame
      title="Create your account"
      caption="We'll text you a code to verify it's really you."
      cta="Continue"
      ctaDisabled={!sent || !code}
      onCta={onNext}
    >
      <input className="input" placeholder="Phone or email" value={contact} onChange={(e) => setContact(e.target.value)} />
      {!sent ? (
        <button className="btn btn-sec !py-3" disabled={!contact.trim()} onClick={sendCode}>
          Text me a code
        </button>
      ) : (
        <>
          <input
            className="input tracking-[0.3em] text-center"
            placeholder="· · · · · ·"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <p className="text-[11.5px] text-center" style={{ color: "var(--iso-green)" }}>
            {code ? "Code verified" : "Code sent — check your messages"}
          </p>
        </>
      )}
      <p className="text-[10.5px] text-ink3 mt-auto text-center">
        By continuing you agree to ISO's Terms & Privacy Policy.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 03 */
function EduVerify({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const isEdu = /\.edu$/i.test(email.trim());

  const sendCode = () => {
    if (!isEdu) return;
    setSent(true);
    window.setTimeout(() => setCode("204 771"), 900);
  };

  return (
    <Frame
      title="Verify you're a real student"
      caption="A small, trusted room — everyone here is verified."
      cta="Verify"
      ctaDisabled={!sent || !code}
      onCta={onNext}
    >
      <div className="relative">
        <input className="input" placeholder="name@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        {isEdu && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <Icon name="check" size={17} color="var(--iso-green)" strokeWidth={2.4} />
          </span>
        )}
      </div>
      {email && !isEdu && (
        <p className="text-[11.5px]" style={{ color: "#B05B2C" }}>
          Only .edu addresses work here — that's what keeps the room trusted.
        </p>
      )}
      {!sent ? (
        <button className="btn btn-sec !py-3" disabled={!isEdu} onClick={sendCode}>
          Send my 6-digit code
        </button>
      ) : (
        <input
          className="input tracking-[0.3em] text-center"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      )}
      <div className="card p-3.5 text-[12px] text-ink2 leading-relaxed flex gap-2.5">
        <Icon name="shield" size={19} color="var(--iso-accent)" />
        <span>
          <b>.edu domains only.</b> It bounds the trust circle to your campus
          community — verification is why nobody here is a bot or a catfish.
        </span>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 04 */
function PhotoVerify({ onNext }: { onNext: () => void }) {
  const [state, setState] = useState<"idle" | "checking" | "done">("idle");

  const capture = () => {
    setState("checking");
    window.setTimeout(() => setState("done"), 1400);
  };

  return (
    <Frame
      title="Photo verification"
      caption="Match the pose to prove it's you — this keeps catfish out."
      cta={state === "done" ? "Continue" : "Take selfie"}
      ctaDisabled={state === "checking"}
      onCta={state === "done" ? onNext : capture}
    >
      <div className="flex flex-col items-center mt-2">
        <div
          className="w-[150px] h-[184px] rounded-card-lg flex flex-col items-center justify-center border-2 border-dashed"
          style={{ borderColor: "rgba(107,74,42,0.35)", background: "var(--iso-surface)" }}
        >
          {state === "idle" && <Icon name="camera" size={40} color="var(--iso-text-3)" />}
          {state === "checking" && (
            <>
              <div
                className="w-9 h-9 rounded-full border-[3.5px] ring-spin"
                style={{ borderColor: "rgba(248,189,98,0.4)", borderTopColor: "var(--iso-accent)" }}
              />
              <span className="text-[11.5px] text-ink3 mt-3">checking liveness…</span>
            </>
          )}
          {state === "done" && (
            <>
              <Icon name="check" size={40} color="var(--iso-green)" strokeWidth={2.6} />
              <span className="text-[12px] mt-2 font-semibold" style={{ color: "var(--iso-green)" }}>
                You're verified
              </span>
            </>
          )}
        </div>
        <p className="text-[11.5px] text-ink3 mt-4 text-center max-w-[240px]">
          Private — used only to verify you. Never shown on your profile, never
          shared.
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 05 · basics */
const GENDERS = ["Woman", "Man", "Non-binary"];
const ftIn = (cm: number) => {
  const t = Math.round(cm / 2.54);
  return `${Math.floor(t / 12)}'${t % 12}"`;
};

function Basics({ onNext }: { onNext: () => void }) {
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);
  const [name, setName] = useState(currentUser.firstName);
  const [customGender, setCustomGender] = useState(
    GENDERS.includes(profile.gender) ? "" : profile.gender,
  );
  const [writingOwn, setWritingOwn] = useState(!GENDERS.includes(profile.gender));

  return (
    <Frame
      title="The basics"
      caption="The stuff a good first conversation is built on."
      cta="Next"
      ctaDisabled={!name.trim()}
      onCta={onNext}
    >
      <input className="input" placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="card p-4">
        <BigSlider label="Age" min={18} max={35} value={profile.age} onChange={(v) => updateProfile({ age: v })} />
      </div>

      <div className="card p-4">
        <p className="text-[12px] font-semibold text-ink2 mb-2">Gender</p>
        <div className="flex gap-1.5 flex-wrap">
          {GENDERS.map((g) => (
            <button
              key={g}
              className={`chip ${profile.gender === g && !writingOwn ? "chip-on" : ""}`}
              onClick={() => {
                setWritingOwn(false);
                updateProfile({ gender: g });
              }}
            >
              {g}
            </button>
          ))}
          <button className={`chip ${writingOwn ? "chip-on" : ""}`} onClick={() => setWritingOwn(true)}>
            Write my own
          </button>
        </div>
        {writingOwn && (
          <input
            className="input mt-2.5"
            placeholder="In your words"
            value={customGender}
            onChange={(e) => {
              setCustomGender(e.target.value);
              updateProfile({ gender: e.target.value || "Non-binary" });
            }}
          />
        )}
      </div>

      <div className="card p-4">
        <BigSlider
          label="Height"
          min={147}
          max={210}
          value={profile.heightCm}
          onChange={(v) => updateProfile({ heightCm: v })}
          format={ftIn}
        />
      </div>

      <div className="card p-4 flex items-center gap-3">
        <Icon name="pin" size={20} color="var(--iso-accent)" />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-ink2">Where you are</p>
          <input
            className="input !border-none !p-0 !rounded-none mt-0.5 text-[14px]"
            value={profile.location}
            onChange={(e) => updateProfile({ location: e.target.value })}
          />
        </div>
      </div>
      <input
        className="input"
        placeholder="Hometown (optional — great small talk)"
        value={profile.hometown}
        onChange={(e) => updateProfile({ hometown: e.target.value })}
      />
      <input
        className="input"
        placeholder="What you do (school, work, both)"
        value={profile.work}
        onChange={(e) => updateProfile({ work: e.target.value })}
      />
    </Frame>
  );
}

/* ------------------------------------------------------------------ 06 · photos (3×3) */
const SLOT_HINTS = [
  "your opener — the real you",
  "mid-laugh, not mid-pose",
  "doing the thing you love",
  "with people (say who)",
  "golden hour never misses",
  "the hobby shot",
  "somewhere you'd take them",
  "your proudest plate or project",
  "one wildcard",
];

export function photoFill(hue: number) {
  return `linear-gradient(150deg, hsl(${hue} 90% 78%), hsl(${hue + 18} 82% 60%))`;
}

function PhotoGrid({ onNext }: { onNext: () => void }) {
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);
  const [sel, setSel] = useState<number | null>(null);
  const filled = profile.photos.filter((p) => p.filled).length;

  const setPhoto = (id: number, patch: Partial<(typeof profile.photos)[0]>) =>
    updateProfile({ photos: profile.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  return (
    <Frame
      title="Nine photos, your grid"
      caption="They'll show on your profile as a 3×3 — like the best version of your camera roll. Captions make them conversation bait. Add at least three."
      cta={`Next${filled < 3 ? ` — ${3 - filled} more to go` : ""}`}
      ctaDisabled={filled < 3}
      onCta={onNext}
    >
      <div className="grid grid-cols-3 gap-1.5">
        {profile.photos.map((p) => (
          <button
            key={p.id}
            className="relative border-none cursor-pointer p-0 overflow-hidden"
            style={{
              aspectRatio: "1",
              borderRadius: 10,
              background: p.filled ? photoFill(p.hue) : "rgba(248,189,98,0.16)",
              outline: sel === p.id ? "2.5px solid var(--iso-accent)" : "1.5px dashed rgba(107,74,42,0.28)",
              outlineOffset: -2,
            }}
            onClick={() => {
              if (!p.filled) setPhoto(p.id, { filled: true });
              setSel(p.id);
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
        <div className="card p-3.5">
          <p className="text-[11px] text-ink3 mb-1.5">
            Slot {sel + 1} · <i>{SLOT_HINTS[sel]}</i>
          </p>
          <input
            className="input !py-2.5"
            placeholder="Caption it — where, when, or why it matters"
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
            Remove this photo
          </button>
        </div>
      )}
      <p className="text-[11px] text-ink3 text-center">
        {filled}/9 added — photos are simulated in this prototype.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 07 · interests */
const INTERESTS = [
  "live music", "hiking", "film photography", "cooking", "basketball", "reading",
  "thrifting", "coffee crawls", "climbing", "poetry", "running", "jazz",
  "board games", "museums", "street food", "road trips", "pottery", "pickup soccer",
];

function Interests({ onNext }: { onNext: () => void }) {
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);
  const picked = profile.interests;

  const toggle = (i: string) =>
    updateProfile({
      interests: picked.includes(i) ? picked.filter((x) => x !== i) : picked.length < 7 ? [...picked, i] : picked,
    });

  return (
    <Frame
      title="What fills your weekends?"
      caption="Pick 3–7. These seed better first questions than any bio."
      cta={picked.length < 3 ? `Pick ${3 - picked.length} more` : "Next"}
      ctaDisabled={picked.length < 3}
      onCta={onNext}
    >
      <div className="flex gap-1.5 flex-wrap">
        {INTERESTS.map((i) => (
          <button key={i} className={`chip ${picked.includes(i) ? "chip-on" : ""}`} onClick={() => toggle(i)}>
            {i}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-ink3 text-center mt-1">{picked.length}/7 picked</p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 08 · prompts */
const PROMPT_POOL = [
  "Ideal first conversation",
  "The fastest way to my heart",
  "A hill I'll die on",
  "My most irrational fear",
  "Green flags I look for",
  "My Sunday reset looks like",
  "Two truths and a lie",
  "I'm weirdly competitive about",
  "The last thing that made me laugh out loud",
];

function Prompts({ onNext }: { onNext: () => void }) {
  const user = useIsoStore((s) => s.user);
  const [cards, setCards] = useState(
    user.prompts.map((p) => ({ label: p.label, answer: p.answer })),
  );

  const shuffle = (i: number) => {
    const used = cards.map((c) => c.label);
    const pool = PROMPT_POOL.filter((l) => !used.includes(l));
    const nextLabel = pool[Math.floor(Math.random() * pool.length)];
    setCards((cur) => cur.map((c, j) => (j === i ? { label: nextLabel, answer: "" } : c)));
  };

  const save = () => {
    useIsoStore.setState((s) => ({
      user: { ...s.user, prompts: cards.map((c) => ({ label: c.label, answer: c.answer })) },
    }));
    onNext();
  };

  return (
    <Frame
      title="Three prompts, real answers"
      caption="Not a résumé — talking points. Your first ice-breaker comes from these. Tap “swap” until one feels like you."
      cta="Next"
      ctaDisabled={cards.some((c) => !c.answer.trim())}
      onCta={save}
    >
      {cards.map((c, i) => (
        <div key={i} className="card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--iso-accent)" }}>
              {c.label}
            </span>
            <button
              className="border-none bg-transparent cursor-pointer text-[11px] underline p-0"
              style={{ color: "var(--iso-text-3)" }}
              onClick={() => shuffle(i)}
            >
              swap
            </button>
          </div>
          <textarea
            className="input !border-none !p-0 !rounded-none mt-1 resize-none text-[13.5px]"
            rows={2}
            placeholder="Say it like you'd text it"
            value={c.answer}
            onChange={(e) => setCards((cur) => cur.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
          />
        </div>
      ))}
    </Frame>
  );
}

/* ------------------------------------------------------------------ 09 · socials */
const SOCIALS = [
  { id: "instagram", name: "Instagram", mono: "Ig", blurb: "a peek at your grid", tone: "#C13584" },
  { id: "spotify", name: "Spotify", mono: "Sp", blurb: "your on-repeat, on display", tone: "#1DB954" },
  { id: "beli", name: "Beli", mono: "Be", blurb: "your restaurant taste says a lot", tone: "#E4572E" },
  { id: "linkedin", name: "LinkedIn", mono: "Li", blurb: "for the ambitious-is-attractive crowd", tone: "#0A66C2" },
  { id: "letterboxd", name: "Letterboxd", mono: "Lb", blurb: "four favorites, zero small talk", tone: "#456" },
];

function Socials({ onNext }: { onNext: () => void }) {
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);

  const toggle = (id: string) =>
    updateProfile({
      socials: profile.socials.includes(id)
        ? profile.socials.filter((x) => x !== id)
        : [...profile.socials, id],
    });

  return (
    <Frame
      title="Bring your corners of the internet"
      caption="Optional. Connected apps show as small cards on your profile — more texture, better first questions. (Stubbed in this prototype.)"
      cta="Next"
      onCta={onNext}
      skippable
    >
      {SOCIALS.map((s) => {
        const on = profile.socials.includes(s.id);
        return (
          <div key={s.id} className="card p-3.5 flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-display font-bold text-[13px] text-white flex-none"
              style={{ background: s.tone }}
            >
              {s.mono}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink">{s.name}</p>
              <p className="text-[11.5px] text-ink3">{s.blurb}</p>
            </div>
            <button
              className={`border rounded-pill px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer ${
                on ? "text-white border-transparent" : "bg-transparent text-ink2"
              }`}
              style={{
                background: on ? "var(--iso-accent)" : "transparent",
                borderColor: on ? "transparent" : "rgba(107,74,42,0.3)",
              }}
              onClick={() => toggle(s.id)}
            >
              {on ? "Connected" : "Connect"}
            </button>
          </div>
        );
      })}
    </Frame>
  );
}

/* ------------------------------------------------------------------ 10 · preferences (sliders) */
function Prefs({ onNext }: { onNext: () => void }) {
  const profile = useIsoStore((s) => s.profile);
  const updateProfile = useIsoStore((s) => s.updateProfile);
  const [interest, setInterest] = useState("Everyone");

  return (
    <Frame
      title="Who should we match you with?"
      caption="The matcher only pairs people who are compatible — and both present."
      cta="Next"
      onCta={onNext}
    >
      <div className="card p-4">
        <p className="text-[12px] font-semibold text-ink2 mb-2">Interested in</p>
        <div className="flex gap-1.5 flex-wrap">
          {["Women", "Men", "Everyone"].map((o) => (
            <button key={o} className={`chip ${interest === o ? "chip-on" : ""}`} onClick={() => setInterest(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <RangeSlider
          label="Age range"
          min={18}
          max={40}
          lo={profile.ageRange[0]}
          hi={profile.ageRange[1]}
          onChange={(lo, hi) => updateProfile({ ageRange: [lo, hi] })}
        />
      </div>

      <div className="card p-4">
        <BigSlider
          label="How far is too far?"
          min={1}
          max={50}
          value={profile.distanceMi}
          onChange={(v) => updateProfile({ distanceMi: v })}
          unit="mi"
        />
        <p className="text-[11px] text-ink3 mt-1">
          {profile.distanceMi <= 2
            ? "campus only — you'll probably know their dining hall"
            : profile.distanceMi <= 12
              ? "your side of the city"
              : "the whole metro — worth the bus ride"}
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ 11 · permissions */
function Perms() {
  const navigate = useNavigate();
  const completeOnboarding = useIsoStore((s) => s.completeOnboarding);
  const [loc, setLoc] = useState(false);
  const [notif, setNotif] = useState(false);

  return (
    <Frame
      title="Allow a few things"
      caption="Both are about presence — the thing that makes ISO work."
      cta="Finish — you're in"
      onCta={() => {
        completeOnboarding();
        navigate("/queue", { replace: true });
      }}
    >
      <PermCard
        icon="pin"
        title="Location"
        body="To match you with people actually near your campus."
        on={loc}
        toggle={() => setLoc((v) => !v)}
      />
      <PermCard
        icon="bell"
        title="Notifications"
        body="So you know the moment a match is live — they're only here now."
        on={notif}
        toggle={() => setNotif((v) => !v)}
      />
      {!notif && (
        <p className="text-[11.5px] leading-relaxed" style={{ color: "#B05B2C" }}>
          Heads up: without notifications you'll miss live matches — there's no
          inbox to catch up on later. That's by design.
        </p>
      )}
    </Frame>
  );
}

function PermCard({
  icon,
  title,
  body,
  on,
  toggle,
}: {
  icon: "pin" | "bell";
  title: string;
  body: string;
  on: boolean;
  toggle: () => void;
}) {
  return (
    <button className="card p-4 flex items-center gap-3 text-left cursor-pointer w-full border-none" onClick={toggle}>
      <Icon name={icon} size={22} color="var(--iso-accent)" />
      <span className="flex-1">
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        <span className="block text-[12px] text-ink3 mt-0.5">{body}</span>
      </span>
      <span
        className="w-11 rounded-pill relative flex-none transition-colors"
        style={{ background: on ? "var(--iso-green)" : "rgba(107,74,42,0.25)", height: 26 }}
      >
        <span
          className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: on ? 22 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
        />
      </span>
    </button>
  );
}

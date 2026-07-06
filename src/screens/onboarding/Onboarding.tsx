import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBar } from "../../components/PhoneFrame";
import { springs } from "../../lib/motion";
import { currentUser } from "../../data/seedData";
import { useIsoStore } from "../../store/useIsoStore";

/**
 * Screens 02–08 — onboarding. Verification is UI-only and always succeeds
 * after a beat (build spec §4.4), with the PRD's real copy and rationale.
 */

const STEPS = ["signup", "edu", "photo", "basics", "prompts", "prefs", "perms"] as const;
type Step = (typeof STEPS)[number];

export function Onboarding() {
  const [step, setStep] = useState<Step>("signup");
  const reduced = useReducedMotion();
  const idx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)]);

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col bg-cream">
      <StatusBar right={`${idx + 1}/7`} />
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
      {/* forward through a sequence slides LEFT (motion brief §5), unhurried —
          each step is a new question, not a form to race through. Keyed remount
          with entrance-only motion — never gate a step change on an exit finishing */}
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
          {step === "prompts" && <Prompts onNext={next} />}
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
}: {
  title: string;
  caption?: string;
  children?: React.ReactNode;
  cta: string;
  onCta: () => void;
  ctaDisabled?: boolean;
}) {
  // the step slides in, then its content settles in reading order:
  // question first, the fields a breath later, the button last
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
      <motion.div className="flex-1 min-h-0 scroll-y mt-5 flex flex-col gap-3" {...stage(0.5)}>
        {children}
      </motion.div>
      <motion.div className="pb-8 pt-3 flex-none" {...stage(0.75)}>
        <button className="btn btn-pri" disabled={ctaDisabled} onClick={onCta}>
          {cta}
        </button>
      </motion.div>
    </div>
  );
}

/** 02 — Sign up (phone/email + OTP, stub-succeeds). */
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
      <input
        className="input"
        placeholder="Phone or email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
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
            {code ? "Code verified ✓" : "Code sent — check your messages"}
          </p>
        </>
      )}
      <p className="text-[10.5px] text-ink3 mt-auto text-center">
        By continuing you agree to ISO's Terms & Privacy Policy.
      </p>
    </Frame>
  );
}

/** 03 — .edu verification with the trust rationale inline. */
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
        <input
          className="input"
          placeholder="name@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isEdu && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--iso-green)" }}>
            ✓
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
      <div className="card p-3.5 text-[12px] text-ink2 leading-relaxed">
        🎓 <b>.edu domains only.</b> It bounds the trust circle to your campus
        community — verification is why nobody here is a bot or a catfish.
      </div>
    </Frame>
  );
}

/** 04 — Photo / liveness (pose-matched selfie, stub). */
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
          {state === "idle" && <span className="text-[38px]">🤳</span>}
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
              <span className="text-[38px]">✅</span>
              <span className="text-[12px] mt-2 font-semibold" style={{ color: "var(--iso-green)" }}>
                You're verified
              </span>
            </>
          )}
        </div>
        <p className="text-[11.5px] text-ink3 mt-4 text-center max-w-[240px]">
          🔒 Private — used only to verify you. Never shown on your profile,
          never shared.
        </p>
      </div>
    </Frame>
  );
}

/** 05 — Profile basics: deliberately lighter than incumbents. */
function Basics({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState(currentUser.firstName);
  const [age, setAge] = useState(String(currentUser.age));

  return (
    <Frame
      title="The basics"
      caption="Lighter than the other apps on purpose — the conversation is the profile."
      cta="Next"
      ctaDisabled={!name.trim() || !age.trim()}
      onCta={onNext}
    >
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
      <input className="input" placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input" placeholder="Age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
      <select className="input" defaultValue="nonbinary">
        <option value="woman">Woman</option>
        <option value="man">Man</option>
        <option value="nonbinary">Non-binary</option>
        <option value="other">Prefer to self-describe</option>
      </select>
    </Frame>
  );
}

/** 06 — Prompts: talking points, not a résumé. They seed the ice-breaker. */
function Prompts({ onNext }: { onNext: () => void }) {
  const [answers, setAnswers] = useState(currentUser.prompts.map((p) => p.answer));
  return (
    <Frame
      title="A few prompts"
      caption="Not a résumé — talking points. Your first ice-breaker comes from these."
      cta="Next"
      ctaDisabled={answers.some((a) => !a.trim())}
      onCta={onNext}
    >
      {currentUser.prompts.map((p, i) => (
        <div key={p.label} className="card p-3.5">
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--iso-accent)" }}>
            {p.label}
          </span>
          <textarea
            className="input !border-none !p-0 !rounded-none mt-1 resize-none text-[13.5px]"
            rows={2}
            value={answers[i]}
            onChange={(e) =>
              setAnswers((cur) => cur.map((a, j) => (j === i ? e.target.value : a)))
            }
          />
        </div>
      ))}
    </Frame>
  );
}

/** 07 — Preferences: chips feeding the matcher. */
function Prefs({ onNext }: { onNext: () => void }) {
  const [interest, setInterest] = useState("Everyone");
  const [ages, setAges] = useState("19–25");
  const [dist, setDist] = useState("My campus");

  const Row = ({
    label,
    opts,
    val,
    set,
  }: {
    label: string;
    opts: string[];
    val: string;
    set: (v: string) => void;
  }) => (
    <div>
      <p className="text-[12px] font-semibold text-ink2 mb-1.5">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        {opts.map((o) => (
          <button key={o} className={`chip ${val === o ? "chip-on" : ""}`} onClick={() => set(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Frame
      title="Who should we match you with?"
      caption="The matcher only pairs people who are compatible — and both present."
      cta="Next"
      onCta={onNext}
    >
      <Row label="Interested in" opts={["Women", "Men", "Everyone"]} val={interest} set={setInterest} />
      <Row label="Age range" opts={["18–22", "19–25", "21–26", "24–30"]} val={ages} set={setAges} />
      <Row label="Distance" opts={["My campus", "≤ 10 mi", "My city"]} val={dist} set={setDist} />
    </Frame>
  );
}

/** 08 — Permissions with plain-language rationale. */
function Perms() {
  const navigate = useNavigate();
  const completeOnboarding = useIsoStore((s) => s.completeOnboarding);
  const [loc, setLoc] = useState(false);
  const [notif, setNotif] = useState(false);

  return (
    <Frame
      title="Allow a few things"
      caption="Both are about presence — the thing that makes ISO work."
      cta="Finish — you're in →"
      onCta={() => {
        completeOnboarding();
        navigate("/queue", { replace: true });
      }}
    >
      <PermCard
        icon="📍"
        title="Location"
        body="To match you with people actually near your campus."
        on={loc}
        toggle={() => setLoc((v) => !v)}
      />
      <PermCard
        icon="🔔"
        title="Notifications"
        body="So you know the moment a match is live — they're only here now."
        on={notif}
        toggle={() => setNotif((v) => !v)}
      />
      {!notif && (
        <p className="text-[11.5px] leading-relaxed" style={{ color: "#B05B2C" }}>
          Heads up: without notifications you'll miss live matches — there's
          no inbox to catch up on later. That's by design.
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
  icon: string;
  title: string;
  body: string;
  on: boolean;
  toggle: () => void;
}) {
  return (
    <button className="card p-4 flex items-center gap-3 text-left cursor-pointer w-full border-none" onClick={toggle}>
      <span className="text-[22px]">{icon}</span>
      <span className="flex-1">
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        <span className="block text-[12px] text-ink3 mt-0.5">{body}</span>
      </span>
      <span
        className="w-11 h-6.5 rounded-pill relative flex-none transition-colors"
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

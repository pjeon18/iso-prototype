/**
 * Builds slides/ISO_Product_Intro.pptx — a minimal product-introduction deck.
 * Usage: node slides/build-deck.cjs   (screenshots must exist in slides/shots/)
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

const A = (f) => path.join(__dirname, "assets", f);
const S = (f) => path.join(__dirname, "shots", f);

// brand
const INK = "3A2410";
const INK2 = "5A3418";
const INK3 = "6B4A2A";
const ACCENT = "FF8000";
const SOFT = "F8BD62";
const TINT = "FFE8C1";
const CREAM = "FFF9F0";
const GREEN = "1FA352"; // slightly deepened for slide contrast
const HEAD = "Arial";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 × 7.5
pres.author = "Paul Jeon";
pres.title = "ISO — one conversation at a time";

const PHONE_AR = 780 / 1688; // shot aspect (w/h)
const shadow = () => ({ type: "outer", color: "5A3418", blur: 14, offset: 5, angle: 90, opacity: 0.28 });

/** phone screenshot with a soft card shadow behind it */
function phone(slide, file, x, y, h, caption) {
  const w = h * PHONE_AR;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.09, fill: { color: "FFFFFF" }, line: { color: "E8DCC9", width: 1 }, shadow: shadow(),
  });
  slide.addImage({ path: S(file), x: x + 0.045, y: y + 0.045, w: w - 0.09, h: h - 0.09 });
  if (caption) {
    slide.addText(caption, {
      x: x - 0.55, y: y + h + 0.08, w: w + 1.1, h: 0.62, align: "center",
      fontFace: BODY, fontSize: 12.5, color: INK3, valign: "top",
    });
  }
  return w;
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.7, y: 0.5, w: 11.9, h: 0.85, fontFace: HEAD, fontSize: 33, bold: true,
    color: INK, charSpacing: -0.5, ...opts,
  });
}

const bullet = (text, opts = {}) => ({
  text, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 10, ...opts },
});

// ---------------------------------------------------------------- 1 · title
{
  const s = pres.addSlide();
  s.background = { path: A("bg-gradient.png") };
  s.addImage({ path: A("iso-mark-white.png"), x: 4.87, y: 1.7, w: 3.56, h: 2.05 });
  s.addText([
    { text: "its time for a ", options: { color: "FFFFFF" } },
    { text: "real", options: { color: "27E068", bold: true } },
    { text: " one-on-one.", options: { color: "FFFFFF" } },
  ], { x: 2.65, y: 4.0, w: 8, h: 0.6, align: "center", fontFace: HEAD, fontSize: 24, bold: true });
  s.addText("ISO — Intimate Setting Online · an interactive product prototype", {
    x: 2.65, y: 4.75, w: 8, h: 0.4, align: "center", fontFace: BODY, fontSize: 15, color: INK2,
  });
  s.addText("one conversation at a time", {
    x: 2.65, y: 6.75, w: 8, h: 0.35, align: "center", fontFace: BODY, fontSize: 12, italic: true, color: "FFFFFF",
  });
  s.addNotes("ISO is a dating app built around one enforced constraint: you can have exactly one live conversation at a time. This deck walks the product and the thinking.");
}

// ---------------------------------------------------------------- 2 · problem
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  title(s, "Dating apps monetize attention — not connection.");
  s.addText([
    bullet("Swipe economics reward infinite options: more matches, more boosts, more time in-app."),
    bullet("Users end up managing a roster of lukewarm “talking stages” — a part-time job nobody signed up for."),
    bullet("Ghosting is normalized. Everyone feels disposable. Burnout drives people off the apps entirely."),
    bullet("The incumbent business model can't fix this — optionality is the revenue.", { paraSpaceAfter: 0 }),
  ], { x: 0.75, y: 1.75, w: 6.1, h: 4.4, fontFace: BODY, fontSize: 17, color: INK2, valign: "top" });

  const stats = [
    ["79%", "of U.S. college students aren't on any dating app"],
    ["50%+", "of Gen Z feel burned out by dating apps — the highest of any age group"],
    ["~90%", "of Gen Z say they'd rather meet someone offline"],
  ];
  stats.forEach(([n, label], i) => {
    const y = 1.55 + i * 1.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 7.35, y, w: 5.2, h: 1.5, rectRadius: 0.12, fill: { color: CREAM }, line: { color: "EFE3D0", width: 1 }, shadow: shadow(),
    });
    s.addText(n, { x: 7.6, y: y + 0.18, w: 1.85, h: 1.14, fontFace: HEAD, fontSize: 40, bold: true, color: ACCENT, align: "left", valign: "middle", margin: 0 });
    s.addText(label, { x: 9.5, y: y + 0.18, w: 2.95, h: 1.14, fontFace: BODY, fontSize: 13, color: INK3, valign: "middle" });
  });
  s.addText("Sources: Axios · Forbes Health 2025 · Kinsey / DatingAdvice", {
    x: 7.35, y: 6.85, w: 5.2, h: 0.3, fontFace: BODY, fontSize: 9.5, color: "A98F70", align: "right",
  });
  s.addNotes("The category's symptoms — rosters, ghosting, burnout — are downstream of a business model that sells optionality. That's the opening.");
}

// ---------------------------------------------------------------- 3 · the idea
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  s.addText("One conversation at a time.", { x: 0.75, y: 1.15, w: 7.3, h: 0.8, fontFace: HEAD, fontSize: 40, bold: true, color: INK });
  s.addText("Enforced.", { x: 0.75, y: 1.95, w: 7.3, h: 0.8, fontFace: HEAD, fontSize: 40, bold: true, color: ACCENT });
  s.addText([
    bullet("Queue like joining a game. Get matched live with one present person. Talk in a real-time room."),
    bullet("It only continues if both of you say yes — otherwise it closes kindly and you're back in the queue."),
    bullet("Exclusivity is a mechanic, not a promise: with an active chat you literally cannot queue for another."),
    bullet("No inbox. No roster. No feed. Three tabs, forever.", { bold: true, color: INK }),
  ], { x: 0.78, y: 3.15, w: 7.1, h: 3.6, fontFace: BODY, fontSize: 17, color: INK2, valign: "top" });
  phone(s, "02-queue-home.png", 9.35, 0.7, 6.1);
  s.addNotes("The whole product in one sentence. The screenshot is the home screen: a live count and a single CTA — there is nothing to browse.");
}

// ---------------------------------------------------------------- 4 · the loop
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  title(s, "The loop: show up → meet → talk → decide together");
  const files = [
    ["03-searching.png", "Queue up — matched with someone who's here right now"],
    ["04-match-found.png", "One match, live — with a shared ice-breaker"],
    ["05-live-room.png", "A real-time room with a gentle reply timer"],
    ["07-keep-talking-mutual.png", "It continues only if you both say yes"],
  ];
  const h = 4.35, w = h * PHONE_AR, gap = 1.05;
  const total = 4 * w + 3 * gap;
  let x = (13.33 - total) / 2;
  files.forEach(([f, cap], i) => {
    phone(s, f, x, 1.7, h, cap);
    if (i < 3) {
      s.addText("→", { x: x + w + 0.14, y: 3.4, w: gap - 0.28, h: 0.7, align: "center", fontFace: HEAD, fontSize: 30, bold: true, color: SOFT, margin: 0 });
    }
    x += w + gap;
  });
  s.addNotes("Four screens, one loop. Liquidity is concentrated with prime-time queue windows on a single campus at launch.");
}

// ---------------------------------------------------------------- 5 · presence
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  phone(s, "05-live-room.png", 0.85, 0.65, 6.2);
  s.addText("Presence, not pressure", { x: 4.6, y: 0.75, w: 8, h: 0.75, fontFace: HEAD, fontSize: 33, bold: true, color: INK });
  const rows = [
    ["A shared ice-breaker", "Both people arrive holding the same opener — no “who talks first” freeze, no “hey.”"],
    ["A gentle reply timer", "A calm amber bar labeled “presence, not pressure.” At zero, nothing bad happens — just a soft “still there?”"],
    ["Silence is read kindly", "Only a second lapse suggests deciding: “seems like a natural pause.” Never a penalty, never an abrupt kill."],
    ["Either side can decide", "A quiet “feeling ready to decide?” link ends the ambiguity without an eject button."],
  ];
  rows.forEach(([h2, body], i) => {
    const y = 1.75 + i * 1.28;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.6, y, w: 8.0, h: 1.1, rectRadius: 0.1, fill: { color: i === 1 ? TINT : CREAM }, line: { color: "EFE3D0", width: 1 },
    });
    s.addText(h2, { x: 4.85, y: y + 0.12, w: 7.5, h: 0.34, fontFace: HEAD, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(body, { x: 4.85, y: y + 0.46, w: 7.55, h: 0.58, fontFace: BODY, fontSize: 12.5, color: INK3, margin: 0, valign: "top" });
  });
  s.addNotes("The timer was the riskiest design element — it must create presence without feeling like a countdown bomb. Zero-penalty expiry, second-lapse framing.");
}

// ---------------------------------------------------------------- 6 · the moment
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  title(s, "Nobody ever answers second.");
  phone(s, "06-keep-talking-ask.png", 7.0, 1.55, 5.15, "Answers stay sealed…");
  phone(s, "07-keep-talking-mutual.png", 10.15, 1.55, 5.15, "…and reveal together.");
  s.addText([
    bullet("When the conversation reaches a natural point, both people privately answer one question: keep talking?"),
    bullet("Answers are sealed until both have committed, then revealed simultaneously — nobody performs for the other's visible choice, nobody is rejected in public."),
    bullet("Mutual yes → it becomes your one ongoing chat, marked with a restrained green moment."),
    bullet("Anything else → “closed kindly, nothing left behind.” No dead thread. Back to the queue, one tap."),
  ], { x: 0.75, y: 1.75, w: 5.8, h: 4.6, fontFace: BODY, fontSize: 16.5, color: INK2, valign: "top" });
  s.addNotes("The scariest moment in any dating product is the decision. The simultaneous sealed reveal removes rejection asymmetry entirely.");
}

// ---------------------------------------------------------------- 7 · one chat + north star
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  title(s, "Then: one chat, your whole attention");
  s.addText([
    bullet("The Chat tab holds exactly one connection — full-screen attention on a single person is the product's whole competitive position, rendered literally."),
    bullet("Want someone new? You end this one first — visibly, deliberately, kindly. The lock is part of the interface."),
    bullet("ISO+ adds momentum tools inside the chat: song requests, photo-of-the-day, a date planner. All pointed off the app."),
  ], { x: 0.75, y: 1.7, w: 6.5, h: 2.9, fontFace: BODY, fontSize: 16.5, color: INK2, valign: "top" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.75, y: 4.85, w: 6.5, h: 1.85, rectRadius: 0.12, fill: { color: "EAF7EF" }, line: { color: "BFE5CD", width: 1 }, shadow: shadow(),
  });
  s.addText([
    { text: "The metric that matters: “Did you two meet up?”", options: { fontFace: HEAD, fontSize: 16, bold: true, color: GREEN, breakLine: true, paraSpaceAfter: 6 } },
    { text: "ISO's North Star is real-life dates initiated — asked once, privately, never nagged. We win when two people leave the app together.", options: { fontFace: BODY, fontSize: 13.5, color: INK2 } },
  ], { x: 1.05, y: 5.05, w: 5.9, h: 1.5, valign: "top" });
  phone(s, "08-one-chat.png", 9.4, 0.7, 6.1);
  s.addNotes("The outcome loop is self-reported and private. It's the truth signal for everything else — the trend, the recap, revival eligibility.");
}

// ---------------------------------------------------------------- 8 · journal not inbox
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  title(s, "Remember it — without rebuilding the roster");
  const cards = [
    ["10-memories.png", "Memories", "A read-only private journal of mutual conversations. No reply button exists. No unread counts. Wipe your side anytime."],
    ["11-trend-recap.png", "Your trend + weekly recap", "A gentle, floor-bounded curve of how conversations felt — direction, not scores. It can't crash, and it never ranks people."],
    ["12-revival.png", "Revival", "One private “I'd talk to them again” flag. Blind and double-opt-in: it only surfaces if both flagged, both free. Nobody can be re-rejected."],
  ];
  const h = 4.0, w = h * PHONE_AR, colW = 3.9, gap = 0.35;
  const total = 3 * colW + 2 * gap;
  let x = (13.33 - total) / 2;
  cards.forEach(([f, head, body]) => {
    phone(s, f, x + (colW - w) / 2, 1.6, h);
    s.addText(head, { x, y: 5.75, w: colW, h: 0.36, align: "center", fontFace: HEAD, fontSize: 15.5, bold: true, color: INK });
    s.addText(body, { x: x + 0.1, y: 6.12, w: colW - 0.2, h: 1.25, align: "center", fontFace: BODY, fontSize: 11.5, color: INK3, valign: "top" });
    x += colW + gap;
  });
  s.addNotes("Every reflective surface was designed so it structurally cannot become a roster: read-only, single-slot, blind, decaying.");
}

// ---------------------------------------------------------------- 9 · design language
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  title(s, "Designed like getting to know someone");
  const sw = [
    [ACCENT, "one confident\norange"], [SOFT, "warm amber\nambience"], [TINT, "cream\nsurfaces"], ["20C55E", "green =\nreal · mutual"], [INK, "warm brown\nink"],
  ];
  sw.forEach(([c, label], i) => {
    const x = 0.85 + i * 1.32;
    s.addShape(pres.shapes.OVAL, { x, y: 1.75, w: 0.82, h: 0.82, fill: { color: c }, line: { color: "EFE3D0", width: 1 } });
    s.addText(label, { x: x - 0.25, y: 2.66, w: 1.32, h: 0.62, align: "center", fontFace: BODY, fontSize: 9.5, color: INK3, valign: "top" });
  });
  s.addText([
    bullet("Loud thresholds, calm baseline — a color wave blooms from your fingertip at exactly five moments (enter queue, match, mutual yes, “we met,” clean close). Everything else stays quiet."),
    bullet("Slow arrivals, instant feedback — screens settle in reading order like walking into a room; every press answers in under 120ms."),
    bullet("Warm, round, unhurried — cream surfaces, pill buttons, springs with barely any bounce. Celebration is one green wave, never confetti."),
  ], { x: 0.78, y: 3.7, w: 7.0, h: 3.3, fontFace: BODY, fontSize: 15, color: INK2, valign: "top" });
  phone(s, "01-splash.png", 8.5, 0.85, 5.9);
  phone(s, "09-profile-bento.png", 11.05, 0.85, 5.9);
  s.addNotes("The motion system is tokenized — four named springs, five wave registers — so the app feels crafted, not generated. Full rationale lives in the design document.");
}

// ---------------------------------------------------------------- 10 · try it
{
  const s = pres.addSlide();
  s.background = { path: A("bg-gradient.png") };
  s.addImage({ path: A("iso-mark-white.png"), x: 5.44, y: 1.05, w: 2.45, h: 1.41 });
  s.addText("Try it yourself", { x: 2.65, y: 2.75, w: 8, h: 0.75, align: "center", fontFace: HEAD, fontSize: 34, bold: true, color: "FFFFFF" });
  const rows = [
    ["Live demo", "the interactive prototype runs in any browser — phone-sized, no install"],
    ["Source + docs", "github.com/pjeon18/iso-prototype — PRD, build spec, design document, validation"],
    ["Demo controls", "add ?debug to the URL: force matches, pick personas, trigger revival, skip onboarding"],
  ];
  rows.forEach(([h2, body], i) => {
    const y = 3.8 + i * 0.92;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 2.9, y, w: 7.53, h: 0.78, rectRadius: 0.1, fill: { color: "FFFFFF", transparency: 12 },
    });
    s.addText(h2, { x: 3.2, y: y + 0.08, w: 1.9, h: 0.62, fontFace: HEAD, fontSize: 14, bold: true, color: INK2, valign: "middle", margin: 0 });
    s.addText(body, { x: 5.15, y: y + 0.08, w: 5.2, h: 0.62, fontFace: BODY, fontSize: 12, color: INK2, valign: "middle", margin: 0 });
  });
  s.addText("one conversation at a time 🧡", { x: 2.65, y: 6.9, w: 8, h: 0.35, align: "center", fontFace: BODY, fontSize: 12, italic: true, color: "FFFFFF" });
  s.addNotes("Links resolve once the repo is public: the live demo deploys via GitHub Pages from the same repository.");
}

pres.writeFile({ fileName: path.join(__dirname, "ISO_Product_Intro.pptx") }).then(() => console.log("deck written"));

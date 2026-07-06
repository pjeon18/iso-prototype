/**
 * Captures presentation screenshots of the running prototype.
 * Usage: node scripts/capture.mjs   (dev server must be up on :5173)
 * Output: slides/shots/*.png at 390×844 @2x (phone-sized, full-bleed).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.CAPTURE_BASE || "http://localhost:5173";
const OUT = new URL("../slides/shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

// keep the demo-controls gear out of every shot
await page.addInitScript(() => {
  const hide = () => {
    const style = document.createElement("style");
    style.textContent = 'button[aria-label="debug"]{display:none!important}';
    document.head.appendChild(style);
  };
  if (document.readyState !== "loading") hide();
  else document.addEventListener("DOMContentLoaded", hide);
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** SPA navigation — keeps store timers/state alive (no full reload) */
const go = (path) =>
  page.evaluate((p) => {
    window.history.pushState({}, "", p);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
const shot = async (name) => {
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("✓", name);
};
/** run code against the app's store */
const iso = (fn) => page.evaluate(fn);

// fresh state, debug enabled
await page.goto(`${BASE}/?debug`);
await page.waitForFunction(() => window.__iso);
await iso(() => window.localStorage.removeItem("iso-proto"));
await page.goto(`${BASE}/welcome?debug`);
await page.waitForFunction(() => window.__iso);

// 01 — splash, fully settled
await sleep(3800);
await shot("01-splash");

// 09 — queue home
await iso(() => window.__iso.getState().skipToApp());
await page.goto(`${BASE}/queue?debug`);
await page.waitForFunction(() => window.__iso);
await sleep(2200);
await shot("02-queue-home");

// 10 — searching
await iso(() => {
  const s = window.__iso.getState();
  s.setDebug({ personaOverride: "p_maya", partnerKeepTalking: "yes", forceNoMatch: false });
  s.enterQueue();
});
await sleep(1800);
await shot("03-searching");

// 11 — match found (wait out the search delay)
await page.waitForFunction(() => window.__iso.getState().queue.status === "matched", null, { timeout: 9000 });
await sleep(1800);
await shot("04-match-found");

// 12 — live room with a real exchange
await iso(() => window.__iso.getState().sayHi());
await go("/room");
await sleep(4500); // opener arrives
await iso(() => window.__iso.getState().sendMessage("ok that's a strong open. mine: my roommate lost an argument with the microwave"));
await sleep(6000); // typing dots → reply → timer running
await iso(() => window.__iso.getState().sendMessage("it beeped first, he escalated"));
await sleep(6000);
await shot("05-live-room");

// 13 — keep talking, sealed then revealed
await iso(() => window.__iso.getState().readyToDecide());
await sleep(900);
await shot("06-keep-talking-ask");
await iso(() => window.__iso.getState().answerKeepTalking(true));
await page.waitForFunction(() => window.__iso.getState().activeChat?.keepTalking.revealed, null, { timeout: 8000 });
await sleep(1600);
await shot("07-keep-talking-mutual");

// 15 — the one ongoing chat
await iso(() => window.__iso.getState().resolveKeepTalking());
await go("/chat");
await sleep(1200);
await iso(() => window.__iso.getState().sendMessage("coffee thursday? you pick the spot"));
await sleep(6200);
await shot("08-one-chat");

// profile bento (unlock ISO+ so states look rich)
await iso(() => { const s = window.__iso.getState(); if (!s.isPlus) s.unlockPlus(); });
await go("/profile");
await sleep(2000);
await shot("09-profile-bento");

// memories
await go("/profile/memories");
await sleep(1400);
await shot("10-memories");

// trend + recap
await go("/profile/trend");
await sleep(1400);
await shot("11-trend-recap");

// 28 — revival offer
await go("/queue");
await sleep(600);
await iso(() => {
  const s = window.__iso.getState();
  if (s.activeChat) window.__iso.setState({ activeChat: null });
  s.forceMutualRevival();
});
await sleep(1600);
await shot("12-revival");

await browser.close();
console.log("done →", OUT);

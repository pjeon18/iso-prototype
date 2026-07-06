import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { PhoneFrame } from "./components/PhoneFrame";
import { TabBar } from "./components/TabBar";
import { Toasts } from "./components/Toasts";
import { DebugPanel } from "./components/DebugPanel";
import { ColorWaveHost } from "./components/ColorWave";
import { springs, durations } from "./lib/motion";
import { useIsoStore } from "./store/useIsoStore";

import { Splash } from "./screens/onboarding/Splash";
import { Onboarding } from "./screens/onboarding/Onboarding";
import { QueueTab } from "./screens/core/QueueTab";
import { LiveRoom } from "./screens/core/LiveRoom";
import { ChatTab } from "./screens/core/ChatTab";
import { ProfileHub } from "./screens/account/ProfileHub";
import { EditProfile } from "./screens/account/EditProfile";
import { Settings } from "./screens/account/Settings";
import { Subscription } from "./screens/account/Subscription";
import { Paywall } from "./screens/plus/Paywall";
import { Memories } from "./screens/plus/Memories";
import { TrendRecap } from "./screens/v2/TrendRecap";
import { SafetyCenter } from "./screens/safety/SafetyCenter";
import {
  BurnoutNudge,
  CloseoutWizard,
  OngoingOutcomePrompt,
  RevivalOffer,
} from "./screens/v2/Overlays";

const TRACK_ROUTES = ["/queue", "/chat", "/profile"];

/**
 * Tab shell — exactly three tabs: Queue / Chat / Profile, living on a
 * horizontal track you drag between (Motion Brief §3). Content follows the
 * finger, settles with momentum, stays interruptible. Deep screens slide in
 * from the right over the track (§5) with a subtle parallax drift beneath.
 */
function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const queueStatus = useIsoStore((s) => s.queue.status);
  const background = useIsoStore((s) => s.queue.background);

  const trackIdx = TRACK_ROUTES.indexOf(location.pathname);
  const isTrackRoute = trackIdx !== -1;
  // remember the last tab so deep screens keep the right pane beneath them
  const lastIdxRef = useRef(trackIdx === -1 ? 2 : trackIdx);
  if (trackIdx !== -1) lastIdxRef.current = trackIdx;
  const idx = trackIdx === -1 ? lastIdxRef.current : trackIdx;

  // full-screen queue moments (searching / match / no-match) own the screen
  const queueTakeover =
    location.pathname === "/queue" && queueStatus !== "idle" && !background;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [paneW, setPaneW] = useState(390);
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setPaneW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x = useMotionValue(-idx * paneW);
  const firstLayout = useRef(true);
  useEffect(() => {
    if (firstLayout.current) {
      x.set(-idx * paneW); // no slide on initial mount / refresh
      firstLayout.current = false;
      return;
    }
    // tap-driven tab changes glide calmly; gesture settles stay standard
    const controls = animate(x, -idx * paneW, springs.calm);
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paneW]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    let target = Math.round(-x.get() / paneW);
    if (Math.abs(info.velocity.x) > 400) {
      target = idx + (info.velocity.x < 0 ? 1 : -1); // a short flick advances one tab
    }
    target = Math.max(0, Math.min(2, target));
    if (target !== idx) navigate(TRACK_ROUTES[target]);
    else animate(x, -idx * paneW, springs.standard);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={viewportRef} className="flex-1 min-h-0 relative overflow-hidden">
        <motion.div
          className="flex h-full"
          style={{ x, width: paneW * 3, willChange: "transform" }}
          animate={{ translateX: !isTrackRoute ? -36 : 0, opacity: !isTrackRoute ? 0.92 : 1 }}
          transition={springs.standard}
          drag={isTrackRoute && !queueTakeover ? "x" : false}
          dragConstraints={{ left: -2 * paneW, right: 0 }}
          dragElastic={0.08}
          dragDirectionLock
          onDragEnd={onDragEnd}
        >
          <div className="h-full flex flex-col flex-none" style={{ width: paneW }}>
            <QueueTab />
          </div>
          <div className="h-full flex flex-col flex-none" style={{ width: paneW }}>
            <ChatTab />
          </div>
          <div className="h-full flex flex-col flex-none" style={{ width: paneW }}>
            <ProfileHub />
          </div>
        </motion.div>

        {/* deeper screens slide in from the right; back slides out right (§5).
            Screens opened via a bento shared-element morph fade in beneath the
            expanding clone instead (handoff, §4/§6). */}
        <AnimatePresence>
          {!isTrackRoute &&
            (() => {
              const viaMorph =
                reduced || (location.state as { morph?: boolean } | null)?.morph === true;
              return (
                <motion.div
                  key={location.pathname}
                  className="absolute inset-0 flex flex-col"
                  style={{ background: "var(--iso-bg)" }}
                  initial={viaMorph ? { opacity: 0 } : { x: "100%" }}
                  animate={viaMorph ? { opacity: 1 } : { x: 0 }}
                  exit={
                    viaMorph
                      ? { opacity: 0, transition: { duration: durations.instant } }
                      : { x: "100%", transition: springs.calm }
                  }
                  transition={viaMorph ? { duration: durations.base } : springs.calm}
                >
                  <Outlet />
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </div>
      {!queueTakeover && <TabBar x={x} paneW={paneW} />}
    </div>
  );
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const onboarded = useIsoStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export default function App() {
  const onboarded = useIsoStore((s) => s.onboarded);
  const resumeAfterReload = useIsoStore((s) => s.resumeAfterReload);

  // pick a persisted conversation back up cleanly after a refresh
  useEffect(() => {
    resumeAfterReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Navigate to={onboarded ? "/queue" : "/welcome"} replace />} />
        <Route path="/welcome" element={onboarded ? <Navigate to="/queue" replace /> : <Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          path="/room"
          element={
            <RequireOnboarded>
              <LiveRoom />
            </RequireOnboarded>
          }
        />

        <Route
          element={
            <RequireOnboarded>
              <Shell />
            </RequireOnboarded>
          }
        >
          {/* track routes render inside the swipeable panes, not the Outlet */}
          <Route path="/queue" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/profile" element={null} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/subscription" element={<Subscription />} />
          <Route path="/profile/safety" element={<SafetyCenter />} />
          <Route path="/profile/memories" element={<Memories />} />
          <Route path="/profile/trend" element={<TrendRecap />} />
          <Route path="/plus" element={<Paywall />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* global overlays — closeout (outcome→reflection→revival flag),
          the 48h outcome ask, the blind-mutual revival offer, burnout nudge */}
      <CloseoutWizard />
      <OngoingOutcomePrompt />
      <RevivalOffer />
      <BurnoutNudge />

      <Toasts />
      <DebugPanel />
      <ColorWaveHost />
    </PhoneFrame>
  );
}

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  currentUser,
  personas,
  seedHistory,
  revivalSeed,
  demoDefaults,
  type Persona,
} from "../data/seedData";
import { pickPersona, searchDelayMs } from "../lib/matchmaker";
import { getEngine } from "../lib/partner/llm";
import {
  DAY,
  HOUR,
  REVIVAL_COOLDOWN_HOURS,
  REVIVAL_DECAY_DAYS,
  rand,
} from "../lib/time";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QueueStatus = "idle" | "searching" | "matched" | "noMatch";
export type ChatPhase = "live" | "deciding" | "ongoing";
export type OutcomeValue = "met" | "not_yet" | "no" | "none";

export interface Message {
  id: string;
  from: "me" | "partner" | "system";
  text: string;
  at: number;
}

export interface KeepTalkingState {
  reason: "turns" | "decide" | "pause" | null;
  me: boolean | null;
  partner: boolean | null;
  revealed: boolean;
}

export interface ActiveChat {
  id: string;
  personaId: string;
  startedAt: number;
  phase: ChatPhase;
  messages: Message[];
  partnerTyping: boolean;
  /** consecutive reply-timer lapses (decision D3: 2nd lapse → gentle decide) */
  lapses: number;
  /** bump to restart the reply timer in the UI */
  timerKey: number;
  keepTalking: KeepTalkingState;
  ongoingSince: number | null;
  isRevival: boolean;
  /** outcome loop: max one active ask per chat */
  outcomeAsked: boolean;
  outcome: OutcomeValue;
}

export interface ConversationRecord {
  id: string;
  personaId: string;
  endedAt: number;
  mutualContinued: boolean;
  satisfaction: number | null;
  tags: string[];
  outcome: OutcomeValue;
  archived: boolean; // Memories eligibility: mutual only
  messages: Message[]; // empty for seeded entries (excerpt synthesized in UI)
  seeded?: boolean;
}

/** Post-conversation close-out wizard: outcome → reflection → revival flag. */
export interface Closeout {
  recordId: string;
  personaId: string;
  mutual: boolean;
  stage: "outcome" | "reflection" | "revival" | "done";
}

interface DebugState {
  forceNoMatch: boolean;
  personaOverride: string | null;
  partnerMode: "scripted" | "llm";
  partnerKeepTalking: "auto" | "yes" | "no";
  timeOffsetMs: number;
}

export interface ToastMsg {
  id: number;
  text: string;
  action?: { label: string; kind: "openMatch" };
}

interface IsoState {
  // session
  onboarded: boolean;
  isPlus: boolean;
  user: typeof currentUser;

  // queue
  queue: {
    status: QueueStatus;
    matchedPersonaId: string | null;
    background: boolean;
    nextIsRevival: boolean;
  };

  // THE nullable singleton
  activeChat: ActiveChat | null;

  history: ConversationRecord[];
  closeout: Closeout | null;
  /** shown after a non-mutual "keep talking?" — the polite close screen */
  lastClosedPersonaId: string | null;
  lastClosedRecordId: string | null;

  revival: {
    slot: { personaId: string; flaggedAt: number } | null;
    offer: { personaId: string } | null;
    attempts: number;
  };

  blocked: string[];
  reports: { personaId: string; reason: string; at: number }[];

  session: { lowCount: number; burnoutOpen: boolean };
  outcomePromptOpen: boolean;

  toasts: ToastMsg[];
  debug: DebugState;

  // ------- actions -------
  now: () => number;
  toast: (text: string, action?: ToastMsg["action"]) => void;
  dismissToast: (id: number) => void;

  completeOnboarding: () => void;

  enterQueue: (background?: boolean) => void;
  leaveQueue: () => void;
  dismissNoMatch: () => void;

  sayHi: () => void;
  sendMessage: (text: string) => void;
  timerLapsed: () => void;
  readyToDecide: () => void;
  answerKeepTalking: (me: boolean) => void;
  resolveKeepTalking: () => void;
  clearLastClosed: () => void;

  requestCloseOngoing: () => void; // records + starts closeout
  answerOutcome: (value: OutcomeValue) => void; // for closeout stage
  answerOngoingOutcome: (value: OutcomeValue) => void; // 48h prompt on live ongoing chat
  dismissOngoingOutcome: () => void;
  answerReflection: (satisfaction: number, tags: string[]) => void;
  skipCloseoutStage: () => void;
  flagRevivalFromCloseout: (flag: boolean) => void;
  finishCloseout: () => void;
  /** generic one-tap reflection (used by the polite-close screen + recap) */
  reflectRecord: (recordId: string, satisfaction: number, tags: string[]) => void;
  /** private single-slot revival flag; overwrites (the UI confirms replaces) */
  flagRevival: (personaId: string) => void;

  forceMutualRevival: () => void;
  acceptRevival: () => void;
  declineRevival: () => void;

  dismissBurnout: (takeBreak: boolean) => void;

  blockPersona: (personaId: string) => void;
  reportPersona: (personaId: string, reason: string) => void;

  unlockPlus: () => void;
  cancelPlus: () => void;

  advanceTime: (hours?: number) => void;
  setDebug: (patch: Partial<DebugState>) => void;
  skipToApp: () => void;
  resetAll: () => void;
  resumeAfterReload: () => void;

  wipeMemory: (recordId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function personaById(id: string): Persona {
  return personas.find((p) => p.id === id) ?? personas[0];
}

let idSeq = 0;
const uid = (p: string) => `${p}_${Date.now()}_${idSeq++}`;

// Timeout registries — chat timers are cancelled when a conversation ends so
// a stale partner reply can never land in the next chat.
const chatTimers = new Set<number>();
let queueTimer: number | null = null;

function chatLater(fn: () => void, ms: number) {
  const id = window.setTimeout(() => {
    chatTimers.delete(id);
    fn();
  }, ms);
  chatTimers.add(id);
}
function clearChatTimers() {
  chatTimers.forEach((t) => window.clearTimeout(t));
  chatTimers.clear();
}
function clearQueueTimer() {
  if (queueTimer !== null) window.clearTimeout(queueTimer);
  queueTimer = null;
}

function seedRecords(nowMs: number): ConversationRecord[] {
  return seedHistory.map((h) => ({
    id: h.id,
    personaId: h.personaId,
    endedAt: nowMs - h.daysAgo * DAY,
    mutualContinued: h.mutualContinued,
    satisfaction: h.satisfaction,
    tags: h.tags,
    outcome: h.outcome,
    archived: h.archived,
    messages: [],
    seeded: true,
  }));
}

const KEEP_TALKING_AT = 12; // decision D4: ~12 total messages

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useIsoStore = create<IsoState>()(
  persist(
    (set, get) => {
      // ----- internal helpers that need set/get -----

      const partnerAnswersKeepTalking = (persona: Persona): boolean => {
        const override = get().debug.partnerKeepTalking;
        if (override === "yes") return true;
        if (override === "no") return false;
        if (persona.keepTalkingDefault === "random") return Math.random() < 0.5;
        return persona.keepTalkingDefault === "yes";
      };

      const appendMessage = (msg: Omit<Message, "id" | "at">) => {
        const chat = get().activeChat;
        if (!chat) return;
        set({
          activeChat: {
            ...chat,
            messages: [...chat.messages, { ...msg, id: uid("m"), at: get().now() }],
          },
        });
      };

      const humanCount = (chat: ActiveChat) =>
        chat.messages.filter((m) => m.from !== "system").length;

      const beginKeepTalking = (reason: "turns" | "decide" | "pause") => {
        const chat = get().activeChat;
        if (!chat || chat.phase !== "live") return;
        clearChatTimers();
        set({
          activeChat: {
            ...chat,
            phase: "deciding",
            partnerTyping: false,
            keepTalking: { reason, me: null, partner: null, revealed: false },
          },
        });
      };

      const maybeTriggerByTurns = () => {
        const chat = get().activeChat;
        if (!chat || chat.phase !== "live") return;
        if (humanCount(chat) >= KEEP_TALKING_AT) {
          clearChatTimers();
          chatLater(() => beginKeepTalking("turns"), 1100);
        }
      };

      const schedulePartnerReply = () => {
        const chatId = get().activeChat?.id;
        if (!chatId) return;
        // replies flow in both the live room and the ongoing chat; only the
        // "deciding" takeover pauses the partner
        const canReply = (c: ActiveChat | null): c is ActiveChat =>
          !!c && c.id === chatId && c.phase !== "deciding";
        chatLater(() => {
          const c = get().activeChat;
          if (!canReply(c)) return;
          set({ activeChat: { ...c, partnerTyping: true } });
          chatLater(async () => {
            const c2 = get().activeChat;
            if (!canReply(c2)) return;
            const persona = personaById(c2.personaId);
            const engine = getEngine(get().debug.partnerMode);
            const history = c2.messages
              .filter((m) => m.from !== "system")
              .map((m) => ({ from: m.from as "me" | "partner", text: m.text }));
            const text = await engine.reply({ persona, history });
            const c3 = get().activeChat;
            if (!canReply(c3)) return;
            set({
              activeChat: {
                ...c3,
                partnerTyping: false,
                timerKey: c3.timerKey + 1, // user's turn — restart the gentle timer
                messages: [
                  ...c3.messages,
                  { id: uid("m"), from: "partner", text, at: get().now() },
                ],
              },
            });
            maybeTriggerByTurns();
          }, rand(1500, 4000));
        }, rand(500, 1300));
      };

      const scheduleOpener = () => {
        const chatId = get().activeChat?.id;
        if (!chatId) return;
        chatLater(() => {
          const c = get().activeChat;
          if (!c || c.id !== chatId || c.phase !== "live") return;
          set({ activeChat: { ...c, partnerTyping: true } });
          chatLater(async () => {
            const c2 = get().activeChat;
            if (!c2 || c2.id !== chatId || c2.phase !== "live") return;
            const persona = personaById(c2.personaId);
            const engine = getEngine(get().debug.partnerMode);
            const text = await engine.opener({ persona, history: [] });
            const c3 = get().activeChat;
            if (!c3 || c3.id !== chatId || c3.phase !== "live") return;
            set({
              activeChat: {
                ...c3,
                partnerTyping: false,
                timerKey: c3.timerKey + 1,
                messages: [
                  ...c3.messages,
                  { id: uid("m"), from: "partner", text, at: get().now() },
                ],
              },
            });
          }, rand(1600, 3200));
        }, rand(700, 1400));
      };

      /** End the conversation and write the history record. */
      const endConversation = (opts: {
        mutual: boolean;
        startCloseout: boolean;
        countUnsuccessful: boolean;
        keepRecord?: boolean;
      }): string | null => {
        const chat = get().activeChat;
        if (!chat) return null;
        clearChatTimers();
        const record: ConversationRecord = {
          id: uid("c"),
          personaId: chat.personaId,
          endedAt: get().now(),
          mutualContinued: opts.mutual,
          satisfaction: null,
          tags: [],
          outcome: chat.outcome,
          archived: opts.mutual, // Memories: mutual conversations only
          messages: chat.messages,
        };
        const keep = opts.keepRecord !== false;
        set((s) => ({
          activeChat: null,
          history: keep ? [...s.history, record] : s.history,
          session: {
            ...s.session,
            lowCount: s.session.lowCount + (opts.countUnsuccessful ? 1 : 0),
          },
          closeout: opts.startCloseout
            ? {
                recordId: record.id,
                personaId: chat.personaId,
                mutual: opts.mutual,
                // outcome question only makes sense for an ongoing chat
                stage: opts.mutual && !chat.outcomeAsked ? "outcome" : "reflection",
              }
            : null,
          lastClosedPersonaId: opts.startCloseout ? null : s.lastClosedPersonaId,
        }));
        return record.id;
      };

      const checkRevivalDecay = () => {
        const { slot } = get().revival;
        if (!slot) return;
        const nowMs = get().now();
        const expired = nowMs - slot.flaggedAt > REVIVAL_DECAY_DAYS * DAY;
        // decay also after several strong subsequent conversations (PRD §9.10)
        const strongAfter = get().history.filter(
          (r) => r.endedAt > slot.flaggedAt && (r.satisfaction ?? 0) >= 4,
        ).length;
        if (expired || strongAfter >= 3) {
          // silent, non-shaming — no toast, no notification
          set((s) => ({ revival: { ...s.revival, slot: null } }));
        }
      };

      /** Blind-mutual check: only the seeded pairing is mutual in this demo. */
      const maybeSurfaceRevival = () => {
        const s = get();
        if (s.activeChat) return; // only when free — absolute
        if (s.revival.offer) return;
        const slot = s.revival.slot;
        if (!slot) return;
        if (slot.personaId !== revivalSeed.personaId) return; // not mutual
        if (!revivalSeed.partnerFlagged) return;
        if (s.blocked.includes(slot.personaId)) return;
        const cooled = s.now() - slot.flaggedAt >= REVIVAL_COOLDOWN_HOURS * HOUR;
        if (!cooled) return;
        set((st) => ({ revival: { ...st.revival, offer: { personaId: slot.personaId } } }));
      };

      // ----- public state + actions -----

      return {
        onboarded: false,
        isPlus: currentUser.isPlus,
        user: currentUser,

        queue: { status: "idle", matchedPersonaId: null, background: false, nextIsRevival: false },
        activeChat: null,
        history: seedRecords(Date.now()),
        closeout: null,
        lastClosedPersonaId: null,
        lastClosedRecordId: null,
        revival: { slot: null, offer: null, attempts: 0 },
        blocked: [],
        reports: [],
        session: { lowCount: 0, burnoutOpen: false },
        outcomePromptOpen: false,
        toasts: [],
        debug: {
          forceNoMatch: demoDefaults.forceNoMatch,
          personaOverride: null,
          partnerMode: demoDefaults.partnerMode,
          partnerKeepTalking: "auto",
          timeOffsetMs: 0,
        },

        now: () => Date.now() + get().debug.timeOffsetMs,

        toast: (text, action) => {
          const id = Date.now() + Math.random();
          set((s) => ({ toasts: [...s.toasts, { id, text, action }] }));
          window.setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
          }, action ? 6000 : 2800);
        },
        dismissToast: (id) =>
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

        completeOnboarding: () => set({ onboarded: true }),

        // ------------- THE INVARIANT (APPROVED_PLAN.md §D1) -------------
        // enterQueue is a no-op with a toast while any chat exists. The
        // matchmaker can never fire while a chat is live or ongoing.
        enterQueue: (background = false) => {
          const s = get();
          if (s.activeChat) {
            s.toast("One conversation at a time — close your current chat to meet someone new.");
            return;
          }
          if (s.queue.status === "searching") return;
          clearQueueTimer();
          set({
            queue: { status: "searching", matchedPersonaId: null, background, nextIsRevival: false },
          });
          queueTimer = window.setTimeout(() => {
            queueTimer = null;
            const st = get();
            if (st.queue.status !== "searching") return;
            if (st.activeChat) return; // belt-and-braces: never match while chatting
            if (st.debug.forceNoMatch) {
              set({ queue: { ...st.queue, status: "noMatch" } });
              return;
            }
            const lastPersonaId = st.history[st.history.length - 1]?.personaId ?? null;
            const persona = pickPersona({
              overrideId: st.debug.personaOverride,
              blocked: st.blocked,
              lastPersonaId,
            });
            set({
              queue: { ...st.queue, status: "matched", matchedPersonaId: persona.id },
            });
            if (st.queue.background) {
              get().toast(`${persona.name} is ready to talk — they're here now.`, {
                label: "Open & say hi",
                kind: "openMatch",
              });
            }
          }, searchDelayMs());
        },

        leaveQueue: () => {
          clearQueueTimer();
          set((s) => ({ queue: { ...s.queue, status: "idle", background: false } }));
        },

        dismissNoMatch: () =>
          set((s) => ({ queue: { ...s.queue, status: "idle" } })),

        sayHi: () => {
          const s = get();
          if (s.activeChat) {
            s.toast("You already have a conversation open.");
            return;
          }
          const personaId = s.queue.matchedPersonaId;
          if (!personaId) return;
          const chat: ActiveChat = {
            id: uid("chat"),
            personaId,
            startedAt: s.now(),
            phase: "live",
            messages: [],
            partnerTyping: false,
            lapses: 0,
            timerKey: 0,
            keepTalking: { reason: null, me: null, partner: null, revealed: false },
            ongoingSince: null,
            isRevival: s.queue.nextIsRevival,
            outcomeAsked: false,
            outcome: "none",
          };
          set({
            activeChat: chat,
            queue: { status: "idle", matchedPersonaId: null, background: false, nextIsRevival: false },
          });
          scheduleOpener();
        },

        sendMessage: (text) => {
          const chat = get().activeChat;
          if (!chat || !text.trim()) return;
          if (chat.phase === "deciding") return;
          set({
            activeChat: {
              ...chat,
              lapses: 0,
              messages: [
                ...chat.messages,
                { id: uid("m"), from: "me", text: text.trim(), at: get().now() },
              ],
            },
          });
          if (chat.phase === "live") {
            const after = get().activeChat!;
            if (humanCount(after) >= KEEP_TALKING_AT) {
              clearChatTimers();
              chatLater(() => beginKeepTalking("turns"), 1100);
            } else {
              schedulePartnerReply();
            }
          } else {
            // ongoing chat — calmer pace, partner still replies
            schedulePartnerReply();
          }
        },

        // Decision D3: no penalty at zero — a soft "still there?"; a SECOND
        // consecutive lapse surfaces "keep talking?" early as a natural pause.
        timerLapsed: () => {
          const chat = get().activeChat;
          if (!chat || chat.phase !== "live" || chat.partnerTyping) return;
          const persona = personaById(chat.personaId);
          if (chat.lapses >= 1) {
            appendMessage({
              from: "system",
              text: "Seems like a natural pause — no pressure.",
            });
            chatLater(() => beginKeepTalking("pause"), 900);
            return;
          }
          set({
            activeChat: {
              ...get().activeChat!,
              lapses: chat.lapses + 1,
              timerKey: chat.timerKey + 1,
            },
          });
          appendMessage({
            from: "system",
            text: `Still there? No rush — ${persona.name} is still here.`,
          });
        },

        readyToDecide: () => beginKeepTalking("decide"),

        answerKeepTalking: (me) => {
          const chat = get().activeChat;
          if (!chat || chat.phase !== "deciding" || chat.keepTalking.me !== null) return;
          set({
            activeChat: { ...chat, keepTalking: { ...chat.keepTalking, me } },
          });
          const persona = personaById(chat.personaId);
          const partner = partnerAnswersKeepTalking(persona);
          // simultaneous reveal — the answer is computed but hidden until both
          // sides have "committed", then revealed together (decision D4).
          // The wait is deliberately unhurried: a held breath, not a spinner.
          chatLater(() => {
            const c = get().activeChat;
            if (!c || c.phase !== "deciding") return;
            set({
              activeChat: {
                ...c,
                keepTalking: { ...c.keepTalking, partner, revealed: true },
              },
            });
          }, rand(2200, 3600));
        },

        resolveKeepTalking: () => {
          const chat = get().activeChat;
          if (!chat || !chat.keepTalking.revealed) return;
          const { me, partner } = chat.keepTalking;
          const persona = personaById(chat.personaId);
          if (me && partner) {
            set({
              activeChat: {
                ...chat,
                phase: "ongoing",
                ongoingSince: get().now(),
                keepTalking: { reason: null, me: null, partner: null, revealed: false },
                messages: [
                  ...chat.messages,
                  {
                    id: uid("m"),
                    from: "system",
                    text: "You both said yes — this is your one ongoing chat. 🎉",
                    at: get().now(),
                  },
                  {
                    id: uid("m"),
                    from: "partner",
                    text: persona.scripted.keepTalkingLine,
                    at: get().now(),
                  },
                ],
              },
            });
          } else {
            // polite close — no dead thread, both "return to the queue"
            const rid = endConversation({
              mutual: false,
              startCloseout: false,
              countUnsuccessful: true,
            });
            set({ lastClosedPersonaId: chat.personaId, lastClosedRecordId: rid });
          }
        },

        clearLastClosed: () =>
          set({ lastClosedPersonaId: null, lastClosedRecordId: null }),

        requestCloseOngoing: () => {
          const chat = get().activeChat;
          if (!chat || chat.phase !== "ongoing") return;
          endConversation({ mutual: true, startCloseout: true, countUnsuccessful: false });
        },

        answerOutcome: (value) => {
          const co = get().closeout;
          if (!co) return;
          set((s) => ({
            history: s.history.map((r) =>
              r.id === co.recordId ? { ...r, outcome: value } : r,
            ),
            closeout: { ...co, stage: "reflection" },
          }));
        },

        answerOngoingOutcome: (value) => {
          const chat = get().activeChat;
          if (!chat) return;
          set({
            activeChat: { ...chat, outcome: value, outcomeAsked: true },
            outcomePromptOpen: false,
          });
        },
        dismissOngoingOutcome: () => {
          const chat = get().activeChat;
          // dismissing counts as the one active ask — never nags (PRD §9.8)
          set({
            outcomePromptOpen: false,
            activeChat: chat ? { ...chat, outcomeAsked: true } : chat,
          });
        },

        answerReflection: (satisfaction, tags) => {
          const co = get().closeout;
          if (!co) return;
          set((s) => ({
            history: s.history.map((r) =>
              r.id === co.recordId ? { ...r, satisfaction, tags } : r,
            ),
            session: {
              ...s.session,
              lowCount:
                co.mutual && satisfaction <= 2
                  ? s.session.lowCount + 1
                  : s.session.lowCount,
            },
            closeout: { ...co, stage: "revival" },
          }));
        },

        skipCloseoutStage: () => {
          const co = get().closeout;
          if (!co) return;
          const next =
            co.stage === "outcome" ? "reflection" : co.stage === "reflection" ? "revival" : "done";
          if (next === "done") set({ closeout: null });
          else set({ closeout: { ...co, stage: next } });
        },

        flagRevivalFromCloseout: (flag) => {
          const co = get().closeout;
          if (!co) return;
          if (flag) {
            set((s) => ({
              revival: {
                ...s.revival,
                slot: { personaId: co.personaId, flaggedAt: s.now() },
                attempts: s.revival.attempts + 1,
              },
            }));
          }
          set({ closeout: null });
        },

        finishCloseout: () => set({ closeout: null }),

        reflectRecord: (recordId, satisfaction, tags) => {
          set((s) => ({
            history: s.history.map((r) =>
              r.id === recordId ? { ...r, satisfaction, tags } : r,
            ),
          }));
        },

        flagRevival: (personaId) => {
          const s = get();
          if (s.blocked.includes(personaId)) return;
          set((st) => ({
            revival: {
              ...st.revival,
              slot: { personaId, flaggedAt: st.now() },
              attempts: st.revival.attempts + 1,
            },
          }));
        },

        forceMutualRevival: () => {
          const s = get();
          if (s.activeChat) {
            s.toast("Revival only surfaces when you're free — close your chat first.");
            return;
          }
          if (s.blocked.includes(revivalSeed.personaId)) {
            s.toast("That person is blocked — revival is permanently off for them.");
            return;
          }
          set((st) => ({
            revival: {
              ...st.revival,
              slot: st.revival.slot ?? {
                personaId: revivalSeed.personaId,
                flaggedAt: st.now() - REVIVAL_COOLDOWN_HOURS * HOUR,
              },
              offer: { personaId: revivalSeed.personaId },
            },
          }));
        },

        acceptRevival: () => {
          const s = get();
          const offer = s.revival.offer;
          if (!offer) return;
          if (s.activeChat) {
            s.toast("Revival only works when you're free.");
            return;
          }
          // fresh live room via the normal loop — never a resurrected thread
          set({
            revival: { ...s.revival, offer: null, slot: null },
            queue: {
              status: "matched",
              matchedPersonaId: offer.personaId,
              background: false,
              nextIsRevival: true,
            },
          });
        },

        declineRevival: () => {
          // soft, unattributed — the other side is never told
          set((s) => ({ revival: { ...s.revival, offer: null } }));
        },

        dismissBurnout: (takeBreak) => {
          set((s) => ({
            session: { lowCount: 0, burnoutOpen: false },
            queue: takeBreak ? { ...s.queue, status: "idle" } : s.queue,
          }));
        },

        blockPersona: (personaId) => {
          const s = get();
          const chat = s.activeChat;
          clearChatTimers();
          set((st) => ({
            blocked: [...st.blocked, personaId],
            // blocks are absolute: never in Memories, never revival-eligible
            history: st.history.filter((r) => r.personaId !== personaId),
            revival: {
              ...st.revival,
              slot: st.revival.slot?.personaId === personaId ? null : st.revival.slot,
              offer: st.revival.offer?.personaId === personaId ? null : st.revival.offer,
            },
            activeChat: chat && chat.personaId === personaId ? null : st.activeChat,
            queue:
              st.queue.matchedPersonaId === personaId
                ? { ...st.queue, status: "idle", matchedPersonaId: null }
                : st.queue,
          }));
          get().toast("Blocked. They can't reach you again — anywhere.");
        },

        reportPersona: (personaId, reason) => {
          set((s) => ({
            reports: [...s.reports, { personaId, reason, at: s.now() }],
          }));
          get().toast("Report received — our team will review it. They're never told.");
        },

        unlockPlus: () => {
          set({ isPlus: true });
          get().toast("Welcome to ISO+ ✨");
        },
        cancelPlus: () => {
          set({ isPlus: false });
          get().toast("ISO+ cancelled — you keep the core experience, always.");
        },

        advanceTime: (hours = 48) => {
          set((s) => ({
            debug: { ...s.debug, timeOffsetMs: s.debug.timeOffsetMs + hours * HOUR },
          }));
          const s = get();
          // outcome window on an ongoing chat (decision D5)
          if (s.activeChat?.phase === "ongoing" && !s.activeChat.outcomeAsked) {
            set({ outcomePromptOpen: true });
          }
          checkRevivalDecay();
          maybeSurfaceRevival();
          get().toast(`⏩ ${hours}h later…`);
        },

        setDebug: (patch) =>
          set((s) => ({ debug: { ...s.debug, ...patch } })),

        skipToApp: () => set({ onboarded: true }),

        resetAll: () => {
          clearChatTimers();
          clearQueueTimer();
          window.localStorage.removeItem("iso-proto");
          window.location.reload();
        },

        resumeAfterReload: () => {
          const chat = get().activeChat;
          if (!chat) return;
          if (chat.phase === "live") {
            const last = [...chat.messages].reverse().find((m) => m.from !== "system");
            set({ activeChat: { ...get().activeChat!, partnerTyping: false } });
            // a refresh before the first message must resume with the OPENER,
            // not a mid-conversation reply
            if (!last) scheduleOpener();
            else if (last.from === "me") schedulePartnerReply();
          } else if (chat.phase === "deciding" && chat.keepTalking.me !== null && !chat.keepTalking.revealed) {
            const persona = personaById(chat.personaId);
            const partner = partnerAnswersKeepTalking(persona);
            set({
              activeChat: {
                ...chat,
                partnerTyping: false,
                keepTalking: { ...chat.keepTalking, partner, revealed: true },
              },
            });
          }
        },

        wipeMemory: (recordId) => {
          set((s) => ({ history: s.history.filter((r) => r.id !== recordId) }));
          get().toast("Removed from your Memories.");
        },
      };
    },
    {
      name: "iso-proto",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        isPlus: s.isPlus,
        user: s.user,
        activeChat: s.activeChat,
        history: s.history,
        revival: { ...s.revival, offer: null },
        blocked: s.blocked,
        reports: s.reports,
        session: { lowCount: s.session.lowCount, burnoutOpen: false },
        debug: s.debug,
        closeout: s.closeout,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<IsoState>),
        queue: current.queue, // queue state never survives a refresh
        toasts: [],
        outcomePromptOpen: false,
        lastClosedPersonaId: null,
        lastClosedRecordId: null,
      }),
    },
  ),
);

/** True burnout check, evaluated when the user lands back on the queue. */
export function shouldNudgeBurnout(): boolean {
  const s = useIsoStore.getState();
  return s.session.lowCount >= demoDefaults.burnoutNudgeAfterN && !s.session.burnoutOpen;
}

export function openBurnout() {
  useIsoStore.setState((s) => ({ session: { ...s.session, burnoutOpen: true } }));
}

// Dev-only handle for scripted demo/validation runs (not in prod builds).
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__iso = useIsoStore;
}

// ?debug enables the panel for the whole browser session (survives SPA
// navigation and the reset-reload, which both drop the query string).
if (new URLSearchParams(window.location.search).has("debug")) {
  window.sessionStorage.setItem("iso-debug", "1");
}
export const DEBUG_PANEL_ENABLED =
  window.sessionStorage.getItem("iso-debug") === "1";

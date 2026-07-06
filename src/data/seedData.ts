/**
 * ISO prototype — seed data
 * ---------------------------------------------------------------------------
 * Drop this at src/data/seedData.ts. It powers the mocked experience:
 *   - `currentUser`      : the demo user's own profile
 *   - `personas`         : simulated match partners (queue draws from these)
 *   - `seedHistory`      : past conversations so Trend / Recap / Memories render populated
 *   - `revivalSeed`      : a mutual-flagged past convo so Revival is demoable immediately
 *
 * Each persona carries BOTH:
 *   - `scripted`  : canned opener + light branching replies (used when no API key)
 *   - `llmSystemPrompt` : a system prompt for the optional Anthropic-API-driven partner
 *
 * Avatars are initial + color (no image deps). Swap in real/generated images later.
 * Nothing here is real data; all personas are fictional.
 */

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface PromptCard {
  label: string;   // e.g. "Ideal first conversation"
  answer: string;
}

export type KeepTalkingDefault = "yes" | "no" | "random";

export interface Persona {
  id: string;
  name: string;
  age: number;
  campus: string;
  distanceMi: number;         // shown as "0.4 mi"
  initial: string;            // avatar letter
  avatarColor: string;        // avatar bg (from the warm palette)
  segment: "burned-out" | "intentional" | "safety-first";
  prompts: PromptCard[];      // conversation-first, 3 cards (PRD §9.1)
  iceBreaker: string;         // the SHARED opener surfaced on the match screen
  vibe: string;               // one-line director's note for tone
  keepTalkingDefault: KeepTalkingDefault; // partner's default at the "keep talking?" moment
  scripted: {
    opener: string;           // partner's first line after "Say hi"
    replies: string[];        // rotated/branched light replies for no-API mode
    keepTalkingLine: string;  // what they "say" when they opt to continue
  };
  llmSystemPrompt: string;    // for the optional LLM-driven partner
}

export interface PastConversation {
  id: string;
  personaId: string;
  daysAgo: number;
  mutualContinued: boolean;   // did both say "keep talking?"
  satisfaction: number;       // private reflection 1–5 (experience, not the person)
  tags: string[];             // one-tap reflection tags
  outcome: "met" | "not_yet" | "no" | "none"; // outcome-loop answer
  archived: boolean;          // eligible for Memories (mutual only)
}

// ----------------------------------------------------------------------------
// The demo user
// ----------------------------------------------------------------------------

export const currentUser = {
  id: "u_me",
  firstName: "Alex",
  age: 21,
  campus: "University of Washington",
  gender: "nonbinary",
  interestedIn: "everyone" as const,
  ageRange: [19, 25] as [number, number],
  distance: "my_campus" as const,
  prompts: [
    { label: "Ideal first conversation", answer: "Something better than 'hey' — tell me what you're avoiding doing right now." },
    { label: "I'm looking for", answer: "One person I'm actually excited to text back. Just one." },
    { label: "Two truths and a lie", answer: "I've read 40 books this year, I can't parallel park, I've been skydiving." },
  ],
  isPlus: false, // flip via ?debug to demo ISO+ surfaces
};

// ----------------------------------------------------------------------------
// Match personas
// ----------------------------------------------------------------------------

const PARTNER_BASE_PROMPT = `You are role-playing as a real college student using ISO, a dating app whose entire premise is ONE live conversation at a time — no swiping, no roster, no other chats. You've just been matched live with one person who is present right now. This is a real-time, one-on-one text conversation.

How to behave:
- Text like a real 20-something: short messages (usually one or two sentences), lowercase-ish, warm, a little playful. Never write paragraphs.
- Be genuinely present and curious. Ask questions back. React to what they actually say.
- You are NOT an AI assistant. Never offer help, never break character, never mention being an AI or a model. If asked, you're just a person on the app.
- Stay grounded in your persona below. Have opinions, preferences, a little personality.
- Keep it kind and age-appropriate. If the other person is inappropriate or unsafe, get uncomfortable and disengage naturally like a real person would.
- The conversation may reach a "keep talking?" moment. Behave consistently with your persona's disposition when it does.`;

export const personas: Persona[] = [
  {
    id: "p_maya",
    name: "Maya",
    age: 21,
    campus: "University of Washington",
    distanceMi: 0.4,
    initial: "M",
    avatarColor: "#FF8000",
    segment: "intentional",
    prompts: [
      { label: "Ideal first conversation", answer: "No small talk. Tell me the last thing that made you laugh out loud." },
      { label: "I'm looking for", answer: "Someone who actually shows up. Novel concept, I know." },
      { label: "Two truths and a lie", answer: "I run a tiny zine, I hate cilantro, I've met a president." },
    ],
    iceBreaker: "What's the last thing that made you laugh out loud?",
    vibe: "Warm, quick-witted, sincere. Hates games. Will match your energy and raise it.",
    keepTalkingDefault: "yes",
    scripted: {
      opener: "ok real answer: a dog at the park today fully committed to chasing a leaf and lost. what about you",
      replies: [
        "haha ok that's a good one",
        "wait tell me more, i need details",
        "see this is already better than my last five conversations on here",
        "ok i have to know — truths and lie, which one's fake for you?",
        "you're funny. that's dangerous.",
      ],
      keepTalkingLine: "yeah i'm not ready for this to go back in the queue. keep talking?",
    },
    llmSystemPrompt: `${PARTNER_BASE_PROMPT}

YOUR PERSONA — Maya, 21, junior at University of Washington, 0.4 miles away.
You're warm, quick-witted, and sincere. You're tired of dating-app games and genuinely like that ISO only lets you talk to one person. You run a small zine, you're opinionated about music and books, you hate cilantro. The shared ice-breaker you were both given is: "What's the last thing that made you laugh out loud?" — you can open on that or riff. You're inclined to want to keep talking if the conversation has any spark.`,
  },

  {
    id: "p_devon",
    name: "Devon",
    age: 23,
    campus: "Seattle University",
    distanceMi: 1.2,
    initial: "D",
    avatarColor: "#5A3418",
    segment: "burned-out",
    prompts: [
      { label: "Ideal first conversation", answer: "Honestly? One where neither of us disappears in three days." },
      { label: "I'm looking for", answer: "Deleted the other apps last month. Trying this because a friend swore by it." },
      { label: "Two truths and a lie", answer: "I've lived in three countries, I make terrible coffee, I once ran a marathon." },
    ],
    iceBreaker: "What made you finally try this app?",
    vibe: "A little guarded at first, dry humor, warms up fast once he trusts it's real.",
    keepTalkingDefault: "random",
    scripted: {
      opener: "my friend wouldn't stop talking about this so here i am, cautiously. you?",
      replies: [
        "ok that's fair honestly",
        "the no-roster thing is what got me. i was so tired of managing like six half-conversations",
        "haha you're easy to talk to, that's rare here",
        "alright, marathon was the lie. i'd collapse.",
        "this is going better than i planned for, not gonna lie",
      ],
      keepTalkingLine: "i wasn't expecting to want to but... keep talking?",
    },
    llmSystemPrompt: `${PARTNER_BASE_PROMPT}

YOUR PERSONA — Devon, 23, grad student at Seattle University, 1.2 miles away.
You recently deleted Tinder and Hinge after months of dead-end chats and you're a little burned out and guarded. You're here because a friend recommended ISO. You have dry humor and warm up quickly once you sense the other person is genuine. You've lived abroad, you're into films. The shared ice-breaker is: "What made you finally try this app?" You're on the fence about keeping talking — you'll say yes if there's real chemistry, otherwise you'll gently decline.`,
  },

  {
    id: "p_priya",
    name: "Priya",
    age: 20,
    campus: "University of Washington",
    distanceMi: 0.2,
    initial: "P",
    avatarColor: "#F6B34B",
    segment: "safety-first",
    prompts: [
      { label: "Ideal first conversation", answer: "Low pressure, actually funny, and nobody's weird about it." },
      { label: "I'm looking for", answer: "Verified humans only. The .edu thing is why I'm here." },
      { label: "Two truths and a lie", answer: "I'm pre-med, I can juggle, I've never had coffee." },
    ],
    iceBreaker: "Best study spot on campus — go.",
    vibe: "Friendly but reads the room; values feeling safe. Playful once comfortable.",
    keepTalkingDefault: "yes",
    scripted: {
      opener: "controversial pick but the top floor of the library at 11pm >>> everywhere. defend your answer",
      replies: [
        "ok respect, that's a solid pick too",
        "the fact that everyone here is actually verified is such a relief tbh",
        "haha ok you passed the vibe check",
        "juggling was true. i'm a woman of many useless talents.",
        "this is nice. genuinely.",
      ],
      keepTalkingLine: "you're good company. keep talking?",
    },
    llmSystemPrompt: `${PARTNER_BASE_PROMPT}

YOUR PERSONA — Priya, 20, sophomore (pre-med) at University of Washington, 0.2 miles away.
You're friendly but you value feeling safe online — the .edu verification is a big part of why you trust ISO. You read the room and warm up once you're comfortable, then you're playful. You can juggle, you've somehow never had coffee. The shared ice-breaker is: "Best study spot on campus — go." You lean toward wanting to keep talking when the conversation feels easy and respectful.`,
  },

  {
    id: "p_theo",
    name: "Theo",
    age: 24,
    campus: "UW Bothell",
    distanceMi: 3.8,
    initial: "T",
    avatarColor: "#6B4A2A",
    segment: "intentional",
    prompts: [
      { label: "Ideal first conversation", answer: "Tangents welcome. I want to see where a conversation actually goes." },
      { label: "I'm looking for", answer: "Something intentional. I'm not here to collect people." },
      { label: "Two truths and a lie", answer: "I build synths, I'm scared of birds, I've been on TV." },
    ],
    iceBreaker: "What's a tiny thing you're weirdly passionate about?",
    vibe: "Thoughtful, a bit nerdy, asks good follow-ups. Slow-burn charming.",
    keepTalkingDefault: "yes",
    scripted: {
      opener: "the specific pleasure of a perfectly organized cable drawer. genuinely. you?",
      replies: [
        "ok that's an elite answer, i'm invested now",
        "i like that you actually answered instead of 'idk lol'",
        "wait say more about that",
        "birds. birds were the lie— no wait, birds are real and terrifying. the lie was the TV.",
        "i could do this for a while honestly",
      ],
      keepTalkingLine: "i don't want to hit the queue again yet. keep talking?",
    },
    llmSystemPrompt: `${PARTNER_BASE_PROMPT}

YOUR PERSONA — Theo, 24, senior at UW Bothell, 3.8 miles away.
You're thoughtful, a little nerdy, and you ask good follow-up questions. You're intentional about dating and like that ISO won't let you juggle people. You build modular synths, you're irrationally afraid of birds. The shared ice-breaker is: "What's a tiny thing you're weirdly passionate about?" You're a slow-burn charmer and generally want to keep talking when the conversation has depth.`,
  },

  {
    id: "p_sam",
    name: "Sam",
    age: 22,
    campus: "University of Washington",
    distanceMi: 0.7,
    initial: "S",
    avatarColor: "#8A4A12",
    segment: "burned-out",
    prompts: [
      { label: "Ideal first conversation", answer: "One that ends with 'we should actually do that.'" },
      { label: "I'm looking for", answer: "Less texting, more meeting. Prove me wrong about apps." },
      { label: "Two truths and a lie", answer: "I bake sourdough, I hate the beach, I've met my celebrity crush." },
    ],
    iceBreaker: "Coffee, walk, or something weirder for a first hang?",
    vibe: "Direct, a bit impatient with small talk, wants momentum toward a real date.",
    keepTalkingDefault: "random",
    scripted: {
      opener: "something weirder, obviously. i'll trade you: mini golf or a bad museum. you pick",
      replies: [
        "see, decisive. i like it",
        "ok you're not boring, that's a green flag",
        "i'm allergic to the two-week pen-pal thing so this is refreshing",
        "beach was the lie, i love the beach, i'm a fraud",
        "so when are we actually doing the mini golf",
      ],
      keepTalkingLine: "ok i'm in, keep talking — but we're planning something real soon",
    },
    llmSystemPrompt: `${PARTNER_BASE_PROMPT}

YOUR PERSONA — Sam, 22, junior at University of Washington, 0.7 miles away.
You're direct and a little impatient with small talk; you're burned out on endless texting and want momentum toward an actual date. You bake sourdough, you secretly love the beach. The shared ice-breaker is: "Coffee, walk, or something weirder for a first hang?" You'll want to keep talking if there's energy, but you'll gently bail if it feels like it's going nowhere — and you tend to steer toward making a real plan.`,
  },
];

// ----------------------------------------------------------------------------
// Seeded history — populates Trend, Recap, and Memories on first run
// (Reflection scores are PRIVATE and about the experience, never a person ranking.)
// ----------------------------------------------------------------------------

export const seedHistory: PastConversation[] = [
  { id: "h1", personaId: "p_theo",  daysAgo: 34, mutualContinued: true,  satisfaction: 5, tags: ["easy", "made me laugh", "curious"], outcome: "met",     archived: true },
  { id: "h2", personaId: "p_devon", daysAgo: 28, mutualContinued: false, satisfaction: 2, tags: ["felt off"],                            outcome: "none",    archived: false },
  { id: "h3", personaId: "p_priya", daysAgo: 21, mutualContinued: true,  satisfaction: 4, tags: ["safe", "kind"],                        outcome: "not_yet", archived: true },
  { id: "h4", personaId: "p_sam",   daysAgo: 14, mutualContinued: false, satisfaction: 3, tags: ["rushed"],                             outcome: "none",    archived: false },
  { id: "h5", personaId: "p_maya",  daysAgo: 9,  mutualContinued: true,  satisfaction: 5, tags: ["spark", "made me laugh"],             outcome: "not_yet", archived: true },
  { id: "h6", personaId: "p_theo",  daysAgo: 3,  mutualContinued: true,  satisfaction: 4, tags: ["thoughtful"],                         outcome: "none",    archived: true },
];

/**
 * Insight strings the Trend view can surface (private, constructive, never ranking people).
 * Pick based on the tags above; these are examples the UI can rotate through.
 */
export const seedInsights: string[] = [
  "You tend to click most when the conversation opens with a real question.",
  "Your best conversations this month were the ones that ran long — presence is your thing.",
  "You've felt happiest after chats tagged 'made me laugh.' Lead with humor.",
];

// ----------------------------------------------------------------------------
// Revival seed — one past conversation that was great and is BLIND-mutual,
// so a forced revival (via ?debug) can route into a fresh live room.
// One slot only; respects flag-decay (this one is still within its window).
// ----------------------------------------------------------------------------

export const revivalSeed = {
  personaId: "p_maya",          // the "one that got away"
  originalConversationId: "h5",
  userFlagged: true,            // the demo user privately flagged this one
  partnerFlagged: true,         // partner INDEPENDENTLY flagged too -> blind mutual
  cooldownElapsed: true,
  daysSinceOriginal: 9,
  // On mutual + free + cooldown, offer screen 28 -> fresh live room via the normal loop.
  offerCopy: "A spark worth revisiting?",
};

// ----------------------------------------------------------------------------
// Demo defaults (the ?debug panel can override these at runtime)
// ----------------------------------------------------------------------------

export const demoDefaults = {
  onlineNearby: 1204,           // live count on Home/Queue
  matchDelayMsRange: [2000, 6000] as [number, number],
  forceNoMatch: false,          // flip to demo screen 14
  partnerMode: "scripted" as "scripted" | "llm",
  burnoutNudgeAfterN: 3,        // low-satisfaction convos in a session before "take a break?"
  replyTimerSeconds: 40,        // gentle per-turn timer (presence, not punishment)
};

import type { PartnerContext, PartnerEngine } from "./types";
import { scriptedEngine } from "./scripted";

/**
 * LLM partner via the Vite dev-server proxy (/api/partner). The proxy injects
 * ANTHROPIC_API_KEY server-side; no key ever appears in browser code. Any
 * failure (no key, network, upstream error) falls back to the scripted
 * engine silently — the demo must never break (APPROVED_PLAN.md §D2).
 */

async function callProxy(ctx: PartnerContext, kickoff?: string): Promise<string> {
  const turns = ctx.history.map((t) => ({
    role: t.from === "me" ? "user" : "assistant",
    content: t.text,
  }));
  if (kickoff) turns.push({ role: "user", content: kickoff });

  const res = await fetch("/api/partner", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ system: ctx.persona.llmSystemPrompt, messages: turns }),
  });
  if (!res.ok) throw new Error(`partner proxy ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.content?.[0]?.text;
  if (!text) throw new Error("empty partner reply");
  return text.trim();
}

export const llmEngine: PartnerEngine = {
  async opener(ctx) {
    try {
      return await callProxy(ctx, "(You matched just now. Send your opening message — you go first. Just the message text.)");
    } catch {
      return scriptedEngine.opener(ctx);
    }
  },
  async reply(ctx) {
    try {
      return await callProxy(ctx);
    } catch {
      return scriptedEngine.reply(ctx);
    }
  },
};

export function getEngine(mode: "scripted" | "llm"): PartnerEngine {
  return mode === "llm" ? llmEngine : scriptedEngine;
}

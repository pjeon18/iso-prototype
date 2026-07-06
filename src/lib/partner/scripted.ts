import type { PartnerContext, PartnerEngine } from "./types";

/**
 * Scripted persona engine — rotates through the persona's canned replies in
 * order so a demo conversation reads coherently, then loops with slight
 * variation so it never dead-ends.
 */
export const scriptedEngine: PartnerEngine = {
  async opener(ctx: PartnerContext) {
    return ctx.persona.scripted.opener;
  },
  async reply(ctx: PartnerContext) {
    const { replies } = ctx.persona.scripted;
    const partnerCount = ctx.history.filter((t) => t.from === "partner").length;
    // partnerCount includes the opener, so replies start at index 0.
    const i = Math.max(0, partnerCount - 1);
    if (i < replies.length) return replies[i];
    const wrap = replies[i % replies.length];
    return i % 2 === 0 ? wrap : `${wrap} (ok but actually — tell me more)`;
  },
};

import type { Persona } from "../../data/seedData";

export interface PartnerTurn {
  from: "me" | "partner";
  text: string;
}

export interface PartnerContext {
  persona: Persona;
  /** Full conversation so far, oldest first (system lines excluded). */
  history: PartnerTurn[];
}

/**
 * Common interface for the simulated partner (APPROVED_PLAN.md §B).
 * `scripted` always works offline; `llm` calls the dev proxy and the caller
 * falls back to scripted silently on any failure.
 */
export interface PartnerEngine {
  opener(ctx: PartnerContext): Promise<string>;
  reply(ctx: PartnerContext): Promise<string>;
}

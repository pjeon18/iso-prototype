import { personas, type Persona, demoDefaults } from "../data/seedData";
import { rand } from "./time";

/**
 * Mock matchmaker (build spec §4.1): randomized 2–6s search, forced no-match
 * via debug, personas drawn from seed data. Blocked personas never surface.
 */

export function pickPersona(opts: {
  overrideId?: string | null;
  blocked: string[];
  lastPersonaId?: string | null;
}): Persona {
  const { overrideId, blocked, lastPersonaId } = opts;
  const eligible = personas.filter((p) => !blocked.includes(p.id));
  if (overrideId) {
    const forced = eligible.find((p) => p.id === overrideId);
    if (forced) return forced;
  }
  // Avoid immediately re-drawing the same person when possible.
  const fresh = eligible.filter((p) => p.id !== lastPersonaId);
  const pool = fresh.length > 0 ? fresh : eligible.length > 0 ? eligible : personas;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function searchDelayMs(): number {
  const [lo, hi] = demoDefaults.matchDelayMsRange;
  return rand(lo, hi);
}

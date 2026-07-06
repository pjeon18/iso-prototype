import type { Persona } from "../data/seedData";

/** Initial-on-color avatar (no image dependencies, per seed data). */
export function Avatar({
  persona,
  size = 48,
  ring = false,
}: {
  persona: Pick<Persona, "initial" | "avatarColor" | "name">;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      aria-label={persona.name}
      className="rounded-full flex items-center justify-center font-display font-semibold text-white flex-none select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: persona.avatarColor,
        boxShadow: ring
          ? `0 0 0 3px var(--iso-bg), 0 0 0 5.5px var(--iso-accent-soft)`
          : undefined,
      }}
    >
      {persona.initial}
    </div>
  );
}

export function MeAvatar({ size = 48 }: { size?: number }) {
  return (
    <Avatar
      persona={{ initial: "A", avatarColor: "#6B4A2A", name: "Alex" }}
      size={size}
    />
  );
}

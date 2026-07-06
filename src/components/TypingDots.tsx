export function TypingDots() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md"
      style={{ background: "var(--iso-surface)", border: "1px solid rgba(90,52,24,0.08)" }}
    >
      <span className="tdot" />
      <span className="tdot" />
      <span className="tdot" />
    </div>
  );
}

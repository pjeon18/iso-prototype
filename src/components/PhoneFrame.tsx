import type { ReactNode } from "react";

/** Desktop demo shell: a ~390px phone frame; full-bleed on small screens. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk">
      <div className="phone">{children}</div>
    </div>
  );
}

/** 9:41 status bar convention from the wireframe kit. */
export function StatusBar({
  right,
  light = false,
}: {
  right?: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 pt-4 pb-1 text-[13px] font-semibold flex-none"
      style={{ color: light ? "rgba(255,255,255,0.92)" : "var(--iso-text-2)" }}
    >
      <span>9:41</span>
      <span className="text-[12px] font-display tracking-wide">{right}</span>
    </div>
  );
}

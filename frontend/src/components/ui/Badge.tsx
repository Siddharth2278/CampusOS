import { ReactNode } from "react";

const tones = {
  neutral: "bg-slate-tint text-ink-soft",
  brass: "bg-brass-tint text-brass",
  maroon: "bg-maroon-tint text-maroon",
  green: "bg-moss-tint text-moss",
  red: "bg-brick-tint text-brick",
  amber: "bg-gold-tint text-gold",
  // Legacy tone names kept so existing call sites (indigo/neutral/etc.)
  // still resolve to a sensible token without touching every page.
  indigo: "bg-brass-tint text-brass",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

import { ReactNode } from "react";

// Soft pastel pills with borders, matching the design spec:
// Success (emerald), Pending (amber), Danger (rose), Info (blue).
const tones = {
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  brass: "bg-blue-50 text-blue-700 border border-blue-200",
  maroon: "bg-rose-50 text-rose-700 border border-rose-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  red: "bg-rose-50 text-rose-700 border border-rose-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  // Legacy tone names kept so existing call sites (indigo/neutral/etc.)
  // still resolve to a sensible token without touching every page.
  indigo: "bg-blue-50 text-blue-700 border border-blue-200",
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

import { ReactNode } from "react";

const tones = {
  neutral: "bg-slate-tint text-slate border border-slate/20",
  brass: "bg-brass-tint text-brass border border-brass/20",
  maroon: "bg-maroon-tint text-maroon border border-maroon/20",
  green: "bg-moss-tint text-moss border border-moss/20",
  red: "bg-brick-tint text-brick border border-brick/20",
  amber: "bg-gold-tint text-gold border border-gold/20",
  indigo: "bg-brass-tint text-brass border border-brass/20", 
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones; }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}
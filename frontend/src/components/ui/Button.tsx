import { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-brass text-white shadow-sm hover:bg-brass-light",
  secondary: "border border-hairline bg-white text-ink hover:border-slate-300 hover:bg-slate-50 shadow-sm",
  ghost: "text-slate hover:bg-slate-tint hover:text-ink",
  danger: "bg-brick-tint text-brick hover:bg-brick hover:text-white transition-colors",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  fullWidth?: boolean;
};

export function Button({ variant = "primary", fullWidth, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[.985] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    />
  );
}
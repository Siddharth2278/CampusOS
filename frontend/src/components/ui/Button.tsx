import { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-[#f3f3ef] text-[#090a09] shadow-[0_12px_30px_rgba(255,255,255,.05)] hover:bg-white hover:shadow-[0_18px_38px_rgba(255,255,255,.08)]",
  secondary:
    "border border-[#323830] bg-transparent text-ink hover:border-[#8f86ec] hover:bg-[#111411]",
  ghost:
    "text-ink-soft hover:bg-white/[.03] hover:text-ink",
  danger:
    "border border-[#713142] bg-[#241217] text-[#ffadba] hover:bg-[#30171e]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[4px] px-4 py-2.5 text-xs font-black uppercase tracking-[.1em] transition-all duration-300 active:scale-[.985] disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    />
  );
}

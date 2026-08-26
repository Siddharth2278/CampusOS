import { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brass text-white shadow-sm hover:bg-brass-light",
  secondary:
    "border border-hairline bg-transparent text-ink hover:border-brass hover:bg-brass-tint",
  ghost:
    "text-ink-soft hover:bg-slate-tint hover:text-ink",
  danger:
    "border border-brick/25 bg-brick-tint text-brick hover:bg-brick/10",
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
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[.985] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    />
  );
}

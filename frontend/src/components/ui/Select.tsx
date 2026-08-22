import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <select
        id={selectId}
        className={[
          "block w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:bg-paper disabled:text-slate",
          error ? "border-brick focus:border-brick focus:ring-brick/20" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-brick">{error}</p> : null}
    </div>
  );
}

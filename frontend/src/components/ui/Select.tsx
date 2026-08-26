import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; };

export function Select({ label, error, id, className = "", children, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-semibold text-slate">
        {label}
      </label>
      <select
        id={selectId}
        className={[
          "block w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink",
          "transition-all duration-200 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:bg-slate-tint disabled:text-slate",
          error ? "border-brick focus:border-brick focus:ring-brick/20" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm font-medium text-brick mt-1">{error}</p> : null}
    </div>
  );
}
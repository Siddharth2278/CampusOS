import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={areaId} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <textarea
        id={areaId}
        rows={4}
        className={[
          "block w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20",
          error ? "border-brick focus:border-brick focus:ring-brick/20" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <p className="text-sm text-brick">{error}</p> : null}
    </div>
  );
}

import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; };

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={areaId} className="block text-sm font-semibold text-slate">
        {label}
      </label>
      <textarea
        id={areaId}
        rows={4}
        className={[
          "block w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink placeholder:text-slate/60",
          "transition-all duration-200 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20",
          error ? "border-brick focus:border-brick focus:ring-brick/20" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <p className="text-sm font-medium text-brick mt-1">{error}</p> : null}
    </div>
  );
}
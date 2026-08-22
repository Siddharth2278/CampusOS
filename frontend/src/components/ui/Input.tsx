import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label:string; error?:string; };

export function Input({label,error,id,className="",...props}:InputProps){
  const inputId=id??label.toLowerCase().replace(/\s+/g,"-");
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-[10px] font-bold uppercase tracking-[.16em] text-slate">{label}</label>
      <input
        id={inputId}
        suppressHydrationWarning
        className={[
          "block w-full rounded-[4px] border border-[#242923] bg-[#0a0d0a] px-4 py-3 text-sm text-ink placeholder:text-slate/60",
          "transition-all duration-200 focus:border-brass focus:outline-none focus:ring-4 focus:ring-brass/10 focus:bg-white/[.05]",
          error ? "border-brick focus:border-brick focus:ring-brick/10" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <p className="text-sm font-medium text-brick">{error}</p> : null}
    </div>
  );
}

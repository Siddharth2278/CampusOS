import { ReactNode } from "react";

export function Card({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="campus-card p-5 sm:p-7 lg:p-8">
      {(title || description || action) ? (
        <div className="mb-7">
          <div className="flex items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-slate">/ campusOS</p>
              {title ? <h2 className="text-2xl font-black tracking-[-.04em] text-ink">{title}</h2> : null}
              {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">{description}</p> : null}
            </div>
            {action}
          </div>
          <div className="campus-editorial-rule mt-5" />
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="campus-card campus-reveal p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate">{label}</p>
      <p className="mt-4 text-4xl font-black tracking-[-.06em] text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate">{hint}</p> : null}
    </div>
  );
}

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
    <section className="campus-card p-6 lg:p-8 campus-reveal">
      {(title || description || action) ? (
        <div className="mb-6 border-b border-hairline pb-4 flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            {title ? <h2 className="text-xl font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string; }) {
  return (
    <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">{label}</p>
      <p className="text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="text-xs text-ink-soft mt-2">{hint}</p> : null}
    </div>
  );
}
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
    <section className="campus-card p-5 sm:p-6">
      {(title || description || action) ? (
        <div className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              {title ? <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2> : null}
              {description ? <p className="mt-1 max-w-2xl text-sm text-ink-soft">{description}</p> : null}
            </div>
            {action}
          </div>
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
    <div className="campus-card p-5">
      <div className="mb-3 h-1 w-8 rounded-full bg-brass" />
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

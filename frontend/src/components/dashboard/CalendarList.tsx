import type { AcademicCalendarEntry } from "@/lib/types";

function formatDate(date: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function CalendarList({
  entries,
  emptyMessage = "No upcoming events.",
}: {
  entries: AcademicCalendarEntry[];
  emptyMessage?: string;
}) {
  if (!entries.length) {
    return (
      <p className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-slate">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border border-slate-tint bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brass-tint px-2.5 py-1 text-xs font-medium text-brass">
              {entry.type}
            </span>
            <span className="text-xs text-slate">{formatDate(entry.eventDate)}</span>
          </div>
          <h3 className="mt-2 font-semibold text-ink">{entry.title}</h3>
          {entry.description ? (
            <p className="mt-1 text-sm text-slate">{entry.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate">
            {entry.venue ? `${entry.venue} · ` : ""}
            {entry.startTime?.slice(0, 5)}
            {entry.endTime ? ` – ${entry.endTime.slice(0, 5)}` : ""}
          </p>
        </article>
      ))}
    </div>
  );
}

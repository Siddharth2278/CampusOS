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
      <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
        <p className="text-sm font-medium text-slate">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border border-hairline bg-paper/50 p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brass shadow-sm">
              {entry.type}
            </span>
            <span className="text-xs font-semibold text-slate uppercase tracking-wider">
              {formatDate(entry.eventDate)}
            </span>
          </div>
          
          <h3 className="font-semibold text-ink text-base mt-3">{entry.title}</h3>
          
          {entry.description ? (
            <p className="mt-1 text-sm text-ink-soft leading-relaxed line-clamp-2">{entry.description}</p>
          ) : null}
          
          <div className="mt-4 pt-3 border-t border-hairline/60 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate">
            {entry.venue ? <span className="flex items-center gap-1">📍 {entry.venue}</span> : null}
            {(entry.startTime || entry.endTime) ? (
              <span className="flex items-center gap-1">
                🕒 {entry.startTime?.slice(0, 5) || "TBD"} {entry.endTime ? `– ${entry.endTime.slice(0, 5)}` : ""}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
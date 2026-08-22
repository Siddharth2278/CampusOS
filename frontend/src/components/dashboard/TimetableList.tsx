import type { TimetableEntry } from "@/lib/types";

function formatTime(time: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

export function TimetableList({
  entries,
  emptyMessage = "No classes scheduled for today.",
}: {
  entries: TimetableEntry[];
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
          className="flex flex-col gap-3 rounded-xl border border-slate-tint bg-paper/80 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-ink">{entry.subject}</p>
            <p className="mt-1 text-sm text-slate">
              {entry.teacher} · {entry.sessionType}
            </p>
          </div>
          <div className="text-sm text-ink-soft">
            <p>
              {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
            </p>
            <p className="text-slate">Lecture {entry.lectureNumber}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

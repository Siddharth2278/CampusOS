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
          className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="font-semibold text-ink text-base">{entry.subject}</p>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${entry.sessionType === "PRACTICAL" ? "bg-moss-tint text-moss border border-moss/20" : "bg-brass-tint text-brass border border-brass/20"}`}>
                {entry.sessionType === "PRACTICAL" ? "Lab" : "Lec"}
              </span>
            </div>
            <p className="text-xs font-medium text-ink-soft mt-1.5">
              👨‍🏫 {entry.teacher}
            </p>
          </div>
          
          <div className="flex flex-col sm:items-end mt-3 sm:mt-0">
            <p className="text-sm font-medium text-ink bg-white px-4 py-2 rounded-lg border border-hairline shadow-sm whitespace-nowrap">
              🕒 {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate mt-2 sm:mr-2">
              Lecture {entry.lectureNumber}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
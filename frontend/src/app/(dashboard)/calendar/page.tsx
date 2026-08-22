"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type {
  AcademicCalendarEntry,
  CalendarType,
  Department,
  EventAudience,
} from "@/lib/types";

const CALENDAR_TYPES: CalendarType[] = [
  "EVENT",
  "EXAM",
  "HOLIDAY",
  "WORKSHOP",
  "SEMINAR",
  "PLACEMENT",
  "DEADLINE",
];
const AUDIENCES: EventAudience[] = ["ALL", "HOD", "TEACHER", "STUDENT"];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CalendarPage() {
  const { session } = useAuth();
  // Per the role spec, only the Principal manages/oversees the academic
  // calendar — HOD and Teacher can view it but not create entries.
  const canCreate = session?.role === "PRINCIPAL";

  const [entries, setEntries] = useState<AcademicCalendarEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "EVENT" as CalendarType,
    audience: "ALL" as EventAudience,
    departmentId: "",
    semester: "",
    venue: "",
    eventDate: "",
    startTime: "",
    endTime: "",
  });

  function load() {
    const fetcher =
      session?.role === "STUDENT" && session.departmentId && session.semester
        ? () => api.getStudentCalendar(session.departmentId!, session.semester!)
        : session?.role === "TEACHER" && session.departmentId
          ? () => api.getTeacherCalendar(session.departmentId!)
          : api.getAllCalendar;

    fetcher()
      .then(setEntries)
      .catch(() => setError("Unable to load the academic calendar."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    api.getDepartments().then(setDepartments).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!session?.userId || !form.title || !form.eventDate) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.createCalendarEvent({
        title: form.title,
        description: form.description,
        type: form.type,
        audience: form.audience,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        semester: form.semester ? Number(form.semester) : undefined,
        venue: form.venue,
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        createdByUserId: session?.userId,
      });
      setMessage("Event added to the calendar.");
      setForm({
        title: "",
        description: "",
        type: "EVENT",
        audience: "ALL",
        departmentId: "",
        semester: "",
        venue: "",
        eventDate: "",
        startTime: "",
        endTime: "",
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add event.");
    } finally {
      setSubmitting(false);
    }
  }

  const upcoming = [...entries].sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Academic calendar</h1>
          <p className="mt-1 text-sm text-slate">
            Campus-wide events, holidays, and deadlines.
          </p>
        </div>

        <Card title="Upcoming">
          {loading ? (
            <p className="text-sm text-slate">Loading events...</p>
          ) : error ? (
            <p className="text-sm text-brick">{error}</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-slate">No events scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-tint bg-paper/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">{entry.type}</Badge>
                    <span className="text-xs text-slate">
                      {formatDate(entry.eventDate)}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-ink">{entry.title}</p>
                  {entry.description ? (
                    <p className="mt-1 text-sm text-ink-soft">{entry.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate">
                    {entry.venue ? `${entry.venue} · ` : ""}
                    {entry.startTime?.slice(0, 5)}
                    {entry.endTime ? ` – ${entry.endTime.slice(0, 5)}` : ""}
                    {entry.department ? ` · ${entry.department}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {canCreate ? (
          <Card title="Add an event">
            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as CalendarType }))
                  }
                >
                  {CALENDAR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Audience"
                  value={form.audience}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, audience: e.target.value as EventAudience }))
                  }
                >
                  {AUDIENCES.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Department (optional)"
                  value={form.departmentId}
                  onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                >
                  <option value="">All departments</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Semester (optional)"
                  value={form.semester}
                  onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                >
                  <option value="">All semesters</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                label="Venue"
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Date"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                />
                <Input
                  label="Start time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
                <Input
                  label="End time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>

              {message ? <p className="text-sm text-moss">{message}</p> : null}

              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Adding..." : "Add event"}
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
  );
}

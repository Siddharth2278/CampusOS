"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { AcademicCalendarEntry, CalendarType, Department, EventAudience } from "@/lib/types";

const CALENDAR_TYPES: CalendarType[] = ["EVENT", "EXAM", "HOLIDAY", "WORKSHOP", "SEMINAR", "PLACEMENT", "DEADLINE"];
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

function getTypeStyle(type: CalendarType) {
  switch(type) {
    case "HOLIDAY": return "bg-moss-tint text-moss border border-moss/20";
    case "EXAM":
    case "DEADLINE": return "bg-brick-tint text-brick border border-brick/20";
    case "PLACEMENT": return "bg-gold-tint text-gold border border-gold/20";
    default: return "bg-brass-tint text-brass border border-brass/20";
  }
}

export default function CalendarPage() {
  const { session } = useAuth();
  const canCreate = session?.role === "PRINCIPAL";

  const [entries, setEntries] = useState<AcademicCalendarEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", type: "EVENT" as CalendarType, audience: "ALL" as EventAudience,
    departmentId: "", semester: "", venue: "", eventDate: "", startTime: "", endTime: "",
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
  }, []);

  async function handleCreate() {
    if (!session?.userId || !form.title || !form.eventDate) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.createCalendarEvent({
        title: form.title, description: form.description, type: form.type, audience: form.audience,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        semester: form.semester ? Number(form.semester) : undefined,
        venue: form.venue, eventDate: form.eventDate, startTime: form.startTime, endTime: form.endTime,
        createdByUserId: session?.userId,
      });
      setMessage("Event added to the calendar.");
      setForm({ title: "", description: "", type: "EVENT", audience: "ALL", departmentId: "", semester: "", venue: "", eventDate: "", startTime: "", endTime: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add event.");
    } finally {
      setSubmitting(false);
    }
  }

  const upcoming = [...entries].sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="campus-gradient-text pb-1">Academic Calendar</h1>
        <p className="mt-2 text-ink-soft text-base">Campus-wide events, holidays, and deadlines.</p>
      </header>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Upcoming Events</h2>
        
        {loading ? (
          <div className="animate-breathe text-brass font-medium py-4">Loading events...</div>
        ) : error ? (
          <div className="p-4 bg-brick-tint text-brick rounded-xl text-sm font-medium">{error}</div>
        ) : upcoming.length === 0 ? (
          <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
             <p className="text-sm font-medium text-slate">No events scheduled yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcoming.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-hairline bg-white shadow-sm p-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getTypeStyle(entry.type)}`}>
                    {entry.type}
                  </span>
                  <span className="text-xs font-semibold text-slate">
                    {formatDate(entry.eventDate)}
                  </span>
                </div>
                <h3 className="font-semibold text-ink text-lg">{entry.title}</h3>
                {entry.description ? (
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">{entry.description}</p>
                ) : null}
                <div className="mt-4 pt-4 border-t border-hairline/60 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate">
                  {entry.venue ? <span className="flex items-center gap-1">📍 {entry.venue}</span> : null}
                  {(entry.startTime || entry.endTime) ? (
                    <span className="flex items-center gap-1">
                      🕒 {entry.startTime?.slice(0, 5) || "TBD"} {entry.endTime ? `– ${entry.endTime.slice(0, 5)}` : ""}
                    </span>
                  ) : null}
                  {entry.department ? <span>🏛️ {entry.department}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canCreate ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
           <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Add New Event</h2>
          <div className="space-y-5">
            <Input label="Title" placeholder="E.g., Tech Symposium 2026" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea label="Description" placeholder="Event details..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CalendarType }))}>
                {CALENDAR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
              <Select label="Audience" value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as EventAudience }))}>
                {AUDIENCES.map((audience) => <option key={audience} value={audience}>{audience}</option>)}
              </Select>
            </div>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Department (optional)" value={form.departmentId} onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}>
                <option value="">All Departments</option>
                {departments.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
              </Select>
              <Select label="Semester (optional)" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}>
                <option value="">All Semesters</option>
                {SEMESTERS.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
              </Select>
            </div>
            
            <Input label="Venue / Location" placeholder="Main Auditorium" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} />
            
            <div className="grid gap-5 sm:grid-cols-3">
              <Input label="Event Date" type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} />
              <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>

            {error ? <p className="mt-2 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
            {message ? <p className="mt-2 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

            <div className="pt-2">
              <Button onClick={handleCreate} disabled={submitting} className="bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8">
                {submitting ? "Adding..." : "Add Event to Calendar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
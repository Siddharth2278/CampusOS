"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Department, FacultyAssignment, Subject, Teacher, TimetableEntry, WeekDay } from "@/lib/types";

const DAYS: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

function formatTime(time: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

function TimetableGrid({ entries, onDelete }: { entries: TimetableEntry[]; onDelete?: (id: number) => void; }) {
  const byDay = useMemo(() => {
    const map = new Map<WeekDay, TimetableEntry[]>();
    DAYS.forEach((day) => map.set(day, []));
    entries.forEach((entry) => { map.get(entry.day)?.push(entry); });
    map.forEach((list) => list.sort((a, b) => a.lectureNumber - b.lectureNumber));
    return map;
  }, [entries]);

  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {DAYS.map((day) => {
        const dayEntries = byDay.get(day) ?? [];
        return (
          <div key={day} className="rounded-xl border border-hairline bg-paper/50 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate mb-3 border-b border-hairline/60 pb-2">
              {day}
            </h3>
            {dayEntries.length === 0 ? (
              <p className="mt-4 text-xs font-medium text-slate text-center italic">No sessions</p>
            ) : (
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="group relative flex items-start justify-between rounded-lg border border-hairline bg-surface px-4 py-3 shadow-sm hover:border-brass/30 transition-colors">
                    <div>
                      <p className="font-semibold text-ink">{entry.subject}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate uppercase tracking-wider">
                        <span>L{entry.lectureNumber}</span>
                        <span>{formatTime(entry.startTime)} – {formatTime(entry.endTime)}</span>
                        <span className="text-ink-soft truncate max-w-[120px]">{entry.teacher}</span>
                      </div>
                    </div>
                    {onDelete ? (
                      <button onClick={() => onDelete(entry.id)} className="text-slate hover:text-brick transition-colors p-1" aria-label="Remove session">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TimetablePage() {
  const { session } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("1");

  const [form, setForm] = useState({
    day: "MONDAY" as WeekDay, lectureNumber: "1", sessionType: "LECTURE" as "LECTURE" | "PRACTICAL",
    subjectId: "", teacherId: "", startTime: "", endTime: "",
  });

  const canManage = session?.role === "HOD";
  const isTeacherView = session?.role === "TEACHER" || session?.role === "HOD";

  useEffect(() => {
    const canManageNow = session?.role === "HOD";
    Promise.all([
      api.getDepartments(), api.getSubjects(),
      canManageNow ? api.getTeachers() : Promise.resolve([]),
      canManageNow ? api.getFacultyAssignments() : Promise.resolve([]),
    ]).then(([deps, subs, allTeachers, allAssignments]) => {
        setDepartments(deps); setSubjects(subs); setTeachers(allTeachers); setAssignments(allAssignments);
        const initial = session?.departmentId ?? deps[0]?.id;
        setDepartmentId(String(initial ?? ""));
      }).catch(() => setError("Unable to load timetable data.")).finally(() => setLoading(false));
    if (session?.semester) setSemester(String(session.semester));
  }, []);

  async function loadEntries() {
    try {
      if (session?.role === "TEACHER" && session.profileId) {
        setEntries(await api.getTeacherTimetable(session.profileId));
      } else if (semester) {
        setEntries(await api.getWeeklyTimetable(Number(semester)));
      }
    } catch { setEntries([]); }
  }

  useEffect(() => { loadEntries(); }, [semester, session?.profileId]);

  const subjectsInScope = useMemo(() => subjects.filter((s) => String(s.department?.id) === departmentId && s.semester === Number(semester)), [subjects, departmentId, semester]);
  const eligibleTeachers = useMemo(() => {
    if (!form.subjectId) return [];
    const teacherIds = new Set(assignments.filter((a) => String(a.subject?.id) === form.subjectId).map((a) => a.teacher?.id));
    return teachers.filter((t) => teacherIds.has(t.id));
  }, [assignments, teachers, form.subjectId]);

  async function handleCreate() {
    if (!departmentId || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime) return;
    setSubmitting(true); setError(""); setMessage("");
    try {
      await api.createTimetableEntry({
        departmentId: Number(departmentId), semester: Number(semester), day: form.day, lectureNumber: Number(form.lectureNumber),
        sessionType: form.sessionType, subjectId: Number(form.subjectId), teacherId: Number(form.teacherId), startTime: form.startTime, endTime: form.endTime,
      });
      setMessage("Session successfully added.");
      setForm((f) => ({ ...f, subjectId: "", teacherId: "", startTime: "", endTime: "" }));
      loadEntries();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Failed to add session."); } 
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: number) { await api.deleteTimetableEntry(id); loadEntries(); }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-breathe text-brass font-medium">Loading timetable...</div></div>;

  return (
    <div className="campus-page space-y-8 max-w-6xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Timetable</h1>
        <p className="mt-2 text-ink-soft text-base">
          {isTeacherView && session?.role === "TEACHER" ? "Your personal weekly schedule." : "Weekly academic schedule by semester."}
        </p>
      </header>

      {!(session?.role === "TEACHER") ? (
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Filter by Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={session?.role === "STUDENT" || session?.role === "HOD"}>
              {departments.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
            </Select>
            <Select label="Filter by Semester" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={session?.role === "STUDENT"}>
              {SEMESTERS.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
            </Select>
          </div>
        </div>
      ) : null}

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Weekly Schedule</h2>
        {error ? <p className="text-sm font-medium text-brick bg-brick-tint p-4 rounded-lg">{error}</p> : <TimetableGrid entries={entries} onDelete={canManage ? handleDelete : undefined} />}
      </div>

      {canManage ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Add New Session</h2>
          {subjectsInScope.length === 0 ? (
            <p className="text-sm font-medium text-slate">No subjects found for this department and semester.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Select label="Day of Week" value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value as WeekDay }))}>
                  {DAYS.map((day) => <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>)}
                </Select>
                <Input label="Lecture Number" type="number" min={1} value={form.lectureNumber} onChange={(e) => setForm((f) => ({ ...f, lectureNumber: e.target.value }))} />
                <Select label="Session Type" value={form.sessionType} onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value as "LECTURE" | "PRACTICAL" }))}>
                  <option value="LECTURE">Lecture</option>
                  <option value="PRACTICAL">Practical</option>
                </Select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select label="Subject" value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value, teacherId: "" }))}>
                  <option value="">Select subject</option>
                  {subjectsInScope.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </Select>
                <Select label="Teacher" value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))} disabled={!form.subjectId}>
                  <option value="">{form.subjectId ? "Select teacher" : "Select a subject first"}</option>
                  {eligibleTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>)}
                </Select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>

              {message ? <p className="mt-4 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

              <Button className="mt-2 bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8" onClick={handleCreate} disabled={submitting}>
                {submitting ? "Adding..." : "Add Session to Timetable"}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
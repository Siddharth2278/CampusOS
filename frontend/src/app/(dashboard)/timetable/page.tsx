"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  Department,
  FacultyAssignment,
  Subject,
  Teacher,
  TimetableEntry,
  WeekDay,
} from "@/lib/types";

const DAYS: WeekDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

function formatTime(time: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

function TimetableGrid({
  entries,
  onDelete,
}: {
  entries: TimetableEntry[];
  onDelete?: (id: number) => void;
}) {
  const byDay = useMemo(() => {
    const map = new Map<WeekDay, TimetableEntry[]>();
    DAYS.forEach((day) => map.set(day, []));
    entries.forEach((entry) => {
      map.get(entry.day)?.push(entry);
    });
    map.forEach((list) => list.sort((a, b) => a.lectureNumber - b.lectureNumber));
    return map;
  }, [entries]);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {DAYS.map((day) => {
        const dayEntries = byDay.get(day) ?? [];
        return (
          <div key={day} className="rounded-xl border border-slate-tint bg-paper/80 p-4">
            <p className="text-sm font-semibold text-ink">
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </p>
            {dayEntries.length === 0 ? (
              <p className="mt-2 text-xs text-slate">No sessions</p>
            ) : (
              <div className="mt-2 space-y-2">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-ink">{entry.subject}</p>
                      <p className="text-slate">
                        L{entry.lectureNumber} · {formatTime(entry.startTime)}–
                        {formatTime(entry.endTime)} · {entry.teacher}
                      </p>
                    </div>
                    {onDelete ? (
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="ml-2 text-brick hover:text-brick"
                        aria-label="Remove session"
                      >
                        ×
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
    day: "MONDAY" as WeekDay,
    lectureNumber: "1",
    sessionType: "LECTURE" as "LECTURE" | "PRACTICAL",
    subjectId: "",
    teacherId: "",
    startTime: "",
    endTime: "",
  });

  const canManage = session?.role === "HOD";
  const isTeacherView = session?.role === "TEACHER" || session?.role === "HOD";

  useEffect(() => {
    const canManageNow = session?.role === "HOD";
    Promise.all([
      api.getDepartments(),
      api.getSubjects(),
      canManageNow ? api.getTeachers() : Promise.resolve([]),
      canManageNow ? api.getFacultyAssignments() : Promise.resolve([]),
    ])
      .then(([deps, subs, allTeachers, allAssignments]) => {
        setDepartments(deps);
        setSubjects(subs);
        setTeachers(allTeachers);
        setAssignments(allAssignments);
        const initial = session?.departmentId ?? deps[0]?.id;
        setDepartmentId(String(initial ?? ""));
      })
      .catch(() => setError("Unable to load timetable data."))
      .finally(() => setLoading(false));
    if (session?.semester) setSemester(String(session.semester));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEntries() {
    try {
      if (session?.role === "TEACHER" && session.profileId) {
        setEntries(await api.getTeacherTimetable(session.profileId));
      } else if (semester) {
        setEntries(await api.getWeeklyTimetable(Number(semester)));
      }
    } catch {
      setEntries([]);
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, session?.profileId]);

  const subjectsInScope = useMemo(
    () =>
      subjects.filter(
        (s) => String(s.department?.id) === departmentId && s.semester === Number(semester),
      ),
    [subjects, departmentId, semester],
  );

  const eligibleTeachers = useMemo(() => {
    if (!form.subjectId) return [];
    const teacherIds = new Set(
      assignments
        .filter((a) => String(a.subject?.id) === form.subjectId)
        .map((a) => a.teacher?.id),
    );
    return teachers.filter((t) => teacherIds.has(t.id));
  }, [assignments, teachers, form.subjectId]);

  async function handleCreate() {
    if (!departmentId || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime)
      return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.createTimetableEntry({
        departmentId: Number(departmentId),
        semester: Number(semester),
        day: form.day,
        lectureNumber: Number(form.lectureNumber),
        sessionType: form.sessionType,
        subjectId: Number(form.subjectId),
        teacherId: Number(form.teacherId),
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setMessage("Session added.");
      setForm((f) => ({ ...f, subjectId: "", teacherId: "", startTime: "", endTime: "" }));
      loadEntries();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add session.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await api.deleteTimetableEntry(id);
    loadEntries();
  }

  if (loading) return <p className="text-sm text-slate">Loading timetable...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Timetable</h1>
        <p className="mt-1 text-sm text-slate">
          {isTeacherView && session?.role === "TEACHER"
            ? "Your personal weekly schedule."
            : "Weekly schedule by semester."}
        </p>
      </div>

      {!(session?.role === "TEACHER") ? (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={session?.role === "STUDENT" || session?.role === "HOD"}
            >
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </Select>
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={session?.role === "STUDENT"}
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      ) : null}

      <Card title="Weekly schedule">
        {error ? (
          <p className="text-sm text-brick">{error}</p>
        ) : (
          <TimetableGrid entries={entries} onDelete={canManage ? handleDelete : undefined} />
        )}
      </Card>

      {canManage ? (
        <Card title="Add a session">
          {subjectsInScope.length === 0 ? (
            <p className="text-sm text-slate">
              No subjects found for this department and semester.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Select
                  label="Day"
                  value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: e.target.value as WeekDay }))}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Lecture number"
                  type="number"
                  min={1}
                  value={form.lectureNumber}
                  onChange={(e) => setForm((f) => ({ ...f, lectureNumber: e.target.value }))}
                />
                <Select
                  label="Session type"
                  value={form.sessionType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sessionType: e.target.value as "LECTURE" | "PRACTICAL",
                    }))
                  }
                >
                  <option value="LECTURE">Lecture</option>
                  <option value="PRACTICAL">Practical</option>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Subject"
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subjectId: e.target.value, teacherId: "" }))
                  }
                >
                  <option value="">Select subject</option>
                  {subjectsInScope.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Teacher"
                  value={form.teacherId}
                  onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                  disabled={!form.subjectId}
                >
                  <option value="">
                    {form.subjectId ? "Select teacher" : "Select a subject first"}
                  </option>
                  {eligibleTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                {submitting ? "Adding..." : "Add session"}
              </Button>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

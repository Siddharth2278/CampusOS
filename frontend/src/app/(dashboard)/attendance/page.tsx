"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type {
  AttendanceItem,
  AttendanceRecord,
  FacultyAssignment,
  Student,
  Subject,
} from "@/lib/types";

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function StudentAttendance({ studentId }: { studentId: number }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStudentAttendance(studentId)
      .then(setRecords)
      .catch(() => setError("Unable to load attendance history."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const percentage = total ? ((present / total) * 100).toFixed(1) : "0.0";

  const bySubject = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    records.forEach((record) => {
      const key = record.subject?.name ?? "Unknown subject";
      const entry = map.get(key) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (record.status === "PRESENT") entry.present += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries());
  }, [records]);

  if (loading) return <p className="text-sm text-slate">Loading attendance...</p>;
  if (error)
    return (
      <div className="rounded-xl border border-brick/30 bg-brick-tint p-6 text-sm text-brick">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate">Overall attendance</p>
          <p className="mt-2 text-3xl font-bold text-ink">{percentage}%</p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate">Lectures attended</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {present}/{total}
          </p>
        </div>
      </div>

      <Card title="By subject">
        {bySubject.length === 0 ? (
          <p className="text-sm text-slate">No attendance recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {bySubject.map(([subject, stat]) => (
              <div
                key={subject}
                className="flex items-center justify-between rounded-xl border border-slate-tint bg-paper/80 px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink">{subject}</span>
                <span className="text-slate">
                  {stat.present}/{stat.total} ·{" "}
                  {((stat.present / stat.total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Recent lectures">
        {records.length === 0 ? (
          <p className="text-sm text-slate">No records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Lecture</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-tint">
                {[...records]
                  .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
                  .slice(0, 30)
                  .map((record) => (
                    <tr key={record.id}>
                      <td className="py-2 text-ink-soft">
                        {formatDate(record.attendanceDate)}
                      </td>
                      <td className="py-2 text-ink">{record.subject?.name}</td>
                      <td className="py-2 text-slate">{record.lectureNumber}</td>
                      <td className="py-2">
                        <Badge tone={record.status === "PRESENT" ? "green" : "red"}>
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function TeacherAttendance({ teacherId }: { teacherId: number }) {
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lectureNumber, setLectureNumber] = useState("1");
  const [statuses, setStatuses] = useState<Record<number, "PRESENT" | "ABSENT">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sheet, setSheet] = useState<AttendanceRecord[] | null>(null);

  useEffect(() => {
    Promise.all([api.getMyFacultyAssignments(), api.getStudents()])
      .then(([myAssignments, allStudents]) => {
        setAssignments(myAssignments);
        setStudents(allStudents);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load your subjects."))
      .finally(() => setLoading(false));
  }, [teacherId]);

  const mySubjects = useMemo(
    () => assignments.map((a) => a.subject).filter(Boolean) as Subject[],
    [assignments],
  );

  const selectedSubject = mySubjects.find((s) => String(s.id) === subjectId);

  const rosterStudents = useMemo(() => {
    if (!selectedSubject) return [];
    return students.filter(
      (s) =>
        s.department?.id === selectedSubject.department?.id &&
        s.semester === selectedSubject.semester,
    );
  }, [students, selectedSubject]);

  useEffect(() => {
    const next: Record<number, "PRESENT" | "ABSENT"> = {};
    rosterStudents.forEach((s) => {
      next[s.id] = statuses[s.id] ?? "PRESENT";
    });
    setStatuses(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterStudents]);

  async function handleSubmit() {
    if (!selectedSubject) return;
    setSubmitting(true);
    setMessage("");
    setError("");

    const attendanceItems: AttendanceItem[] = rosterStudents.map((s) => ({
      studentId: s.id,
      status: statuses[s.id] ?? "PRESENT",
    }));

    try {
      await api.markAttendance({
        teacherId,
        subjectId: selectedSubject.id,
        attendanceDate: date,
        lectureNumber: Number(lectureNumber),
        attendanceItems,
      });
      setMessage("Attendance saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save attendance.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadSheet() {
    if (!selectedSubject) return;
    try {
      const records = await api.getAttendanceBySubject(selectedSubject.id, date);
      setSheet(records);
    } catch {
      setSheet([]);
    }
  }

  if (loading) return <p className="text-sm text-slate">Loading your subjects...</p>;

  if (error) {
    return (
      <Card>
        <p className="text-sm text-brick">{error}</p>
      </Card>
    );
  }

  if (mySubjects.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate">
          No subjects are assigned to you yet. Ask your HOD to add a faculty
          assignment before marking attendance.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Mark attendance" description="Pick a subject, date, and lecture number.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Select subject</option>
            {mySubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} · Sem {subject.semester}
              </option>
            ))}
          </Select>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Lecture number"
            type="number"
            min={1}
            value={lectureNumber}
            onChange={(e) => setLectureNumber(e.target.value)}
          />
        </div>

        {selectedSubject ? (
          <div className="mt-6">
            {rosterStudents.length === 0 ? (
              <p className="text-sm text-slate">
                No students found for {selectedSubject.name} (Semester{" "}
                {selectedSubject.semester}).
              </p>
            ) : (
              <div className="space-y-2">
                {rosterStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-xl border border-slate-tint bg-paper/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate">
                        Roll {student.rollNumber} · {student.enrollmentNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(["PRESENT", "ABSENT"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setStatuses((current) => ({
                              ...current,
                              [student.id]: status,
                            }))
                          }
                          className={[
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                            statuses[student.id] === status
                              ? status === "PRESENT"
                                ? "bg-moss text-white"
                                : "bg-brick text-white"
                              : "bg-white text-slate ring-1 ring-hairline",
                          ].join(" ")}
                        >
                          {status === "PRESENT" ? "Present" : "Absent"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error ? <p className="mt-4 text-sm text-brick">{error}</p> : null}
            {message ? <p className="mt-4 text-sm text-moss">{message}</p> : null}

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={submitting || rosterStudents.length === 0}
              >
                {submitting ? "Saving..." : "Save attendance"}
              </Button>
              <Button variant="secondary" onClick={loadSheet}>
                View saved sheet for this date
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      {sheet ? (
        <Card title={`Attendance sheet · ${formatDate(date)}`}>
          {sheet.length === 0 ? (
            <p className="text-sm text-slate">No attendance saved for this date yet.</p>
          ) : (
            <div className="space-y-2">
              {sheet.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-slate-tint px-4 py-2 text-sm"
                >
                  <span className="text-ink-soft">
                    {record.student?.firstName} {record.student?.lastName}
                  </span>
                  <Badge tone={record.status === "PRESENT" ? "green" : "red"}>
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

export default function AttendancePage() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Attendance</h1>
        <p className="mt-1 text-sm text-slate">
          {session?.role === "STUDENT"
            ? "Your attendance record across all subjects."
            : "Mark and review attendance for your subjects."}
        </p>
      </div>

      {session?.role === "STUDENT" && session.profileId ? (
        <StudentAttendance studentId={session.profileId} />
      ) : null}

      {(session?.role === "TEACHER" || session?.role === "HOD") && session.profileId ? (
        <TeacherAttendance teacherId={session.profileId} />
      ) : null}

      {session?.role === "PRINCIPAL" ? (
        <Card>
          <p className="text-sm text-slate">
            Attendance is recorded per subject by teachers. Use the Directory to
            review departments and faculty assignments.
          </p>
        </Card>
      ) : null}

      {(session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD") &&
      !session.profileId ? (
        <Card>
          <p className="text-sm text-gold">
            No linked profile was found for your account, so attendance can&apos;t
            be loaded yet.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

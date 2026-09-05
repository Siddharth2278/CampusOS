"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { downloadAttendanceCSV, downloadAttendanceMatrixCSV } from "@/lib/downloadAttendance";
import type { AttendanceItem, AttendanceRecord, FacultyAssignment, Student, Subject, TimetableEntry } from "@/lib/types";

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const WEEKDAYS_MAP: Record<string, string> = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

function StudentAttendance({ studentId }: { studentId: number }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStudentAttendance(studentId)
      .then(setRecords)
      .catch(() => setError("Unable to load attendance history."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const percentage = total ? ((present / total) * 100) : 0;

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

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading attendance...</div>;
  if (error) return <div className="campus-card bg-brick-tint border-brick/30 p-6 text-sm font-medium text-brick">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="campus-card p-6 lg:p-8 bg-gradient-to-br from-white to-brass-tint/30">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate mb-1">Overall Attendance</p>
          <p className={`text-4xl font-bold ${percentage < 70 ? "text-brick" : "text-ink"}`}>{percentage.toFixed(1)}%</p>
          {percentage < 70 && <p className="text-xs font-semibold text-brick mt-2">Below 70% — Action required</p>}
        </div>
        <div className="campus-card p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate mb-1">Lectures Attended</p>
          <p className="text-4xl font-bold text-ink">{present}<span className="text-2xl text-slate">/{total}</span></p>
        </div>
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Subject Breakdown</h2>
        {bySubject.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No attendance recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {bySubject.map(([subject, stat]) => {
              const pct = (stat.present / stat.total) * 100;
              return (
                <div key={subject} className="flex items-center justify-between rounded-xl border border-hairline bg-paper/50 px-5 py-4">
                  <span className="font-semibold text-ink">{subject}</span>
                  <div className="text-right">
                    <span className={`block text-lg font-bold ${pct < 70 ? "text-brick" : "text-ink"}`}>{pct.toFixed(0)}%</span>
                    <span className="block text-xs font-medium text-slate mt-0.5">{stat.present}/{stat.total} Attended</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Recent Lectures</h2>
        {records.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Lecture</th>
                  <th className="py-3 px-4 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {[...records]
                  .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
                  .slice(0, 30)
                  .map((record) => (
                    <tr key={record.id} className="transition-colors">
                      <td className="py-3 px-4 text-ink-soft font-medium">{formatDate(record.attendanceDate)}</td>
                      <td className="py-3 px-4 text-ink font-medium">{record.subject?.name}</td>
                      <td className="py-3 px-4 text-slate">#{record.lectureNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          record.status === "PRESENT" ? "bg-moss-tint text-moss border border-moss/20" : "bg-brick-tint text-brick border border-brick/20"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherAttendance({ teacherId }: { teacherId: number }) {
  const { session } = useAuth();
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
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
    Promise.all([
      api.getMyFacultyAssignments(),
      api.getStudents(),
      api.getTeacherTimetable(teacherId),
    ])
      .then(([myAssignments, allStudents, timetableEntries]) => {
        setAssignments(myAssignments);
        setStudents(allStudents);
        setTimetable(timetableEntries);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load your subjects."))
      .finally(() => setLoading(false));
  }, [teacherId]);

  const mySubjects = useMemo(() => assignments.map((a) => a.subject).filter(Boolean) as Subject[], [assignments]);
  const selectedSubject = mySubjects.find((s) => String(s.id) === subjectId);

  const rosterStudents = useMemo(() => {
    if (!selectedSubject) return [];
    return students.filter((s) => s.department?.id === selectedSubject.department?.id && s.semester === selectedSubject.semester);
  }, [students, selectedSubject]);

  const selectedDay = WEEKDAYS_MAP[new Date(date).getDay()];

  const hasTimetableSlot = useMemo(() => {
    if (!selectedSubject || !date) return false;
    return timetable.some(
      (t) =>
        t.subject === selectedSubject.name &&
        t.day === selectedDay &&
        t.lectureNumber === Number(lectureNumber)
    );
  }, [selectedSubject, date, lectureNumber, timetable, selectedDay]);

  const canMarkAttendance = hasTimetableSlot && date === new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const next: Record<number, "PRESENT" | "ABSENT"> = {};
    rosterStudents.forEach((s) => {
      next[s.id] = statuses[s.id] ?? "PRESENT";
    });
    setStatuses(next);
  }, [rosterStudents]);

  async function handleSubmit() {
    if (!selectedSubject || !canMarkAttendance) return;
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
      setMessage("Attendance saved successfully.");
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

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading your subjects...</div>;
  if (error) return <div className="campus-card bg-brick-tint border-brick/30 p-6 text-sm font-medium text-brick">{error}</div>;

  if (mySubjects.length === 0) {
    return (
      <div className="campus-card p-8 text-center bg-slate-tint/50 border border-dashed border-slate/30">
        <p className="text-sm font-medium text-slate">No subjects are assigned to you yet. Ask your HOD to add a faculty assignment before marking attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-6 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Mark Attendance</h2>
          <p className="mt-1 text-sm text-ink-soft">Pick a subject, date, and lecture number to begin. Attendance can only be marked if you have a scheduled lecture in the timetable.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject</option>
            {mySubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} · Sem {subject.semester}
              </option>
            ))}
          </Select>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
          <Input label="Lecture Number" type="number" min={1} value={lectureNumber} onChange={(e) => setLectureNumber(e.target.value)} />
        </div>

        {selectedSubject && (
          <div className="mt-4 rounded-xl border border-hairline bg-paper/50 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${canMarkAttendance ? "bg-moss" : "bg-brick"}`} />
              <span className={`text-sm font-semibold ${canMarkAttendance ? "text-moss" : "text-brick"}`}>
                {canMarkAttendance
                  ? `Lecture scheduled — you can mark attendance for ${selectedSubject.name} on ${selectedDay} #${lectureNumber}`
                  : date !== new Date().toISOString().slice(0, 10)
                    ? "Attendance can only be marked or edited for today's date."
                    : `No lecture scheduled for ${selectedSubject.name} on ${selectedDay} #${lectureNumber}. Attendance cannot be marked.`}
              </span>
            </div>
          </div>
        )}

        {selectedSubject ? (
          <div className="mt-8 pt-6 border-t border-hairline">
            {rosterStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
                <p className="text-sm font-medium text-slate">No students found for {selectedSubject.name} (Semester {selectedSubject.semester}).</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2 mb-4">
                  <h3 className="font-semibold text-ink">Class Roster</h3>
                  <span className="text-xs font-medium bg-slate-tint text-slate px-3 py-1 rounded-full">{rosterStudents.length} Students</span>
                </div>

                {rosterStudents.map((student) => (
                  <div key={student.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-white px-5 py-4 shadow-sm hover:border-slate-300 transition-colors">
                    <div>
                      <p className="font-semibold text-ink">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-ink-soft mt-0.5">Roll: <span className="font-medium text-slate">{student.rollNumber}</span> · {student.enrollmentNumber}</p>
                    </div>
                    <div className="flex gap-2 bg-slate-tint p-1 rounded-lg border border-hairline">
                      <button
                        type="button"
                        onClick={() => setStatuses((current) => ({ ...current, [student.id]: "PRESENT" }))}
                        className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                          statuses[student.id] === "PRESENT" ? "bg-moss text-white shadow-sm" : "text-slate hover:text-ink"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatuses((current) => ({ ...current, [student.id]: "ABSENT" }))}
                        className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                          statuses[student.id] === "ABSENT" ? "bg-brick text-white shadow-sm" : "text-slate hover:text-ink"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error ? <p className="mt-6 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
            {message ? <p className="mt-6 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={handleSubmit} disabled={submitting || rosterStudents.length === 0 || !canMarkAttendance} className="bg-brass text-white hover:bg-brass-light px-8">
                {submitting ? "Saving..." : "Save Attendance"}
              </Button>
              <Button variant="secondary" onClick={loadSheet} className="bg-slate-tint text-ink hover:bg-hairline px-6">
                View Saved Sheet
              </Button>
              {sheet && sheet.length > 0 && (
                <Button variant="secondary" onClick={() => downloadAttendanceCSV(sheet, `attendance-${selectedSubject?.name}-${date}.csv`)} className="bg-moss-tint text-moss hover:bg-moss hover:text-white px-6">
                  Download CSV
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {sheet ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Attendance Sheet</h2>
              <p className="mt-1 text-sm text-ink-soft">Recorded for {formatDate(date)}</p>
            </div>
            {sheet.length > 0 && (
              <Button variant="secondary" onClick={() => downloadAttendanceCSV(sheet, `attendance-${selectedSubject?.name}-${date}.csv`)} className="bg-moss-tint text-moss hover:bg-moss hover:text-white text-sm px-4">
                Download CSV
              </Button>
            )}
          </div>

          {sheet.length === 0 ? (
            <p className="text-sm font-medium text-slate text-center py-6">No attendance saved for this date yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {sheet.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-xl border border-hairline bg-paper/50 px-4 py-3">
                  <span className="font-medium text-ink">{record.student?.firstName} {record.student?.lastName}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    record.status === "PRESENT" ? "bg-moss-tint text-moss border border-moss/20" : "bg-brick-tint text-brick border border-brick/20"
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <DownloadReportSection mySubjects={mySubjects} />
    </div>
  );
}

function DownloadReportSection({ mySubjects }: { mySubjects: Subject[] }) {
  const [subjectId, setSubjectId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const maxDate = new Date().toISOString().slice(0, 10);
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 115);
    return d.toISOString().slice(0, 10);
  })();

  const selectedSubject = mySubjects.find((s) => String(s.id) === subjectId);

  const dateRangeValid = useMemo(() => {
    if (!fromDate || !toDate) return false;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 115;
  }, [fromDate, toDate]);

  async function handleDownload() {
    if (!subjectId || !fromDate || !toDate || !dateRangeValid) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const records = await api.getAttendanceReport(Number(subjectId), fromDate, toDate);
      if (records.length === 0) {
        setError("No attendance records found for the selected subject and date range.");
        return;
      }
      downloadAttendanceMatrixCSV(records, selectedSubject?.name ?? "Subject", fromDate, toDate);
      setMessage(`Downloaded attendance for ${records.length} records.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to fetch attendance report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">Download Attendance Report</h2>
        <p className="mt-1 text-sm text-ink-soft">Select a subject and date range (up to 115 days) to download a matrix report with date columns and student rows.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Select subject</option>
          {mySubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name} · Sem {subject.semester}</option>
          ))}
        </Select>
        <Input label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} min={minDate} max={maxDate} />
        <Input label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate || minDate} max={maxDate} />
      </div>

      {fromDate && toDate && !dateRangeValid && (
        <p className="mt-3 text-xs font-semibold text-brick">Date range must be between 0 and 115 days.</p>
      )}

      {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
      {message ? <p className="mt-4 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

      <Button
        onClick={handleDownload}
        disabled={loading || !subjectId || !fromDate || !toDate || !dateRangeValid}
        className="mt-6 bg-brass text-white hover:bg-brass-light px-8"
      >
        {loading ? "Generating..." : "Download Report (CSV)"}
      </Button>
    </div>
  );
}

function HodAttendanceView({ departmentId }: { departmentId: number }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState("1");
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    api.getStudents()
      .then((s) => setStudents(s.filter((st) => st.department?.id === departmentId)))
      .catch(() => setError("Unable to load students."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  const filteredStudents = useMemo(
    () => students.filter((s) => s.semester === Number(semester)),
    [students, semester],
  );

  const studentAttendanceMap = useMemo(() => {
    const map = new Map<number, { total: number; present: number; percentage: number }>();
    allRecords.forEach((r) => {
      const sid = r.student?.id;
      if (!sid) return;
      const entry = map.get(sid) ?? { total: 0, present: 0, percentage: 0 };
      entry.total += 1;
      if (r.status === "PRESENT") entry.present += 1;
      entry.percentage = entry.total ? (entry.present / entry.total) * 100 : 0;
      map.set(sid, entry);
    });
    return map;
  }, [allRecords]);

  useEffect(() => {
    if (!selectedStudent) { setStudentRecords([]); return; }
    api.getStudentAttendance(selectedStudent).then(setStudentRecords).catch(() => setStudentRecords([]));
  }, [selectedStudent]);

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  const bySubject = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    studentRecords.forEach((record) => {
      const key = record.subject?.name ?? "Unknown";
      const entry = map.get(key) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (record.status === "PRESENT") entry.present += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries());
  }, [studentRecords]);

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading department attendance...</div>;
  if (error) return <div className="campus-card bg-brick-tint border-brick/30 p-6 text-sm font-medium text-brick">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-6 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Department Attendance Overview</h2>
          <p className="mt-1 text-sm text-ink-soft">Click on a student to see subject-wise attendance across all semesters.</p>
        </div>
        <Select label="Filter by Semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
          {Array.from({ length: 6 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </Select>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((student) => {
            const att = studentAttendanceMap.get(student.id);
            const pct = att?.percentage ?? 0;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  selectedStudent === student.id
                    ? "border-brass bg-brass-tint shadow-sm"
                    : pct < 70 && att
                      ? "border-brick/30 bg-brick-tint/50 hover:border-brick/50"
                      : "border-hairline bg-paper/50 hover:border-slate-300"
                }`}
              >
                <p className="font-semibold text-ink text-sm">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-ink-soft mt-0.5">Roll: {student.rollNumber} · {student.enrollmentNumber}</p>
                {att ? (
                  <p className={`mt-2 text-lg font-bold ${pct < 70 ? "text-brick" : "text-ink"}`}>
                    {pct.toFixed(1)}%
                    <span className="text-xs font-medium text-slate ml-2">{att.present}/{att.total}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate">No records</p>
                )}
              </button>
            );
          })}
          {filteredStudents.length === 0 && (
            <p className="text-sm font-medium text-slate text-center py-6 col-span-full">No students in this semester.</p>
          )}
        </div>
      </div>

      {selectedStudent && selectedStudentData && (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">{selectedStudentData.firstName} {selectedStudentData.lastName}</h2>
              <p className="mt-1 text-sm text-ink-soft">Semester {selectedStudentData.semester} · Subject-wise attendance across all semesters</p>
            </div>
            <Button variant="secondary" onClick={() => setSelectedStudent(null)} className="text-sm px-4 bg-slate-tint text-ink hover:bg-hairline">Close</Button>
          </div>

          {bySubject.length === 0 ? (
            <p className="text-sm font-medium text-slate text-center py-6">No attendance records for this student.</p>
          ) : (
            <div className="space-y-3">
              {bySubject.map(([subject, stat]) => {
                const pct = (stat.present / stat.total) * 100;
                return (
                  <div key={subject} className="flex items-center justify-between rounded-xl border border-hairline bg-paper/50 px-5 py-4">
                    <span className="font-semibold text-ink">{subject}</span>
                    <div className="text-right">
                      <span className={`block text-lg font-bold ${pct < 70 ? "text-brick" : "text-ink"}`}>{pct.toFixed(0)}%</span>
                      <span className="block text-xs font-medium text-slate mt-0.5">{stat.present}/{stat.total} Attended</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const { session } = useAuth();

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="campus-gradient-text pb-1">Attendance</h1>
        <p className="mt-2 text-ink-soft text-base">
          {session?.role === "STUDENT"
            ? "Your attendance record across all subjects."
            : session?.role === "HOD"
              ? "Department-wide attendance overview and student drill-down."
              : "Mark and review attendance for your scheduled lectures."}
        </p>
      </header>

      {session?.role === "STUDENT" && session.profileId ? (
        <StudentAttendance studentId={session.profileId} />
      ) : null}

      {(session?.role === "TEACHER" || session?.role === "HOD") && session.profileId ? (
        <TeacherAttendance teacherId={session.profileId} />
      ) : null}

      {session?.role === "HOD" && session.departmentId ? (
        <HodAttendanceView departmentId={session.departmentId} />
      ) : null}

      {session?.role === "PRINCIPAL" ? (
        <div className="campus-card p-8 text-center bg-slate-tint/50 border border-dashed border-slate/30">
          <p className="text-sm font-medium text-slate">
            Attendance is recorded per subject by teachers. Use the Directory to review departments and faculty assignments.
          </p>
        </div>
      ) : null}

      {(session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD") && !session.profileId ? (
        <div className="campus-card bg-gold-tint border-gold/30 p-6">
          <p className="text-sm font-medium text-gold">
            No linked profile was found for your account, so attendance cannot be loaded yet.
          </p>
        </div>
      ) : null}
    </div>
  );
}

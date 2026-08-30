"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Department, Exam, Subject } from "@/lib/types";

const EXAM_TYPES = ["INTERNAL", "MIDTERM", "FINAL", "PRACTICAL", "VIVA"];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function ExamRow({ exam, canManage, onDeleted }: { exam: Exam; canManage: boolean; onDeleted: () => void; }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteExam(exam.id); onDeleted(); } 
    finally { setDeleting(false); }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-white p-5 hover:border-slate-300 transition-colors shadow-sm">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brass">
            {exam.examType}
          </span>
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">{formatDate(exam.examDate)}</span>
        </div>
        <p className="font-semibold text-ink text-lg">{exam.subjectName}</p>
        <p className="text-sm font-medium text-slate mt-1">{exam.examName}</p>
        
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate">
          {exam.room ? <span className="flex items-center gap-1">📍 Room {exam.room}</span> : null}
          {(exam.startTime || exam.endTime) ? (
            <span className="flex items-center gap-1">
              🕒 {exam.startTime?.slice(0, 5) || "TBD"} {exam.endTime ? `– ${exam.endTime.slice(0, 5)}` : ""}
            </span>
          ) : null}
        </div>
      </div>
      {canManage ? (
        <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white px-5 transition-colors" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Removing..." : "Remove"}
        </Button>
      ) : null}
    </div>
  );
}

export default function ExamsPage() {
  const { session } = useAuth();
  const canManage = session?.role === "HOD" || session?.role === "PRINCIPAL";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("1");

  const [form, setForm] = useState({
    examName: "", examType: "INTERNAL", subjectId: "", examDate: "",
    startTime: "", endTime: "", room: "", academicYear: String(new Date().getFullYear()),
  });

  useEffect(() => {
    api
      .getDepartments()
      .then((deps) => {
        setDepartments(deps);
        const initial = session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD" ? session.departmentId : undefined;
        setDepartmentId(String(initial ?? deps[0]?.id ?? ""));
      })
      .catch(() => setError("Unable to load departments."));
    api.getSubjects().then(setSubjects).catch(() => undefined);
    if (session?.semester) setSemester(String(session.semester));
  }, []);

  async function loadExams() {
    if (!departmentId || !semester) return;
    setLoading(true); setError("");
    try {
      const fetcher = session?.role === "STUDENT" ? api.getStudentExamSchedule : api.getDepartmentSemesterExams;
      const list = await fetcher(Number(departmentId), Number(semester));
      setExams(list);
    } catch {
      setError("Unable to load exams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (departmentId && semester) loadExams();
  }, [departmentId, semester]);

  const subjectsInScope = useMemo(() => {
    const deptId = session?.role === "HOD" ? String(session.departmentId) : departmentId;
    return subjects.filter((s) => String(s.department?.id) === deptId && s.semester === Number(semester));
  }, [subjects, departmentId, semester, session?.role, session?.departmentId]);

  async function handleCreate() {
    if (!session?.userId || !form.subjectId || !form.examName || !form.examDate) return;
    setSubmitting(true); setError(""); setMessage("");

    try {
      await api.createExam({
        examName: form.examName, examType: form.examType, subjectId: Number(form.subjectId), departmentId: Number(departmentId), semester: Number(semester),
        examDate: form.examDate, startTime: form.startTime, endTime: form.endTime, room: form.room, academicYear: form.academicYear, createdByUserId: session?.userId,
      });
      setMessage("Exam successfully scheduled.");
      setForm({ examName: "", examType: "INTERNAL", subjectId: "", examDate: "", startTime: "", endTime: "", room: "", academicYear: form.academicYear });
      loadExams();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule exam.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Examinations</h1>
        <p className="mt-2 text-ink-soft text-base">Schedules and tracking by department and semester.</p>
      </header>

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

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Scheduled Exams</h2>
        {loading ? (
           <div className="animate-breathe text-brass font-medium py-4">Loading exams...</div>
        ) : error ? (
          <div className="p-4 bg-brick-tint text-brick rounded-xl text-sm font-medium">{error}</div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
            <p className="text-sm font-medium text-slate">No exams scheduled for this selection yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...exams].sort((a, b) => a.examDate.localeCompare(b.examDate)).map((exam) => (
              <ExamRow key={exam.id} exam={exam} canManage={!!canManage} onDeleted={loadExams} />
            ))}
          </div>
        )}
      </div>

      {canManage ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
           <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Schedule New Exam</h2>
          {subjectsInScope.length === 0 ? (
            <p className="text-sm font-medium text-slate">No subjects found for this department and semester yet. Create subjects first.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Exam Name" value={form.examName} onChange={(e) => setForm((f) => ({ ...f, examName: e.target.value }))} placeholder="e.g. Unit Test 2" />
                <Select label="Exam Type" value={form.examType} onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value }))}>
                  {EXAM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </Select>
              </div>
              <Select label="Subject" value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
                <option value="">Select subject</option>
                {subjectsInScope.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </Select>
              <div className="grid gap-5 sm:grid-cols-3">
                <Input label="Date" type="date" value={form.examDate} onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))} />
                <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Room / Venue" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. Lab 4" />
                <Input label="Academic Year" value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} />
              </div>

              {message ? <p className="mt-4 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

              <Button onClick={handleCreate} disabled={submitting} className="mt-2 bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8">
                {submitting ? "Scheduling..." : "Schedule Exam"}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
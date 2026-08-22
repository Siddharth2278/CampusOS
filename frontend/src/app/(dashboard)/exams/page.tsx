"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
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

function ExamRow({
  exam,
  canManage,
  onDeleted,
}: {
  exam: Exam;
  canManage: boolean;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteExam(exam.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-tint bg-paper/80 p-4">
      <div>
        <p className="font-semibold text-ink">
          {exam.subjectName} · {exam.examName}
        </p>
        <p className="text-xs text-slate">
          {exam.examType} · {formatDate(exam.examDate)} · {exam.startTime?.slice(0, 5)}–
          {exam.endTime?.slice(0, 5)} · Room {exam.room}
        </p>
      </div>
      {canManage ? (
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
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
    examName: "",
    examType: "INTERNAL",
    subjectId: "",
    examDate: "",
    startTime: "",
    endTime: "",
    room: "",
    academicYear: String(new Date().getFullYear()),
  });

  useEffect(() => {
    api
      .getDepartments()
      .then((deps) => {
        setDepartments(deps);
        const initial =
          session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD"
            ? session.departmentId
            : undefined;
        setDepartmentId(String(initial ?? deps[0]?.id ?? ""));
      })
      .catch(() => setError("Unable to load departments."));
    api.getSubjects().then(setSubjects).catch(() => undefined);
    if (session?.semester) setSemester(String(session.semester));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadExams() {
    if (!departmentId || !semester) return;
    setLoading(true);
    setError("");
    try {
      const fetcher =
        session?.role === "STUDENT"
          ? api.getStudentExamSchedule
          : api.getDepartmentSemesterExams;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, semester]);

  const subjectsInScope = useMemo(
    () =>
      subjects.filter(
        (s) => String(s.department?.id) === departmentId && s.semester === Number(semester),
      ),
    [subjects, departmentId, semester],
  );

  async function handleCreate() {
    if (!session?.userId || !form.subjectId || !form.examName || !form.examDate) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.createExam({
        examName: form.examName,
        examType: form.examType,
        subjectId: Number(form.subjectId),
        departmentId: Number(departmentId),
        semester: Number(semester),
        examDate: form.examDate,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room,
        academicYear: form.academicYear,
        createdByUserId: session?.userId,
      });
      setMessage("Exam scheduled.");
      setForm({
        examName: "",
        examType: "INTERNAL",
        subjectId: "",
        examDate: "",
        startTime: "",
        endTime: "",
        room: "",
        academicYear: form.academicYear,
      });
      loadExams();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule exam.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Exams</h1>
          <p className="mt-1 text-sm text-slate">
            Exam schedule by department and semester.
          </p>
        </div>

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

        <Card title="Scheduled exams">
          {loading ? (
            <p className="text-sm text-slate">Loading exams...</p>
          ) : error ? (
            <p className="text-sm text-brick">{error}</p>
          ) : exams.length === 0 ? (
            <p className="text-sm text-slate">No exams scheduled yet.</p>
          ) : (
            <div className="space-y-2">
              {[...exams]
                .sort((a, b) => a.examDate.localeCompare(b.examDate))
                .map((exam) => (
                  <ExamRow
                    key={exam.id}
                    exam={exam}
                    canManage={!!canManage}
                    onDeleted={loadExams}
                  />
                ))}
            </div>
          )}
        </Card>

        {canManage ? (
          <Card title="Schedule an exam">
            {subjectsInScope.length === 0 ? (
              <p className="text-sm text-slate">
                No subjects found for this department and semester yet.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Exam name"
                    value={form.examName}
                    onChange={(e) => setForm((f) => ({ ...f, examName: e.target.value }))}
                    placeholder="e.g. Unit Test 2"
                  />
                  <Select
                    label="Exam type"
                    value={form.examType}
                    onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value }))}
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <Select
                  label="Subject"
                  value={form.subjectId}
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                >
                  <option value="">Select subject</option>
                  {subjectsInScope.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Date"
                    type="date"
                    value={form.examDate}
                    onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Room"
                    value={form.room}
                    onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  />
                  <Input
                    label="Academic year"
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, academicYear: e.target.value }))
                    }
                  />
                </div>

                {message ? <p className="text-sm text-moss">{message}</p> : null}

                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting ? "Scheduling..." : "Schedule exam"}
                </Button>
              </div>
            )}
          </Card>
        ) : null}
      </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type {
  Assignment,
  AssignmentSubmission,
  Subject,
} from "@/lib/types";

function formatDateTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AssignmentsMonitor({ departmentId }: { departmentId?: number }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSubjects()
      .then(async (subjects) => {
        const scoped = departmentId
          ? subjects.filter((s) => s.department?.id === departmentId)
          : subjects;
        const lists = await Promise.all(
          scoped.map((s) => api.getSubjectAssignments(s.id).catch(() => [])),
        );
        setAssignments(lists.flat());
      })
      .catch(() => setError("Unable to load assignments."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  if (loading) return <p className="text-sm text-slate">Loading assignments...</p>;
  if (error) return <p className="text-sm text-brick">{error}</p>;

  const sorted = [...assignments].sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <Card
      title="Assignments"
      description={
        departmentId
          ? "Read-only view of assignments posted in your department."
          : "Read-only view of assignments posted college-wide."
      }
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-slate">No assignments posted yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-tint bg-paper/80 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{assignment.title}</p>
                <p className="text-xs text-slate">
                  {assignment.subjectName} · {assignment.teacherName}
                </p>
              </div>
              <span className="text-xs text-slate">
                Due {formatDateTime(assignment.dueDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TeacherAssignments({ teacherId }: { teacherId: number }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    subjectId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  function refreshAssignments() {
    api
      .getTeacherAssignments(teacherId)
      .then(setAssignments)
      .catch(() => setError("Unable to load assignments."));
  }

  useEffect(() => {
    Promise.all([api.getMyFacultyAssignments(), api.getTeacherAssignments(teacherId)])
      .then(([myAssignments2, myAssignments]) => {
        setMySubjects(
          myAssignments2.map((a) => a.subject).filter(Boolean) as Subject[],
        );
        setAssignments(myAssignments);
      })
      .catch(() => setError("Unable to load assignments."))
      .finally(() => setLoading(false));
  }, [teacherId]);

  async function handleCreate() {
    if (!form.title || !form.dueDate || !form.subjectId) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append(
      "dueDate",
      form.dueDate.length === 16 ? `${form.dueDate}:00` : form.dueDate,
    );
    body.append("subjectId", form.subjectId);
    body.append("teacherId", String(teacherId));
    if (file) body.append("attachment", file);

    try {
      await api.createAssignment(body);
      setMessage("Assignment posted.");
      setForm({ title: "", description: "", dueDate: "", subjectId: "" });
      setFile(null);
      refreshAssignments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to post assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleSubmissions(assignmentId: number) {
    if (expanded === assignmentId) {
      setExpanded(null);
      return;
    }
    setExpanded(assignmentId);
    try {
      const list = await api.getAssignmentSubmissions(assignmentId);
      setSubmissions(list);
    } catch {
      setSubmissions([]);
    }
  }

  if (loading) return <p className="text-sm text-slate">Loading assignments...</p>;

  return (
    <div className="space-y-6">
      <Card title="Post a new assignment">
        {mySubjects.length === 0 ? (
          <p className="text-sm text-slate">
            No subjects are assigned to you yet. Ask your HOD to add a faculty
            assignment first.
          </p>
        ) : (
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
                label="Subject"
                value={form.subjectId}
                onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              >
                <option value="">Select subject</option>
                {mySubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} · Sem {subject.semester}
                  </option>
                ))}
              </Select>
              <Input
                label="Due date"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft">
                Attachment (optional)
              </label>
              <input
                type="file"
                className="mt-1.5 block w-full text-sm text-ink-soft"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error ? <p className="text-sm text-brick">{error}</p> : null}
            {message ? <p className="text-sm text-moss">{message}</p> : null}

            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Posting..." : "Post assignment"}
            </Button>
          </div>
        )}
      </Card>

      <Card title="Your assignments">
        {assignments.length === 0 ? (
          <p className="text-sm text-slate">No assignments posted yet.</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-tint bg-paper/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{assignment.title}</p>
                    <p className="text-xs text-slate">
                      {assignment.subjectName} · Due {formatDateTime(assignment.dueDate)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => toggleSubmissions(assignment.id)}
                  >
                    {expanded === assignment.id ? "Hide submissions" : "View submissions"}
                  </Button>
                </div>
                {assignment.description ? (
                  <p className="mt-2 text-sm text-ink-soft">{assignment.description}</p>
                ) : null}

                {expanded === assignment.id ? (
                  <div className="mt-3 space-y-2 border-t border-hairline pt-3">
                    {submissions.length === 0 ? (
                      <p className="text-sm text-slate">No submissions yet.</p>
                    ) : (
                      submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-ink-soft">{submission.studentName}</span>
                          <Badge
                            tone={
                              submission.status === "SUBMITTED"
                                ? "green"
                                : submission.status === "LATE"
                                  ? "amber"
                                  : "neutral"
                            }
                          >
                            {submission.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StudentAssignments({ studentId, departmentId, semester }: {
  studentId: number;
  departmentId?: number;
  semester?: number;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    if (!departmentId || !semester) {
      setLoading(false);
      return;
    }

    Promise.all([api.getSubjects(), api.getStudentSubmissions(studentId)])
      .then(async ([subjects, mySubmissions]) => {
        const mySubjects = subjects.filter(
          (s) => s.department?.id === departmentId && s.semester === semester,
        );
        const lists = await Promise.all(
          mySubjects.map((s) => api.getSubjectAssignments(s.id).catch(() => [])),
        );
        setAssignments(lists.flat());
        setSubmissions(mySubmissions);
      })
      .catch(() => setError("Unable to load assignments."))
      .finally(() => setLoading(false));
  }, [studentId, departmentId, semester]);

  async function submit(assignmentId: number) {
    setSubmittingId(assignmentId);
    try {
      const submission = await api.createSubmission(assignmentId, studentId);
      setSubmissions((current) => [
        ...current.filter((s) => s.assignmentId !== assignmentId),
        submission,
      ]);
    } catch {
      // surfaced via unchanged status below
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) return <p className="text-sm text-slate">Loading assignments...</p>;
  if (error)
    return (
      <div className="rounded-xl border border-brick/30 bg-brick-tint p-6 text-sm text-brick">
        {error}
      </div>
    );

  const sorted = [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <Card title="Assignments" description="For your subjects this semester.">
      {sorted.length === 0 ? (
        <p className="text-sm text-slate">No assignments posted yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((assignment) => {
            const mySubmission = submissions.find(
              (s) => s.assignmentId === assignment.id,
            );
            const status = mySubmission?.status ?? "NOT_SUBMITTED";
            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-tint bg-paper/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{assignment.title}</p>
                    <p className="text-xs text-slate">
                      {assignment.subjectName} · Due {formatDateTime(assignment.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        status === "SUBMITTED"
                          ? "green"
                          : status === "LATE"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {status.replace("_", " ")}
                    </Badge>
                    {status === "NOT_SUBMITTED" ? (
                      <Button
                        variant="secondary"
                        onClick={() => submit(assignment.id)}
                        disabled={submittingId === assignment.id}
                      >
                        {submittingId === assignment.id ? "Submitting..." : "Mark submitted"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {assignment.description ? (
                  <p className="mt-2 text-sm text-ink-soft">{assignment.description}</p>
                ) : null}
                {assignment.attachmentUrl ? (
                  <a
                    href={
                      assignment.attachmentUrl.startsWith("http")
                        ? assignment.attachmentUrl
                        : `${API_URL}${assignment.attachmentUrl}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-brass hover:text-brass"
                  >
                    Download attachment
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function AssignmentsPage() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-slate">
          {session?.role === "STUDENT"
            ? "Coursework assigned to your class."
            : session?.role === "TEACHER" || session?.role === "HOD"
              ? "Post and track assignments for your subjects."
              : "Monitor assignments posted across your scope."}
        </p>
      </div>

      {(session?.role === "TEACHER" || session?.role === "HOD") && session.profileId ? (
        <TeacherAssignments teacherId={session.profileId} />
      ) : null}

      {session?.role === "STUDENT" && session.profileId ? (
        <StudentAssignments
          studentId={session.profileId}
          departmentId={session.departmentId}
          semester={session.semester}
        />
      ) : null}

      {session?.role === "PRINCIPAL" ? <AssignmentsMonitor /> : null}
    </div>
  );
}

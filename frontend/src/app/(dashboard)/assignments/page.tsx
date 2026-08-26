"use client";

import { useEffect, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Assignment, AssignmentSubmission, Subject } from "@/lib/types";

function formatDateTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-moss-tint text-moss border border-moss/20";
    case "LATE":
      return "bg-gold-tint text-gold border border-gold/20";
    default:
      return "bg-slate-tint text-slate border border-slate/20";
  }
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

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading assignments...</div>;
  if (error) return <div className="p-4 bg-brick-tint text-brick rounded-xl text-sm font-medium">{error}</div>;

  const sorted = [...assignments].sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">College Assignments</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {departmentId
            ? "Read-only view of assignments posted in your department."
            : "Read-only view of assignments posted college-wide."}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm font-medium text-slate text-center py-6">No assignments posted yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-paper/50 p-4 transition-colors hover:border-slate-300"
            >
              <div>
                <p className="font-semibold text-ink">{assignment.title}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  <span className="font-medium">{assignment.subjectName}</span> · {assignment.teacherName}
                </p>
              </div>
              <span className="rounded-full bg-slate-tint border border-slate/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                Due {formatDateTime(assignment.dueDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
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

  const [form, setForm] = useState({ title: "", description: "", dueDate: "", subjectId: "" });
  const [file, setFile] = useState<File | null>(null);

  function refreshAssignments() {
    api.getTeacherAssignments(teacherId).then(setAssignments).catch(() => setError("Unable to load assignments."));
  }

  useEffect(() => {
    Promise.all([api.getMyFacultyAssignments(), api.getTeacherAssignments(teacherId)])
      .then(([myAssignments2, myAssignments]) => {
        setMySubjects(myAssignments2.map((a) => a.subject).filter(Boolean) as Subject[]);
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
    body.append("dueDate", form.dueDate.length === 16 ? `${form.dueDate}:00` : form.dueDate);
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

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading assignments...</div>;

  return (
    <div className="space-y-8">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Post a New Assignment</h2>
        {mySubjects.length === 0 ? (
          <p className="text-sm font-medium text-slate">
            No subjects are assigned to you yet. Ask your HOD to add a faculty assignment first.
          </p>
        ) : (
          <div className="space-y-5">
            <Input
              label="Title"
              placeholder="E.g., Lab Report 1"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              label="Description"
              placeholder="Add instructions..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Subject"
                value={form.subjectId}
                onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              >
                <option value="">Select Subject</option>
                {mySubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} · Sem {subject.semester}
                  </option>
                ))}
              </Select>
              <Input
                label="Due Date & Time"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-soft">Attachment (optional)</label>
              <input
                type="file"
                className="block w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brass-tint file:text-brass hover:file:bg-blue-100 transition-colors cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error ? <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

            <div className="pt-2">
              <Button onClick={handleCreate} disabled={submitting} className="bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8">
                {submitting ? "Posting..." : "Post Assignment"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Your Posted Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No assignments posted yet.</p>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-xl border border-hairline bg-paper/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{assignment.title}</h3>
                    <p className="text-sm text-ink-soft mt-1">
                      <span className="font-medium">{assignment.subjectName}</span> · Due {formatDateTime(assignment.dueDate)}
                    </p>
                  </div>
                  <Button
                    className="bg-slate-tint text-ink hover:bg-hairline px-5 text-sm"
                    onClick={() => toggleSubmissions(assignment.id)}
                  >
                    {expanded === assignment.id ? "Hide Submissions" : "View Submissions"}
                  </Button>
                </div>
                {assignment.description ? (
                  <p className="mt-4 text-sm text-ink-soft bg-white p-3 rounded-lg border border-hairline whitespace-pre-wrap">{assignment.description}</p>
                ) : null}

                {expanded === assignment.id ? (
                  <div className="mt-5 space-y-2 border-t border-hairline pt-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate mb-3">Student Submissions</h4>
                    {submissions.length === 0 ? (
                      <p className="text-sm text-slate italic">No submissions yet.</p>
                    ) : (
                      submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between text-sm bg-white border border-hairline rounded-lg p-3">
                          <span className="font-medium text-ink">{submission.studentName}</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentAssignments({ studentId, departmentId, semester }: { studentId: number; departmentId?: number; semester?: number; }) {
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
        const mySubjects = subjects.filter((s) => s.department?.id === departmentId && s.semester === semester);
        const lists = await Promise.all(mySubjects.map((s) => api.getSubjectAssignments(s.id).catch(() => [])));
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
      setSubmissions((current) => [...current.filter((s) => s.assignmentId !== assignmentId), submission]);
    } catch {
      // surfaced via unchanged status below
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading assignments...</div>;
  if (error) return <div className="campus-card bg-brick-tint border-brick/30 p-6 text-sm font-medium text-brick">{error}</div>;

  const sorted = [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">My Assignments</h2>
        <p className="mt-1 text-sm text-ink-soft">Coursework for your current semester subjects.</p>
      </div>
      
      {sorted.length === 0 ? (
        <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
          <p className="text-sm font-medium text-slate">No assignments posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((assignment) => {
            const mySubmission = submissions.find((s) => s.assignmentId === assignment.id);
            const status = mySubmission?.status ?? "NOT_SUBMITTED";
            return (
              <div key={assignment.id} className="rounded-xl border border-hairline bg-paper/50 p-5 transition-colors hover:border-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{assignment.title}</h3>
                    <p className="text-sm text-ink-soft mt-1">
                      <span className="font-medium">{assignment.subjectName}</span> · Due {formatDateTime(assignment.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(status)}`}>
                      {status.replace("_", " ")}
                    </span>
                    {status === "NOT_SUBMITTED" ? (
                      <Button
                        className="bg-brass text-white hover:bg-brass-light px-4 text-sm"
                        onClick={() => submit(assignment.id)}
                        disabled={submittingId === assignment.id}
                      >
                        {submittingId === assignment.id ? "Submitting..." : "Mark as Done"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                
                {assignment.description ? (
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
                ) : null}
                
                {assignment.attachmentUrl ? (
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <button
                      type="button"
                      onClick={() =>
                        downloadAttachment(
                          assignment.attachmentUrl!.startsWith("http")
                            ? assignment.attachmentUrl!
                            : `${API_URL}${assignment.attachmentUrl}`,
                          assignment.attachmentFileName || "attachment"
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-brass-tint px-4 py-2 text-sm font-semibold text-brass transition-colors hover:bg-blue-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download Resource
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const { session } = useAuth();

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="campus-gradient-text pb-1">Assignments</h1>
        <p className="mt-2 text-ink-soft text-base">
          {session?.role === "STUDENT"
            ? "Coursework assigned to your class."
            : session?.role === "TEACHER" || session?.role === "HOD"
              ? "Post and track assignments for your subjects."
              : "Monitor assignments posted across your scope."}
        </p>
      </header>

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
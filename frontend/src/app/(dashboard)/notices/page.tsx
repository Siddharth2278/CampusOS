"use client";

import { useEffect, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type {
  Department,
  Notice,
  NoticePriority,
  ReceiverRole,
  Teacher,
} from "@/lib/types";

const PRIORITIES: NoticePriority[] = ["NORMAL", "IMPORTANT", "URGENT"];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

function allowedReceiverRoles(role?: string): ReceiverRole[] {
  if (role === "TEACHER") return ["STUDENT"];
  if (role === "HOD") return ["STUDENT", "TEACHER"];
  if (role === "PRINCIPAL") return ["ALL", "HOD", "TEACHER", "STUDENT"];
  return ["ALL"];
}

function attachmentHref(attachmentUrl?: string) {
  if (!attachmentUrl) return undefined;
  return attachmentUrl.startsWith("http") ? attachmentUrl : `${API_URL}${attachmentUrl}`;
}

function CreateNotice({ onCreated }: { onCreated: () => void }) {
  const { session } = useAuth();
  const isPrincipal = session?.role === "PRINCIPAL";
  const receiverOptions = allowedReceiverRoles(session?.role);
  const lockedDepartmentId = session?.role === "TEACHER" ? session.departmentId : undefined;

  const [mode, setMode] = useState<"broadcast" | "specific">("broadcast");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    receiverRole: receiverOptions[0],
    priority: "NORMAL" as NoticePriority,
    departmentId: lockedDepartmentId ? String(lockedDepartmentId) : "",
    semester: "",
    targetUserId: "",
  });

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isPrincipal) api.getTeachers().then(setTeachers).catch(() => undefined);
  }, [isPrincipal]);

  const specificCandidates = teachers
    .filter((t) => (form.receiverRole === "HOD" ? !!t.hod : !t.hod))
    .filter((t) => t.user?.id != null);

  function setMode_(next: "broadcast" | "specific") {
    setMode(next);
    setForm((f) => ({
      ...f,
      targetUserId: "",
      receiverRole: next === "specific" ? "TEACHER" : receiverOptions[0],
    }));
  }

  async function handleCreate() {
    if (!form.title || !form.description) return;
    if (mode === "specific" && !form.targetUserId) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("receiverRole", form.receiverRole);
    body.append("priority", form.priority);
    if (mode === "broadcast" && form.departmentId) body.append("departmentId", form.departmentId);
    if (mode === "broadcast" && form.semester) body.append("semester", form.semester);
    if (mode === "specific") body.append("targetUserId", form.targetUserId);
    if (attachment) body.append("attachment", attachment);

    try {
      await api.createNotice(body);
      setMessage(mode === "specific" ? "Notice sent to that person." : "Notice published.");
      setForm({
        title: "",
        description: "",
        receiverRole: mode === "specific" ? "TEACHER" : receiverOptions[0],
        priority: "NORMAL",
        departmentId: lockedDepartmentId ? String(lockedDepartmentId) : "",
        semester: "",
        targetUserId: "",
      });
      setAttachment(null);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish notice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="campus-card p-6 lg:p-8">
        <h2 className="mb-6">Publish a Notice</h2>
        <div className="space-y-5">
          {isPrincipal ? (
            <div className="inline-flex w-fit gap-1 rounded-lg bg-slate-tint p-1 border border-hairline">
              <button
                type="button"
                onClick={() => setMode_("broadcast")}
                className={
                  mode === "broadcast"
                    ? "rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm border border-hairline"
                    : "rounded-md px-4 py-2 text-sm font-medium text-slate hover:text-ink"
                }
              >
                Broadcast
              </button>
              <button
                type="button"
                onClick={() => setMode_("specific")}
                className={
                  mode === "specific"
                    ? "rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm border border-hairline"
                    : "rounded-md px-4 py-2 text-sm font-medium text-slate hover:text-ink"
                }
              >
                Specific Person
              </button>
            </div>
          ) : null}

          <Input
            label="Title"
            placeholder="E.g., Mid-Term Examination Schedule"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Write the details of the notice here..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Audience"
              value={form.receiverRole}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  receiverRole: e.target.value as ReceiverRole,
                  targetUserId: "",
                }))
              }
            >
              {(mode === "specific" ? (["TEACHER", "HOD"] as ReceiverRole[]) : receiverOptions).map(
                (role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ),
              )}
            </Select>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value as NoticePriority }))
              }
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </div>

          {mode === "specific" ? (
            <Select
              label={form.receiverRole === "HOD" ? "Which HOD" : "Which Teacher"}
              value={form.targetUserId}
              onChange={(e) => setForm((f) => ({ ...f, targetUserId: e.target.value }))}
            >
              <option value="">
                {specificCandidates.length
                  ? "Select a person"
                  : `No ${form.receiverRole === "HOD" ? "HODs" : "teachers"} yet`}
              </option>
              {specificCandidates.map((t) => (
                <option key={t.id} value={t.user!.id}>
                  {t.firstName} {t.lastName} · {t.department?.name ?? "No department"}
                </option>
              ))}
            </Select>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Department"
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                disabled={!!lockedDepartmentId}
              >
                <option value="">All Departments</option>
                {(lockedDepartmentId
                  ? departments.filter((dep) => dep.id === lockedDepartmentId)
                  : departments
                ).map((dep) => (
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
                <option value="">All Semesters</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block mb-1.5">Attachment (optional)</label>
            <input
              type="file"
              className="block w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brass-tint file:text-brass hover:file:bg-blue-100 transition-colors cursor-pointer"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
          </div>

          {error ? <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
          {message ? <p className="text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

          <div className="pt-2">
            <Button
              onClick={handleCreate}
              disabled={submitting || (mode === "specific" && !form.targetUserId)}
              className="bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8"
            >
              {submitting
                ? "Sending..."
                : mode === "specific"
                  ? "Send to this person"
                  : "Publish Notice"}
            </Button>
          </div>
        </div>
      </div>
  );
}

function EditNotice({
  notice,
  onDone,
}: {
  notice: Notice;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    title: notice.title,
    description: notice.description,
    priority: notice.priority,
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.title || !form.description) return;
    setSubmitting(true);
    setError("");

    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("priority", form.priority);
    if (attachment) body.append("attachment", attachment);

    try {
      await api.updateNotice(notice.id, body);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update notice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 pt-6 border-t border-hairline">
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
      <Select
        label="Priority"
        value={form.priority}
        onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as NoticePriority }))}
      >
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </Select>
      <div>
        <label className="block mb-1.5">Replace attachment (optional)</label>
        <input
          type="file"
          className="block w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brass-tint file:text-brass hover:file:bg-blue-100 transition-colors cursor-pointer"
          onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
        />
      </div>
      {error ? <p className="text-sm font-medium text-brick">{error}</p> : null}
      <div className="flex gap-3 pt-2">
        <Button className="bg-brass text-white hover:bg-brass-light" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button className="bg-slate-tint text-ink hover:bg-hairline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function priorityStyles(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-brick-tint text-brick border border-brick/20";
    case "IMPORTANT":
      return "bg-gold-tint text-gold border border-gold/20";
    default:
      return "bg-slate-tint text-slate border border-slate/20";
  }
}

function formatDateTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NoticesPage() {
  const { session } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canCreate =
    session?.role === "TEACHER" || session?.role === "HOD" || session?.role === "PRINCIPAL";

  function load() {
    api
      .getNotices()
      .then(setNotices)
      .catch(() => setError("Unable to load notices."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleDataChanged = () => {
      load();
    };
    window.addEventListener("campusos:data-changed", handleDataChanged);
    return () => window.removeEventListener("campusos:data-changed", handleDataChanged);
  }, []);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await api.deleteNotice(id);
      load();
    } catch {
      // load() below will re-show the notice if delete failed server-side
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="campus-gradient-text pb-1">Campus Notices</h1>
        <p className="mt-2 text-ink-soft text-base">
          Official announcements, circulars, and updates from the administration.
        </p>
      </header>

      {canCreate ? <CreateNotice onCreated={load} /> : null}

      {loading ? (
        <div className="flex justify-center py-12">
           <div className="animate-breathe text-brass font-medium">Loading circulars...</div>
        </div>
      ) : null}

      {error ? (
        <div className="campus-card bg-brick-tint border-brick/30 p-6">
          <p className="text-sm font-medium text-brick">{error}</p>
        </div>
      ) : null}

      {!loading && !error && notices.length === 0 ? (
        <div className="campus-card p-12 text-center">
          <p className="text-slate font-medium text-lg">No notices published yet.</p>
          <p className="text-sm text-ink-soft mt-1">Check back later for updates.</p>
        </div>
      ) : null}

      <div className="space-y-5">
        {[...notices]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((notice) => {
            const canManage =
              (session?.userId != null && session.userId === notice.createdByUserId) ||
              session?.role === "PRINCIPAL";
            return (
              <div key={notice.id} className="campus-card p-6 lg:p-8 campus-reveal">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-4 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${priorityStyles(notice.priority)}`}
                    >
                      {notice.priority}
                    </span>
                    <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brass">
                      {notice.receiverRole}
                    </span>
                    {notice.department ? (
                      <span className="rounded-full bg-slate-tint border border-slate/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                        {notice.department}
                      </span>
                    ) : null}
                    {notice.targetUserName ? (
                      <span className="rounded-full bg-maroon-tint border border-maroon/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-maroon">
                        To: {notice.targetUserName}
                      </span>
                    ) : null}
                  </div>
                  
                  {canManage && editingId !== notice.id ? (
                    <div className="flex shrink-0 gap-2">
                      <Button className="bg-slate-tint text-ink hover:bg-hairline text-sm px-4" onClick={() => setEditingId(notice.id)}>
                        Edit
                      </Button>
                      <Button
                        className="bg-brick-tint text-brick hover:bg-brick hover:text-white transition-colors text-sm px-4"
                        onClick={() => handleDelete(notice.id)}
                        disabled={deletingId === notice.id}
                      >
                        {deletingId === notice.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  ) : null}
                </div>

                {editingId === notice.id ? (
                  <EditNotice
                    notice={notice}
                    onDone={() => {
                      setEditingId(null);
                      load();
                    }}
                  />
                ) : (
                  <>
                    <h3 className="text-xl mb-3">{notice.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-wrap">
                      {notice.description}
                    </p>
                    
                    {notice.attachmentUrl ? (
                      <div className="mt-5 pt-5 border-t border-hairline">
                        <button
                          type="button"
                          onClick={() =>
                            downloadAttachment(
                              attachmentHref(notice.attachmentUrl)!,
                              notice.attachmentFileName || "attachment"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-brass-tint px-4 py-2.5 text-sm font-semibold text-brass transition-colors hover:bg-blue-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Download Attachment
                        </button>
                      </div>
                    ) : null}
                    
                    <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate">
                      <span>Posted by <strong className="text-ink">{notice.createdBy}</strong></span>
                      <span>{formatDateTime(notice.createdAt)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
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

// Per the role spec, notices flow one level down for Teacher; HOD can
// broadcast to Students or Teachers in any department; the Principal can
// broadcast to any group, or (below) target one person.
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
  // Teacher stays scoped to their own department; HOD can reach other
  // departments too, so their department field isn't locked.
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
      <Card title="Publish a notice">
        <div className="space-y-4">
          {isPrincipal ? (
            <div className="inline-flex w-fit gap-1 rounded-lg bg-slate-tint p-1">
              <button
                type="button"
                onClick={() => setMode_("broadcast")}
                className={
                  mode === "broadcast"
                    ? "rounded-md bg-brass px-3 py-1.5 text-sm font-bold text-white shadow-sm"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-slate"
                }
              >
                Broadcast to a group
              </button>
              <button
                type="button"
                onClick={() => setMode_("specific")}
                className={
                  mode === "specific"
                    ? "rounded-md bg-brass px-3 py-1.5 text-sm font-bold text-white shadow-sm"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-slate"
                }
              >
                Specific teacher or HOD
              </button>
            </div>
          ) : null}

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
              label={form.receiverRole === "HOD" ? "Which HOD" : "Which teacher"}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Department"
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                disabled={!!lockedDepartmentId}
              >
                <option value="">All departments</option>
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
                <option value="">All semesters</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-soft">
              Attachment (optional)
            </label>
            <input
              type="file"
              className="mt-1.5 block w-full text-sm text-ink-soft"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
          </div>

          {error ? <p className="text-sm text-brick">{error}</p> : null}
          {message ? <p className="text-sm text-moss">{message}</p> : null}

          <Button
            onClick={handleCreate}
            disabled={submitting || (mode === "specific" && !form.targetUserId)}
          >
            {submitting
              ? "Sending..."
              : mode === "specific"
                ? "Send to this person"
                : "Publish notice"}
          </Button>
        </div>
      </Card>
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
    <div className="mt-3 space-y-3 border-t border-hairline pt-3">
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
        <label className="block text-sm font-medium text-ink-soft">
          Replace attachment (optional)
        </label>
        <input
          type="file"
          className="mt-1.5 block w-full text-sm text-ink-soft"
          onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
        />
      </div>
      {error ? <p className="text-sm text-brick">{error}</p> : null}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function priorityStyles(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-brick-tint text-brick";
    case "IMPORTANT":
      return "bg-gold-tint text-gold";
    default:
      return "bg-slate-tint text-ink-soft";
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Campus notices</h1>
        <p className="mt-1 text-sm text-slate">
          Announcements and updates from faculty and administration.
        </p>
      </div>

      {canCreate ? <CreateNotice onCreated={load} /> : null}

      {loading ? <p className="text-sm text-slate">Loading notices...</p> : null}
      {error ? (
        <div className="rounded-xl border border-brick/30 bg-brick-tint p-6 text-sm text-brick">
          {error}
        </div>
      ) : null}

      {!loading && !error && notices.length === 0 ? (
        <Card>
          <p className="text-sm text-slate">No notices published yet.</p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {[...notices]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((notice) => {
            const canManage =
              (session?.userId != null && session.userId === notice.createdByUserId) ||
              session?.role === "PRINCIPAL";
            return (
              <Card key={notice.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles(notice.priority)}`}
                    >
                      {notice.priority}
                    </span>
                    <span className="rounded-full bg-brass-tint px-2.5 py-1 text-xs font-medium text-brass">
                      {notice.receiverRole}
                    </span>
                    {notice.department ? (
                      <span className="text-xs text-slate">{notice.department}</span>
                    ) : null}
                    {notice.targetUserName ? (
                      <span className="rounded-full bg-maroon-tint px-2.5 py-1 text-xs font-medium text-maroon">
                        To: {notice.targetUserName}
                      </span>
                    ) : null}
                  </div>
                  {canManage && editingId !== notice.id ? (
                    <div className="flex shrink-0 gap-2">
                      <Button variant="secondary" onClick={() => setEditingId(notice.id)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
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
                    <h2 className="mt-3 text-lg font-semibold text-ink">{notice.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{notice.description}</p>
                    {notice.attachmentUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadAttachment(
                            attachmentHref(notice.attachmentUrl)!,
                            notice.attachmentFileName || "attachment"
                          )
                        }
                        className="mt-2 inline-block text-xs font-medium text-brass hover:text-brass-light"
                      >
                        Download attachment
                      </button>
                    ) : null}
                    <p className="mt-4 text-xs text-slate">
                      Posted by {notice.createdBy} · {formatDateTime(notice.createdAt)}
                    </p>
                  </>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}

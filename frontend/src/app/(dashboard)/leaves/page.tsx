"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { LeaveResponse, LeaveStatistics, LeaveType } from "@/lib/types";

const LEAVE_TYPES: LeaveType[] = [
  "SICK",
  "MEDICAL",
  "CASUAL",
  "PERSONAL",
  "DUTY",
  "SPORTS",
  "FAMILY_FUNCTION",
  "OTHER",
];

function statusTone(status: string) {
  if (status === "APPROVED") return "green" as const;
  if (status === "REJECTED" || status === "CANCELED") return "red" as const;
  return "amber" as const;
}

function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ApprovalQueue({ approverId }: { approverId: number }) {
  const { session } = useAuth();
  const [pending, setPending] = useState<LeaveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    const fetcher =
      session?.role === "TEACHER"
        ? api.getClassTeacherPendingLeaves
        : session?.role === "HOD"
          ? api.getHodPendingLeaves
          : api.getPrincipalPendingLeaves;

    fetcher()
      .then(setPending)
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(leaveId: number, status: "APPROVED" | "REJECTED") {
    setBusyId(leaveId);
    try {
      await api.decideLeave(leaveId, { approvedByUserId: approverId, status });
      setPending((current) => current.filter((l) => l.id !== leaveId));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-slate">Loading approvals...</p>;

  return (
    <Card title="Pending approvals" description="Requests waiting on your decision.">
      {pending.length === 0 ? (
        <p className="text-sm text-slate">Nothing pending right now.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((leave) => (
            <div
              key={leave.id}
              className="rounded-xl border border-slate-tint bg-paper/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{leave.userName}</p>
                  <p className="text-xs text-slate">
                    {leave.leaveType} · {formatDate(leave.startDate)} –{" "}
                    {formatDate(leave.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => decide(leave.id, "APPROVED")}
                    disabled={busyId === leave.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => decide(leave.id, "REJECTED")}
                    disabled={busyId === leave.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              {leave.reason ? (
                <p className="mt-2 text-sm text-ink-soft">{leave.reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function LeavesPage() {
  const { session } = useAuth();

  const [myLeaves, setMyLeaves] = useState<LeaveResponse[]>([]);
  const [stats, setStats] = useState<LeaveStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leaveType: "CASUAL" as LeaveType,
    reason: "",
    startDate: "",
    endDate: "",
  });

  const canApply = session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD";
  const isApprover = session?.role === "TEACHER" || session?.role === "HOD" || session?.role === "PRINCIPAL";

  function load() {
    if (!session?.userId) {
      setLoading(false);
      return;
    }
    Promise.all([api.getMyLeaves(session?.userId), api.getLeaveStatistics(session?.userId)])
      .then(([leaves, statistics]) => {
        setMyLeaves(leaves);
        setStats(statistics);
      })
      .catch(() => setError("Unable to load your leave history."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  async function handleApply() {
    if (!session?.userId || !session || !form.reason || !form.startDate || !form.endDate) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.applyLeave({
        userId: session?.userId,
        leaveRole: session.role as "STUDENT" | "TEACHER" | "HOD",
        leaveType: form.leaveType,
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setMessage("Leave request submitted.");
      setForm({ leaveType: "CASUAL", reason: "", startDate: "", endDate: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Leaves</h1>
          <p className="mt-1 text-sm text-slate">
            {canApply ? "Apply for leave and track your requests." : "Review leave requests."}
          </p>
        </div>

        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total requests" value={stats.total} />
            <StatCard label="Pending" value={stats.pending} />
            <StatCard label="Approved" value={stats.approved} />
            <StatCard label="Rejected" value={stats.rejected} />
          </div>
        ) : null}

        {isApprover && session?.userId ? <ApprovalQueue approverId={session?.userId} /> : null}

        {canApply ? (
          <Card title="Apply for leave">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Select
                  label="Leave type"
                  value={form.leaveType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leaveType: e.target.value as LeaveType }))
                  }
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
                <Input
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <Textarea
                label="Reason"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />

              {error ? <p className="text-sm text-brick">{error}</p> : null}
              {message ? <p className="text-sm text-moss">{message}</p> : null}

              <Button onClick={handleApply} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </Card>
        ) : null}

        <Card title="Your leave history">
          {loading ? (
            <p className="text-sm text-slate">Loading...</p>
          ) : myLeaves.length === 0 ? (
            <p className="text-sm text-slate">No leave requests yet.</p>
          ) : (
            <div className="space-y-2">
              {[...myLeaves]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((leave) => (
                  <div
                    key={leave.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-tint bg-paper/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {leave.leaveType.replace("_", " ")} · {formatDate(leave.startDate)} –{" "}
                        {formatDate(leave.endDate)}
                      </p>
                      {leave.reason ? (
                        <p className="text-xs text-slate">{leave.reason}</p>
                      ) : null}
                    </div>
                    <Badge tone={statusTone(leave.status)}>{leave.status}</Badge>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
  );
}

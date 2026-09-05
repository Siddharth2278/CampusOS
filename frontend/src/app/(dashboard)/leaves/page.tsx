"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { LeaveResponse, LeaveStatistics, LeaveType } from "@/lib/types";

const LEAVE_TYPES: LeaveType[] = ["SICK", "MEDICAL", "CASUAL", "PERSONAL", "DUTY", "SPORTS", "FAMILY_FUNCTION", "OTHER"];

function statusStyle(status: string) {
  if (status === "APPROVED") return "bg-moss-tint text-moss border border-moss/20";
  if (status === "REJECTED" || status === "CANCELED") return "bg-brick-tint text-brick border border-brick/20";
  return "bg-gold-tint text-gold border border-gold/20";
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
    const fetcher = session?.role === "TEACHER" ? api.getClassTeacherPendingLeaves : session?.role === "HOD" ? api.getHodPendingLeaves : api.getPrincipalPendingLeaves;
    fetcher().then(setPending).catch(() => setPending([])).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const handleDataChanged = () => load();
    window.addEventListener("campusos:data-changed", handleDataChanged);
    return () => window.removeEventListener("campusos:data-changed", handleDataChanged);
  }, []);

  async function decide(leaveId: number, status: "APPROVED" | "REJECTED") {
    setBusyId(leaveId);
    try {
      await api.decideLeave(leaveId, { approvedByUserId: approverId, status });
      setPending((current) => current.filter((l) => l.id !== leaveId));
    } finally { setBusyId(null); }
  }

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading approvals...</div>;

  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">Pending Approvals</h2>
        <p className="mt-1 text-sm text-ink-soft">Leave requests waiting on your decision.</p>
      </div>
      {pending.length === 0 ? (
        <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
           <p className="text-sm font-medium text-slate">Nothing pending right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((leave) => (
            <div key={leave.id} className="rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline/60 pb-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-ink text-lg">{leave.userName}</p>
                    <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brass">
                      {leave.leaveType.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate">
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-moss text-white hover:bg-moss/90 px-6 text-sm" onClick={() => decide(leave.id, "APPROVED")} disabled={busyId === leave.id}>Approve</Button>
                  <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white px-6 text-sm transition-colors" onClick={() => decide(leave.id, "REJECTED")} disabled={busyId === leave.id}>Reject</Button>
                </div>
              </div>
              {leave.reason ? <p className="text-sm text-ink-soft bg-white p-3 rounded-lg border border-hairline">{leave.reason}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
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

  const [form, setForm] = useState({ leaveType: "CASUAL" as LeaveType, reason: "", startDate: "", endDate: "" });

  const canApply = session?.role === "STUDENT" || session?.role === "TEACHER" || session?.role === "HOD";
  const isApprover = session?.role === "TEACHER" || session?.role === "HOD" || session?.role === "PRINCIPAL";

  function load() {
    if (!session?.userId) { setLoading(false); return; }
    Promise.all([api.getMyLeaves(session?.userId), api.getLeaveStatistics(session?.userId)])
      .then(([leaves, statistics]) => { setMyLeaves(leaves); setStats(statistics); })
      .catch(() => setError("Unable to load your leave history."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [session?.userId]);

  async function handleApply() {
    if (!session?.userId || !session || !form.reason || !form.startDate || !form.endDate) return;
    setSubmitting(true); setError(""); setMessage("");

    try {
      await api.applyLeave({ userId: session?.userId, leaveRole: session.role as "STUDENT" | "TEACHER" | "HOD", leaveType: form.leaveType, reason: form.reason, startDate: form.startDate, endDate: form.endDate });
      setMessage("Leave request successfully submitted.");
      setForm({ leaveType: "CASUAL", reason: "", startDate: "", endDate: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Leaves & Absences</h1>
        <p className="mt-2 text-ink-soft text-base">
          {canApply ? "Apply for leave and track your requests." : "Review and manage leave requests."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
          <span className="rounded-full bg-slate-tint border border-slate/20 px-3 py-1 text-slate">Student → Class Teacher</span>
          <span className="text-slate">→</span>
          <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-brass">HOD</span>
          <span className="text-slate">→</span>
          <span className="rounded-full bg-maroon-tint border border-maroon/20 px-3 py-1 text-maroon">Principal</span>
        </div>
      </header>

      {stats ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Total Requests</p>
            <p className="text-3xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="campus-card p-6 bg-gradient-to-br from-white to-gold-tint/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">Pending</p>
            <p className="text-3xl font-bold text-gold">{stats.pending}</p>
          </div>
          <div className="campus-card p-6 bg-gradient-to-br from-white to-moss-tint/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-moss mb-2">Approved</p>
            <p className="text-3xl font-bold text-moss">{stats.approved}</p>
          </div>
          <div className="campus-card p-6 bg-gradient-to-br from-white to-brick-tint/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-brick mb-2">Rejected</p>
            <p className="text-3xl font-bold text-brick">{stats.rejected}</p>
          </div>
        </div>
      ) : null}

      {isApprover && stats && stats.pendingApprovals > 0 ? (
        <div className="campus-card p-5 bg-gradient-to-br from-gold-tint/40 to-white border border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-gold text-lg font-bold">{stats.pendingApprovals}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Pending Approval{stats.pendingApprovals !== 1 ? "s" : ""} Waiting</p>
              <p className="text-xs text-ink-soft">Leave requests from your department need your decision.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isApprover && session?.userId ? <ApprovalQueue approverId={session?.userId} /> : null}

      {canApply ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Apply For Leave</h2>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <Select label="Leave Type" value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value as LeaveType }))}>
                {LEAVE_TYPES.map((type) => <option key={type} value={type}>{type.replace("_", " ")}</option>)}
              </Select>
              <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <Textarea label="Reason" placeholder="Provide details for your absence..." value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />

            {error ? <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}

            <Button onClick={handleApply} disabled={submitting} className="mt-2 bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Your Leave History</h2>
        {loading ? (
          <div className="animate-breathe text-brass font-medium py-4">Loading history...</div>
        ) : myLeaves.length === 0 ? (
          <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
            <p className="text-sm font-medium text-slate">No leave requests filed yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...myLeaves].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((leave) => (
              <div key={leave.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-ink">{leave.leaveType.replace("_", " ")}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyle(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate uppercase tracking-wider">
                  {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                </p>
                {leave.reason ? <p className="text-sm text-ink-soft bg-white p-3 mt-1 rounded-lg border border-hairline line-clamp-2">{leave.reason}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
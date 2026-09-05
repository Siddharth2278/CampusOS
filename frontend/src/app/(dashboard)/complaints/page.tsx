"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/lib/types";

const CATEGORIES: ComplaintCategory[] = ["ACADEMIC", "FACULTY", "INFRASTRUCTURE", "DISCIPLINE", "EXAMINATION", "FEE", "OTHER"];

function statusStyle(status: ComplaintStatus) {
  if (status === "RESOLVED") return "bg-moss-tint text-moss border border-moss/20";
  if (status === "REJECTED") return "bg-brick-tint text-brick border border-brick/20";
  if (status === "IN_PROGRESS") return "bg-gold-tint text-gold border border-gold/20";
  return "bg-slate-tint text-slate border border-slate/20";
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StudentView() {
  const { session } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "ACADEMIC" as ComplaintCategory, title: "", description: "" });

  function load() {
    api.getMyComplaints()
      .then(setComplaints)
      .catch(() => setError("Unable to load complaints."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit() {
    if (!session?.profileId || !form.title || !form.description) return;
    setSubmitting(true); setError(""); setMessage("");
    try {
      await api.raiseComplaint({ studentId: session.profileId, category: form.category, title: form.title, description: form.description });
      setMessage("Complaint submitted successfully. Your class teacher will review it.");
      setForm({ category: "ACADEMIC", title: "", description: "" });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit complaint.");
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading complaints...</div>;

  return (
    <div className="space-y-8">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-6 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Raise a Complaint</h2>
          <p className="mt-1 text-sm text-ink-soft">Your complaint will be sent to your class teacher for review.</p>
        </div>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ComplaintCategory }))}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat.replace("_", " ")}</option>)}
            </Select>
            <Input label="Title" placeholder="Brief title of your complaint" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <Textarea label="Description" placeholder="Describe your complaint in detail..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          {error ? <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
          {message ? <p className="text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}
          <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.description} className="bg-brass text-white hover:bg-brass-light px-8">
            {submitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </div>
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Your Complaints</h2>
        {complaints.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No complaints filed yet.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="rounded-xl border border-hairline bg-paper/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline/60 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-ink text-lg">{c.title}</p>
                      <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brass">{c.category.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs font-medium text-slate">To: {c.classTeacherName} · {formatDate(c.createdAt)}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyle(c.status)}`}>{c.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-ink-soft bg-white p-3 rounded-lg border border-hairline">{c.description}</p>
                {c.resolution && (
                  <div className="mt-3 p-3 rounded-lg bg-moss-tint/30 border border-moss/10">
                    <p className="text-xs font-semibold text-moss uppercase tracking-wider mb-1">Resolution by {c.resolvedByName}</p>
                    <p className="text-sm text-ink-soft">{c.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherView() {
  const { session } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionId, setDecisionId] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api.getTeacherComplaints()
      .then(setComplaints)
      .catch(() => setError("Unable to load complaints."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function decide(complaintId: number, status: ComplaintStatus) {
    if (!resolution.trim()) { setError("Please enter a resolution."); return; }
    setBusyId(complaintId); setError("");
    try {
      await api.decideComplaint(complaintId, { status, resolution });
      setDecisionId(null); setResolution("");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update complaint.");
    } finally { setBusyId(null); }
  }

  if (loading) return <div className="animate-breathe text-brass font-medium py-4">Loading complaints...</div>;

  const openComplaints = complaints.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const closedComplaints = complaints.filter((c) => c.status === "RESOLVED" || c.status === "REJECTED");

  return (
    <div className="space-y-8">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-6 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Student Complaints</h2>
          <p className="mt-1 text-sm text-ink-soft">Review and resolve complaints from your class students.</p>
        </div>

        {error ? <p className="mb-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}

        {openComplaints.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No open complaints.</p>
        ) : (
          <div className="space-y-4">
            {openComplaints.map((c) => (
              <div key={c.id} className="rounded-xl border border-hairline bg-paper/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline/60 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-ink text-lg">{c.title}</p>
                      <span className="rounded-full bg-brass-tint border border-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brass">{c.category.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs font-medium text-slate">From: {c.studentName} · {formatDate(c.createdAt)}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyle(c.status)}`}>{c.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-ink-soft bg-white p-3 rounded-lg border border-hairline">{c.description}</p>

                {decisionId === c.id ? (
                  <div className="mt-4 pt-3 border-t border-hairline space-y-3">
                    <Textarea label="Resolution / Remarks" placeholder="Enter your response..." value={resolution} onChange={(e) => setResolution(e.target.value)} />
                    <div className="flex gap-2">
                      <Button className="bg-moss text-white hover:bg-moss/90 px-6 text-sm" onClick={() => decide(c.id, "RESOLVED")} disabled={busyId === c.id || !resolution.trim()}>Resolve</Button>
                      <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white px-6 text-sm" onClick={() => decide(c.id, "REJECTED")} disabled={busyId === c.id || !resolution.trim()}>Reject</Button>
                      <Button variant="secondary" className="bg-slate-tint text-ink px-4 text-sm" onClick={() => { setDecisionId(null); setResolution(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" className="mt-4 bg-slate-tint text-ink hover:bg-hairline text-sm px-4" onClick={() => setDecisionId(c.id)}>Respond</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {closedComplaints.length > 0 && (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Resolved Complaints</h2>
          <div className="space-y-4">
            {closedComplaints.map((c) => (
              <div key={c.id} className="rounded-xl border border-hairline bg-paper/50 p-5 opacity-70">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-ink">{c.title}</p>
                    <p className="text-xs font-medium text-slate">From: {c.studentName} · {formatDate(c.createdAt)}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyle(c.status)}`}>{c.status.replace("_", " ")}</span>
                </div>
                {c.resolution && (
                  <p className="text-sm text-ink-soft bg-white p-3 rounded-lg border border-hairline mt-2">{c.resolution}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComplaintsPage() {
  const { session } = useAuth();

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Complaints</h1>
        <p className="mt-2 text-ink-soft text-base">
          {session?.role === "STUDENT" ? "Raise complaints and track their status." : "Review and resolve student complaints."}
        </p>
      </header>

      {session?.role === "STUDENT" ? <StudentView /> : null}
      {(session?.role === "TEACHER" || session?.role === "HOD") ? <TeacherView /> : null}
      {session?.role === "PRINCIPAL" ? (
        <div className="campus-card p-8 text-center bg-slate-tint/50 border border-dashed border-slate/30">
          <p className="text-sm font-medium text-slate">Complaints are handled by class teachers. Use the Directory to view department details.</p>
        </div>
      ) : null}
    </div>
  );
}

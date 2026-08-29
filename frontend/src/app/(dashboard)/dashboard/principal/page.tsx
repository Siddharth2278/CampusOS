"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { clearSession, dashboardPath } from "@/lib/auth";
import type { PrincipalDashboard } from "@/lib/types";

export default function PrincipalDashboardPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<PrincipalDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session || session.role !== "PRINCIPAL") {
      router.replace(dashboardPath(session?.role ?? "STUDENT"));
      return;
    }
    api
      .getPrincipalDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load principal dashboard."))
      .finally(() => setLoading(false));
  }, [session?.role]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
         <div className="animate-breathe text-brass font-medium">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campus-card bg-brick-tint border-brick/30 p-6">
        <p className="text-sm font-medium text-brick">{error}</p>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="campus-page space-y-8 max-w-7xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Principal Overview</h1>
        <p className="mt-2 text-ink-soft text-base">
          Campus-wide administration and pending actions.
        </p>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Departments</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalDepartments}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Students</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalStudents}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Teachers</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalTeachers}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-brick-tint/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-brick mb-2">Pending Leaves</p>
          <p className="text-3xl font-bold text-brick">{dashboard.pendingLeaveApprovals}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Total Notices</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalNotices}</p>
        </div>
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-6 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Administration Queue</h2>
          <p className="mt-1 text-sm text-ink-soft">Review and action items across all departments.</p>
        </div>
        
        <ul className="space-y-3 text-sm text-ink font-medium">
          <li className="flex items-center gap-3 rounded-xl border border-hairline bg-paper/50 px-5 py-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brick-tint text-brick font-bold">!</span>
            <span><strong className="text-brick">{dashboard.pendingLeaveApprovals}</strong> HOD leave requests need your approval.</span>
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-hairline bg-paper/50 px-5 py-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brass-tint text-brass font-bold">🏛️</span>
            <span><strong className="text-brass">{dashboard.totalDepartments}</strong> departments are currently registered and active.</span>
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-hairline bg-paper/50 px-5 py-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-moss-tint text-moss font-bold">👥</span>
            <span><strong className="text-moss">{dashboard.totalStudents}</strong> students and <strong className="text-moss">{dashboard.totalTeachers}</strong> teachers are registered across the campus.</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-brick/20 bg-brick-tint p-6">
        <h3 className="text-sm font-bold text-brick">Principal Self-Delete — Reset Single-College System</h3>
        <p className="mt-1 text-xs font-medium text-brick/80">Deletes your Principal account and ALL college data (departments, HODs, teachers, students). After this, the Register page will show Principal option again for a new college setup. This action cannot be undone.</p>
        <button
          onClick={async () => {
            const ok = confirm("Delete Principal account and reset entire college? All data will be lost!");
            if (!ok) return;
            const c = prompt("Type DELETE to confirm");
            if (c !== "DELETE") return;
            setDeleting(true);
            try { await api.deleteOwnAccount(); clearSession(); alert("Reset complete. Redirecting to Register."); router.push("/register"); } catch (e) { alert(e instanceof ApiError ? e.message : "Delete failed"); } finally { setDeleting(false); }
          }}
          disabled={deleting}
          className="mt-4 rounded-lg bg-brick px-6 py-2.5 text-sm font-semibold text-white hover:bg-brick/90 disabled:opacity-50"
        >
          {deleting ? "Resetting..." : "Delete My Principal Account & Reset College"}
        </button>
        <p className="mt-2 text-[11px] text-brick/70">Alternative: use Profile → Danger Zone (same action) or run <code className="px-1 py-0.5 bg-white rounded">database/RESET_ALL_DATA.sql</code></p>
      </div>
    </div>
  );
}

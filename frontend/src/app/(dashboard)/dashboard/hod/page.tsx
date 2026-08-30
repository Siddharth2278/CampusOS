"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { HodDashboard } from "@/lib/types";

export default function HodDashboardPage() {
  const [dashboard, setDashboard] = useState<HodDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getHodDashboard().then(setDashboard).catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load HOD dashboard."));
  }, []);

  if (error) return <div className="campus-card bg-brick-tint border-brick/30 p-6 text-sm font-medium text-brick">{error}</div>;
  if (!dashboard) return (
    <div className="flex justify-center py-12">
       <div className="animate-breathe text-brass font-medium">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="campus-page space-y-8 max-w-7xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Welcome, {dashboard.hodName}</h1>
        <p className="mt-2 text-ink-soft text-base">
          {dashboard.departmentName} · <span className="font-medium text-slate">Head of Department</span>
        </p>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Students</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalStudents}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Teachers</p>
          <p className="text-3xl font-bold text-ink">{dashboard.totalTeachers}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Subjects</p>
          <p className="text-3xl font-bold text-ink">{dashboard.activeSubjects}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Pending Leaves</p>
          <p className="text-3xl font-bold text-brick">{dashboard.pendingLeaves}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Classes Today</p>
          <p className="text-3xl font-bold text-ink">{dashboard.classesToday}</p>
        </div>
      </div>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <div className="mb-4 border-b border-hairline pb-4">
          <h2 className="text-xl font-semibold text-ink">Department Operations</h2>
          <p className="mt-1 text-sm text-ink-soft">Your department at a glance.</p>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          Manage teachers, subjects, faculty assignments, timetables, attendance, notices, and department leave approvals from the CampusOS modules. 
          Use the navigation menu to access specific administrative actions.
        </p>
      </div>
    </div>
  );
}
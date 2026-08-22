"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, StatCard } from "@/components/ui/Card";
import type { HodDashboard } from "@/lib/types";

export default function HodDashboardPage() {
  const [dashboard, setDashboard] = useState<HodDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getHodDashboard().then(setDashboard).catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load HOD dashboard."));
  }, []);

  if (error) return <div className="rounded-xl border border-brick/30 bg-brick-tint p-6 text-sm text-brick">{error}</div>;
  if (!dashboard) return <p className="text-sm text-slate">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-semibold text-ink">Welcome, {dashboard.hodName}</h1><p className="mt-1 text-sm text-slate">{dashboard.departmentName} · Head of Department</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Students" value={dashboard.totalStudents} />
        <StatCard label="Teachers" value={dashboard.totalTeachers} />
        <StatCard label="Subjects" value={dashboard.activeSubjects} />
        <StatCard label="Pending leaves" value={dashboard.pendingLeaves} />
        <StatCard label="Classes today" value={dashboard.classesToday} />
      </div>
      <Card title="Department operations" description="Your department at a glance.">
        <p className="text-sm text-ink-soft">Manage teachers, subjects, faculty assignments, timetable, attendance, notices and department leave approvals from the CampusOS modules.</p>
      </Card>
    </div>
  );
}

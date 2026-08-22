"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, StatCard } from "@/components/ui/Card";
import type { PrincipalDashboard } from "@/lib/types";

export default function PrincipalDashboardPage() {
  const [dashboard, setDashboard] = useState<PrincipalDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPrincipalDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load principal dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-brick/30 bg-brick-tint p-6 text-sm text-brick">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Principal overview</h1>
        <p className="mt-1 text-sm text-slate">
          Campus-wide approvals and pending actions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Departments" value={dashboard.totalDepartments} />
        <StatCard label="Students" value={dashboard.totalStudents} />
        <StatCard label="Teachers" value={dashboard.totalTeachers} />
        <StatCard label="Pending leaves" value={dashboard.pendingLeaveApprovals} />
        <StatCard label="Total notices" value={dashboard.totalNotices} />
      </div>

      <Card
        title="Administration queue"
        description="Review and action items across departments."
      >
        <ul className="space-y-3 text-sm text-ink-soft">
          <li className="rounded-xl border border-slate-tint bg-paper px-4 py-3">
            {dashboard.pendingLeaveApprovals} student leave requests need approval.
          </li>
          <li className="rounded-xl border border-slate-tint bg-paper px-4 py-3">
            {dashboard.totalDepartments} departments are currently registered in CampusOS.
          </li>
          <li className="rounded-xl border border-slate-tint bg-paper px-4 py-3">
            {dashboard.totalStudents} students and {dashboard.totalTeachers} teachers are registered.
          </li>
        </ul>
      </Card>
    </div>
  );
}

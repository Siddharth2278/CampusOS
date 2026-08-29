"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/auth";
import { CalendarList } from "@/components/dashboard/CalendarList";
import { TimetableList } from "@/components/dashboard/TimetableList";
import type { TeacherDashboard } from "@/lib/types";

export default function TeacherDashboardPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.role !== "TEACHER") {
      // Role changed (e.g. promoted to HOD) — send the user to the right dashboard.
      router.replace(dashboardPath(session?.role ?? "STUDENT"));
      return;
    }

    api
      .getTeacherDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load teacher dashboard."))
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
        <h1 className="campus-gradient-text pb-1">Welcome, {dashboard.teacherName}</h1>
        <p className="mt-2 text-ink-soft text-base">
          {session?.role === "HOD" ? "Head of Department Workspace" : "Faculty Workspace"}
        </p>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Pending Leaves</p>
          <p className="text-3xl font-bold text-ink">{dashboard.pendingStudentLeaves}</p>
          <p className="text-xs text-amber-600 font-medium mt-2">Awaiting your review</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Classes Today</p>
          <p className="text-3xl font-bold text-ink">{dashboard.todaySchedule.length}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Upcoming Events</p>
          <p className="text-3xl font-bold text-ink">{dashboard.academicCalendar.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Today's Schedule</h2>
            <p className="mt-1 text-sm text-ink-soft">Your teaching sessions for today.</p>
          </div>
          <TimetableList
            entries={dashboard.todaySchedule}
            emptyMessage="No teaching sessions scheduled for today."
          />
        </div>
        
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Academic Calendar</h2>
            <p className="mt-1 text-sm text-ink-soft">Department events and deadlines.</p>
          </div>
          <CalendarList entries={dashboard.academicCalendar} />
        </div>
      </div>
    </div>
  );
}

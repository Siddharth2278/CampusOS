"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/auth";
import { CalendarList } from "@/components/dashboard/CalendarList";
import { TimetableList } from "@/components/dashboard/TimetableList";
import type { StudentDashboard } from "@/lib/types";

export default function StudentDashboardPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.role !== "STUDENT") {
      router.replace(dashboardPath(session?.role ?? "STUDENT"));
      return;
    }

    api
      .getStudentDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load student dashboard."))
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

  const attendance = dashboard.overallAttendance ?? 0;

  return (
    <div className="campus-page space-y-8 max-w-7xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">Welcome, {dashboard.studentName}</h1>
        <p className="mt-2 text-ink-soft text-base">
          {dashboard.departmentName} · <span className="font-medium text-slate">Semester {dashboard.semester}</span>
        </p>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Overall Attendance</p>
          <p className="text-3xl font-bold text-ink">{attendance.toFixed(1)}%</p>
          <p className="text-xs text-ink-soft mt-2">Across all subjects</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Leave Requests</p>
          <p className="text-3xl font-bold text-ink">{dashboard.leaveStatistics.total}</p>
          <p className="text-xs text-amber-600 font-medium mt-2">{dashboard.leaveStatistics.pending} pending review</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Approved Leaves</p>
          <p className="text-3xl font-bold text-ink">{dashboard.leaveStatistics.approved}</p>
        </div>
        <div className="campus-card p-6 bg-gradient-to-br from-white to-slate-tint/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">Classes Today</p>
          <p className="text-3xl font-bold text-ink">{dashboard.todayTimetable.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Today's Timetable</h2>
            <p className="mt-1 text-sm text-ink-soft">Your scheduled classes for today.</p>
          </div>
          <TimetableList entries={dashboard.todayTimetable} />
        </div>
        
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Academic Calendar</h2>
            <p className="mt-1 text-sm text-ink-soft">Upcoming campus events and deadlines.</p>
          </div>
          <CalendarList entries={dashboard.academicCalendar} />
        </div>
      </div>
    </div>
  );
}

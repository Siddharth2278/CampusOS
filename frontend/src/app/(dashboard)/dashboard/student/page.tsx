"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CalendarList } from "@/components/dashboard/CalendarList";
import { TimetableList } from "@/components/dashboard/TimetableList";
import { Card, StatCard } from "@/components/ui/Card";
import type { StudentDashboard } from "@/lib/types";

export default function StudentDashboardPage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.role !== "STUDENT") {
      setError("This dashboard is available only to student accounts.");
      setLoading(false);
      return;
    }

    api
      .getStudentDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load student dashboard."))
      .finally(() => setLoading(false));
  }, [session?.role]);

  if (loading) {
    return <p className="text-sm text-slate">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold-tint p-6 text-sm text-gold">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  const attendance = dashboard.overallAttendance ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome, {dashboard.studentName}
        </h1>
        <p className="mt-1 text-sm text-slate">
          {dashboard.departmentName} · Semester {dashboard.semester}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overall attendance"
          value={`${attendance.toFixed(1)}%`}
          hint="Across all subjects"
        />
        <StatCard
          label="Leave requests"
          value={dashboard.leaveStatistics.total}
          hint={`${dashboard.leaveStatistics.pending} pending`}
        />
        <StatCard
          label="Approved leaves"
          value={dashboard.leaveStatistics.approved}
        />
        <StatCard
          label="Classes today"
          value={dashboard.todayTimetable.length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Today's timetable" description="Your classes for today.">
          <TimetableList entries={dashboard.todayTimetable} />
        </Card>
        <Card title="Academic calendar" description="Upcoming campus events.">
          <CalendarList entries={dashboard.academicCalendar} />
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CalendarList } from "@/components/dashboard/CalendarList";
import { TimetableList } from "@/components/dashboard/TimetableList";
import { Card, StatCard } from "@/components/ui/Card";
import type { TeacherDashboard } from "@/lib/types";

export default function TeacherDashboardPage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.role !== "TEACHER") {
      setError("This dashboard is available only to teacher accounts.");
      setLoading(false);
      return;
    }

    api
      .getTeacherDashboard()
      .then(setDashboard)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load teacher dashboard."))
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome, {dashboard.teacherName}
        </h1>
        <p className="mt-1 text-sm text-slate">
          {session?.role === "HOD" ? "Head of Department dashboard" : "Faculty dashboard"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Pending leave requests"
          value={dashboard.pendingStudentLeaves}
          hint="Awaiting review"
        />
        <StatCard
          label="Classes today"
          value={dashboard.todaySchedule.length}
        />
        <StatCard
          label="Upcoming events"
          value={dashboard.academicCalendar.length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Today's schedule" description="Your teaching sessions today.">
          <TimetableList
            entries={dashboard.todaySchedule}
            emptyMessage="No teaching sessions scheduled for today."
          />
        </Card>
        <Card title="Academic calendar" description="Department events and deadlines.">
          <CalendarList entries={dashboard.academicCalendar} />
        </Card>
      </div>
    </div>
  );
}

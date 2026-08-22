"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Student, Teacher } from "@/lib/types";

export default function ApprovalsPage() {
  const { session } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      if (session.role === "PRINCIPAL" || session.role === "HOD") {
        setTeachers(await api.pendingTeachers());
      } else {
        setTeachers([]);
      }
      if (session.role === "TEACHER" || session.role === "HOD") {
        try {
          setStudents(await api.pendingStudents());
        } catch {
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to load approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [session?.role]);

  async function teacherAction(id: number, approved: boolean) {
    await api.approveTeacher(id, approved);
    await load();
  }

  async function studentAction(id: number, approved: boolean) {
    await api.approveStudent(id, approved);
    await load();
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Approvals</h1>
        <p className="mt-1 text-sm text-slate">
          Only registrations assigned to your role are shown here.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate">Loading approvals...</p> : null}
      {error ? <p className="text-sm text-brick">{error}</p> : null}

      {(session.role === "PRINCIPAL" || session.role === "HOD") && !loading ? (
        <Card
          title="Teacher registrations"
          description={session.role === "PRINCIPAL"
            ? "Only departments without a HOD appear in the Principal approval queue."
            : "Only teachers registered for your department appear here."}
        >
          {teachers.length === 0 ? (
            <p className="text-sm text-slate">No teacher registrations waiting for you.</p>
          ) : (
            <div className="space-y-2">
              {teachers.map(t => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="font-medium">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-slate">{t.email} · {t.department?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => teacherAction(t.id, true)}>Approve</Button>
                    <Button variant="secondary" onClick={() => teacherAction(t.id, false)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {(session.role === "TEACHER" || session.role === "HOD") && !loading ? (
        <Card title="Student registrations" description="Only students belonging to your Class Teacher assignment are shown.">
          {students.length === 0 ? (
            <p className="text-sm text-slate">No student registrations waiting for your assigned class.</p>
          ) : (
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="font-medium">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-slate">{s.enrollmentNumber} · Semester {s.semester}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => studentAction(s.id, true)}>Approve</Button>
                    <Button variant="secondary" onClick={() => studentAction(s.id, false)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

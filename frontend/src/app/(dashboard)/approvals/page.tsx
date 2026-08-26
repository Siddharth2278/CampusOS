"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="campus-gradient-text pb-1">Approvals</h1>
        <p className="mt-2 text-ink-soft text-base">
          Manage pending registrations assigned to your role.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
           <div className="animate-breathe text-brass font-medium">Loading approvals...</div>
        </div>
      ) : null}
      
      {error ? (
        <div className="campus-card bg-brick-tint border-brick/30 p-6">
          <p className="text-sm font-medium text-brick">{error}</p>
        </div>
      ) : null}

      {(session.role === "PRINCIPAL" || session.role === "HOD") && !loading ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Teacher Registrations</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {session.role === "PRINCIPAL"
                ? "Only departments without a HOD appear in the Principal approval queue."
                : "Only teachers registered for your department appear here."}
            </p>
          </div>
          
          {teachers.length === 0 ? (
            <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
              <p className="text-sm font-medium text-slate">No teacher registrations waiting for you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers.map(t => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-paper/50 p-4 transition-colors hover:border-slate-300">
                  <div>
                    <p className="font-semibold text-ink">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{t.email} · <span className="font-medium">{t.department?.name}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-moss text-white hover:bg-moss/90 px-5 text-sm shadow-sm" onClick={() => teacherAction(t.id, true)}>Approve</Button>
                    <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white px-5 text-sm transition-colors" onClick={() => teacherAction(t.id, false)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {(session.role === "TEACHER" || session.role === "HOD") && !loading ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Student Registrations</h2>
            <p className="mt-1 text-sm text-ink-soft">Only students belonging to your Class Teacher assignment are shown.</p>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
              <p className="text-sm font-medium text-slate">No student registrations waiting for your assigned class.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map(s => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-paper/50 p-4 transition-colors hover:border-slate-300">
                  <div>
                    <p className="font-semibold text-ink">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{s.enrollmentNumber} · <span className="font-medium">Semester {s.semester}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-moss text-white hover:bg-moss/90 px-5 text-sm shadow-sm" onClick={() => studentAction(s.id, true)}>Approve</Button>
                    <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white px-5 text-sm transition-colors" onClick={() => studentAction(s.id, false)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
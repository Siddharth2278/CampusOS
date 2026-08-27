"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Seal } from "@/components/ui/Seal";
import type { Department, Role } from "@/lib/types";

type RegisterRole = Extract<Role, "STUDENT" | "TEACHER" | "PRINCIPAL">;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("STUDENT");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [hasPrincipal, setHasPrincipal] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    enrollmentNumber: "", rollNumber: "", semester: "1",
    admissionYear: String(new Date().getFullYear()), departmentId: "",
  });

  // Aggressively clear lingering sessions so fresh register never redirects via old token
  useEffect(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // also clear known keys explicitly
      ["token","role","user_data","campusos_session","campusos_last_route"].forEach(k=> {
        try { localStorage.removeItem(k); sessionStorage.removeItem(k);} catch {}
      });
    } catch {}
  }, []);

  useEffect(() => {
    // Single institution: departments are global, no college filter
    api.getDepartments().then(setDepartments).catch(() => setDepartments([])).finally(() => setLoadingDepartments(false));
    api.principalExists().then(setHasPrincipal).catch(() => setHasPrincipal(false));
  }, []);

  // If principal already exists, force away from PRINCIPAL role
  useEffect(() => {
    if (hasPrincipal && role === "PRINCIPAL") setRole("STUDENT");
  }, [hasPrincipal, role]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(""); setSuccess(""); setAlreadyRegistered(false);

    if (hasPrincipal && role === "PRINCIPAL") {
      setError("A Principal already exists. Only one Principal is allowed for this single-institution system.");
      return;
    }
    if (role !== "PRINCIPAL" && !form.departmentId) { setError("Please select your department."); return; }

    setSubmitting(true);
    const payload = {
      firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password,
      ...(role === "STUDENT" ? { enrollmentNumber: form.enrollmentNumber, rollNumber: Number(form.rollNumber), semester: Number(form.semester), admissionYear: Number(form.admissionYear), departmentId: Number(form.departmentId) } : {}),
      ...(role === "TEACHER" ? { departmentId: Number(form.departmentId) } : {}),
    };

    try {
      if (role === "STUDENT") await api.registerStudent(payload);
      else if (role === "TEACHER") await api.registerTeacher(payload);
      else await api.registerPrincipal(payload);

      setSuccess(role === "PRINCIPAL" ? "Principal account created successfully." : "Registration submitted. Awaiting administrative approval.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      setAlreadyRegistered(message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already exists"));
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="campus-ambient-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <Seal size={48} />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">Create an Account</h1>
          <p className="mt-2 text-sm font-medium text-ink-soft max-w-md">
            Single-institution registration — no college selection required.
          </p>
          {hasPrincipal ? (
            <p className="mt-3 text-xs font-semibold text-brick bg-brick-tint border border-brick/20 rounded-full px-3 py-1">Principal already registered — single Principal mode</p>
          ) : (
            <p className="mt-3 text-xs font-semibold text-moss bg-moss-tint border border-moss/20 rounded-full px-3 py-1">First account must be Principal</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="campus-card p-6 sm:p-10 shadow-xl">
          <Select label="Select Account Type" value={role} onChange={(e) => { const next = e.target.value as RegisterRole; if (hasPrincipal && next === "PRINCIPAL") return; setRole(next); updateField("departmentId", ""); }}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="PRINCIPAL" disabled={hasPrincipal}>{hasPrincipal ? "Principal — Already registered" : "Principal"}</option>
          </Select>
          {hasPrincipal ? (
            <p className="mt-2 text-xs font-medium text-slate">
              Principal registration is disabled — only one Principal is allowed. Contact the existing Principal for access.
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-slate">
              First account must be Principal. Afterwards only Students & Teachers can register.
            </p>
          )}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input label="First Name" required value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
            <Input label="Last Name" required value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
          </div>

          <div className="mt-5 space-y-5">
            <Input label="Email Address" type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            <Input label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          </div>

          <div className="mt-6 pt-6 border-t border-hairline/60">
            {role === "PRINCIPAL" ? (
              hasPrincipal ? (
                <div className="rounded-lg border border-brass/20 bg-brass-tint px-4 py-4">
                  <p className="text-sm font-semibold text-ink">Principal already exists</p>
                  <p className="mt-1 text-xs font-medium text-ink-soft">
                    Only one Principal is allowed. Please register as Student or Teacher, or contact the Principal.
                  </p>
                  <Link href="/login" className="mt-3 inline-block text-xs font-semibold text-brass underline">Go to Login →</Link>
                </div>
              ) : (
                <div className="rounded-lg border border-moss/20 bg-moss-tint px-4 py-3">
                  <p className="text-xs font-medium text-moss">Principal account has full administration privileges for the single institution. No college setup required.</p>
                </div>
              )
            ) : (
              <div className="space-y-5">
                {role === "STUDENT" ? (
                  <div className="space-y-5">
                    <Input label="Enrollment Number" required value={form.enrollmentNumber} onChange={(e) => updateField("enrollmentNumber", e.target.value)} />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input label="Roll Number" type="number" required value={form.rollNumber} onChange={(e) => updateField("rollNumber", e.target.value)} />
                      <Input label={`Semester (1-8)`} type="number" min={1} max={8} required value={form.semester} onChange={(e) => updateField("semester", e.target.value)} />
                    </div>
                    <Input label="Admission Year" type="number" required value={form.admissionYear} onChange={(e) => updateField("admissionYear", e.target.value)} />
                  </div>
                ) : null}

                <Select label="Select Department" required value={form.departmentId} onChange={(e) => updateField("departmentId", e.target.value)} disabled={loadingDepartments}>
                  <option value="">{loadingDepartments ? "Loading departments..." : "Choose your department"}</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name} ({department.code})</option>)}
                </Select>
                {!loadingDepartments && departments.length === 0 ? (
                  <p className="text-xs font-medium text-brick bg-brick-tint p-3 rounded-lg border border-brick/20">No departments yet. Principal must create a department before students/teachers can register.</p>
                ) : null}
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-6 rounded-lg bg-brick-tint border border-brick/20 px-4 py-3 text-sm font-medium text-brick">
              <p>{error}</p>
              {alreadyRegistered ? <Link href="/login" className="mt-1 inline-block underline">This account exists. Go to Login.</Link> : null}
            </div>
          ) : null}
          {success ? <p className="mt-6 rounded-lg bg-moss-tint border border-moss/20 px-4 py-3 text-sm font-medium text-moss">{success}</p> : null}

          <Button type="submit" className="w-full mt-8 py-3 bg-brass text-white hover:bg-brass-light text-base shadow-md" disabled={submitting || (hasPrincipal && role === "PRINCIPAL")}>
            {submitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate">
          Already have an account? <Link href="/login" className="text-brass hover:text-brass-light transition-colors">Sign in here &rarr;</Link>
        </p>
      </div>
    </main>
  );
}

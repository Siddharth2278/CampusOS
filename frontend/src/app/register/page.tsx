"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Seal } from "@/components/ui/Seal";
import type { College, Department, Role } from "@/lib/types";

type RegisterRole = Extract<Role, "STUDENT" | "TEACHER" | "PRINCIPAL">;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("STUDENT");
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    enrollmentNumber: "", rollNumber: "", semester: "1",
    admissionYear: String(new Date().getFullYear()), departmentId: "",
    collegeName: "", collegeType: "DEGREE" as "DEGREE" | "DIPLOMA",
  });

  useEffect(() => {
    api.getColleges().then(setColleges).catch(() => setColleges([])).finally(() => setLoadingColleges(false));
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) { setDepartments([]); return; }
    setLoadingDepartments(true);
    api.getDepartments(Number(selectedCollegeId)).then(setDepartments).catch(() => setDepartments([])).finally(() => setLoadingDepartments(false));
  }, [selectedCollegeId]);

  const selectedCollege = colleges.find((c) => String(c.id) === selectedCollegeId);
  const maxSemester = selectedCollege?.totalSemesters ?? 8;

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(""); setSuccess(""); setAlreadyRegistered(false);

    if (role !== "PRINCIPAL" && !selectedCollegeId) { setError("Please select your college."); return; }
    if (role !== "PRINCIPAL" && !form.departmentId) { setError("Please select your department."); return; }

    setSubmitting(true);
    const payload = {
      firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password,
      ...(role === "STUDENT" ? { enrollmentNumber: form.enrollmentNumber, rollNumber: Number(form.rollNumber), semester: Number(form.semester), admissionYear: Number(form.admissionYear), departmentId: Number(form.departmentId) } : {}),
      ...(role === "TEACHER" ? { departmentId: Number(form.departmentId) } : {}),
      ...(role === "PRINCIPAL" ? { collegeName: form.collegeName, collegeType: form.collegeType } : {}),
    };

    try {
      if (role === "STUDENT") await api.registerStudent(payload);
      else if (role === "TEACHER") await api.registerTeacher(payload);
      else await api.registerPrincipal(payload);

      setSuccess(role === "PRINCIPAL" ? "College and Principal account created successfully." : "Registration submitted. Awaiting administrative approval.");
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
            Register your profile to access the CampusOS ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="campus-card p-6 sm:p-10 shadow-xl">
          <Select label="Select Account Type" value={role} onChange={(e) => { setRole(e.target.value as RegisterRole); setSelectedCollegeId(""); updateField("departmentId", ""); }}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="PRINCIPAL">Principal (Registers a New College)</option>
          </Select>

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
              <div className="space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate">College Setup</p>
                <Input label="College Name" required placeholder="e.g. Apex Institute of Technology" value={form.collegeName} onChange={(e) => updateField("collegeName", e.target.value)} />
                <Select label="College Type" required value={form.collegeType} onChange={(e) => updateField("collegeType", e.target.value)}>
                  <option value="DEGREE">Degree College (8 Semesters)</option>
                  <option value="DIPLOMA">Diploma College (6 Semesters)</option>
                </Select>
                <p className="text-xs font-medium text-slate">This structure cannot be changed later.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <Select label="Select College" required value={selectedCollegeId} onChange={(e) => { setSelectedCollegeId(e.target.value); updateField("departmentId", ""); updateField("semester", "1"); }} disabled={loadingColleges}>
                  <option value="">{loadingColleges ? "Loading colleges..." : "Choose your institution"}</option>
                  {colleges.map((college) => <option key={college.id} value={college.id}>{college.name} ({college.type === "DIPLOMA" ? "Diploma" : "Degree"})</option>)}
                </Select>
                {!loadingColleges && colleges.length === 0 ? (
                  <p className="text-xs font-medium text-brick bg-brick-tint p-3 rounded-lg border border-brick/20">No colleges registered yet. Ask your Principal to create an account first.</p>
                ) : null}

                {role === "STUDENT" ? (
                  <div className="space-y-5">
                    <Input label="Enrollment Number" required value={form.enrollmentNumber} onChange={(e) => updateField("enrollmentNumber", e.target.value)} />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input label="Roll Number" type="number" required value={form.rollNumber} onChange={(e) => updateField("rollNumber", e.target.value)} />
                      <Input label={`Semester (1-${maxSemester})`} type="number" min={1} max={maxSemester} required value={form.semester} onChange={(e) => updateField("semester", e.target.value)} />
                    </div>
                    <Input label="Admission Year" type="number" required value={form.admissionYear} onChange={(e) => updateField("admissionYear", e.target.value)} />
                  </div>
                ) : null}

                {selectedCollegeId ? (
                  <Select label="Select Department" required value={form.departmentId} onChange={(e) => updateField("departmentId", e.target.value)} disabled={loadingDepartments}>
                    <option value="">{loadingDepartments ? "Loading departments..." : "Choose your department"}</option>
                    {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                  </Select>
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

          <Button type="submit" className="w-full mt-8 py-3 bg-brass text-white hover:bg-brass-light text-base shadow-md" disabled={submitting}>
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
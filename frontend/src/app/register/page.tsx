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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    enrollmentNumber: "",
    rollNumber: "",
    semester: "1",
    admissionYear: String(new Date().getFullYear()),
    departmentId: "",
    collegeName: "",
    collegeType: "DEGREE" as "DEGREE" | "DIPLOMA",
  });

  // Load the list of registered colleges (for Student/Teacher to pick from)
  useEffect(() => {
    api
      .getColleges()
      .then(setColleges)
      .catch(() => setColleges([]))
      .finally(() => setLoadingColleges(false));
  }, []);

  // Once a college is chosen, load that college's departments
  useEffect(() => {
    if (!selectedCollegeId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    api
      .getDepartments(Number(selectedCollegeId))
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false));
  }, [selectedCollegeId]);

  const selectedCollege = colleges.find((c) => String(c.id) === selectedCollegeId);
  const maxSemester = selectedCollege?.totalSemesters ?? 8;

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setAlreadyRegistered(false);

    if (role !== "PRINCIPAL" && !selectedCollegeId) {
      setError("Please select your college.");
      return;
    }
    if (role !== "PRINCIPAL" && !form.departmentId) {
      setError("Please select your department.");
      return;
    }

    setSubmitting(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      ...(role === "STUDENT"
        ? {
            enrollmentNumber: form.enrollmentNumber,
            rollNumber: Number(form.rollNumber),
            semester: Number(form.semester),
            admissionYear: Number(form.admissionYear),
            departmentId: Number(form.departmentId),
          }
        : {}),
      ...(role === "TEACHER"
        ? { departmentId: Number(form.departmentId) }
        : {}),
      ...(role === "PRINCIPAL"
        ? { collegeName: form.collegeName, collegeType: form.collegeType }
        : {}),
    };

    try {
      if (role === "STUDENT") {
        await api.registerStudent(payload);
      } else if (role === "TEACHER") {
        await api.registerTeacher(payload);
      } else {
        await api.registerPrincipal(payload);
      }

      setSuccess(
        role === "PRINCIPAL"
          ? "College and Principal account created successfully."
          : "Registration submitted. Your assigned approver must approve the account before login."
      );
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.";
      setAlreadyRegistered(message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already exists"));
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <Seal size={40} />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-slate">
            Register as a student, teacher, or create a new college as its Principal. HOD accounts are created by promoting an approved teacher.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-hairline bg-surface p-6"
        >
          <Select
            label="Account type"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as RegisterRole);
              setSelectedCollegeId("");
              updateField("departmentId", "");
            }}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="PRINCIPAL">Principal (creates a new college)</option>
          </Select>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
            <Input
              label="Last name"
              required
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>

          {role === "PRINCIPAL" ? (
            <div className="mt-4 space-y-4 rounded-md border border-hairline p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">
                Set up your college
              </p>
              <Input
                label="College name"
                required
                placeholder="e.g. Acme Institute of Technology"
                value={form.collegeName}
                onChange={(e) => updateField("collegeName", e.target.value)}
              />
              <Select
                label="College type"
                required
                value={form.collegeType}
                onChange={(e) => updateField("collegeType", e.target.value)}
              >
                <option value="DEGREE">Degree college (8 semesters)</option>
                <option value="DIPLOMA">Diploma college (6 semesters)</option>
              </Select>
              <p className="text-xs text-slate">
                This can&apos;t be changed later, so pick the option that matches your college&apos;s actual program length.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <Select
                label="College"
                required
                value={selectedCollegeId}
                onChange={(e) => {
                  setSelectedCollegeId(e.target.value);
                  updateField("departmentId", "");
                  updateField("semester", "1");
                }}
                disabled={loadingColleges}
              >
                <option value="">
                  {loadingColleges ? "Loading colleges..." : "Select your college"}
                </option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name} ({college.type === "DIPLOMA" ? "Diploma" : "Degree"})
                  </option>
                ))}
              </Select>
              {!loadingColleges && colleges.length === 0 ? (
                <p className="mt-2 text-xs text-slate">
                  No colleges registered yet. Ask your Principal to create your college&apos;s account first, or{" "}
                  <button
                    type="button"
                    className="font-semibold text-brass underline"
                    onClick={() => setRole("PRINCIPAL")}
                  >
                    register as Principal
                  </button>
                  .
                </p>
              ) : null}
            </div>
          )}

          {role === "STUDENT" ? (
            <div className="mt-4 space-y-4">
              <Input
                label="Enrollment number"
                required
                value={form.enrollmentNumber}
                onChange={(e) => updateField("enrollmentNumber", e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Roll number"
                  type="number"
                  required
                  value={form.rollNumber}
                  onChange={(e) => updateField("rollNumber", e.target.value)}
                />
                <Input
                  label={`Semester (1-${maxSemester})`}
                  type="number"
                  min={1}
                  max={maxSemester}
                  required
                  value={form.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                />
              </div>
              <Input
                label="Admission year"
                type="number"
                required
                value={form.admissionYear}
                onChange={(e) => updateField("admissionYear", e.target.value)}
              />
            </div>
          ) : null}

          {(role === "STUDENT" || role === "TEACHER") && selectedCollegeId ? (
            <div className="mt-4">
              <Select
                label="Department"
                required
                value={form.departmentId}
                onChange={(e) => updateField("departmentId", e.target.value)}
                disabled={loadingDepartments}
              >
                <option value="">
                  {loadingDepartments ? "Loading departments..." : "Select department"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
              {!loadingDepartments && departments.length === 0 ? (
                <p className="mt-2 text-xs text-slate">
                  This college has no departments yet. Ask your Principal to add one.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-md bg-brick-tint px-3 py-3 text-sm text-brick">
              <p>{error}</p>
              {alreadyRegistered ? (
                <Link href="/login" className="mt-2 inline-block font-semibold underline">
                  This account already exists — go to Login
                </Link>
              ) : null}
            </div>
          ) : null}
          {success ? (
            <p className="mt-4 rounded-md bg-moss-tint px-3 py-2 text-sm text-moss">
              {success}
            </p>
          ) : null}

          <Button type="submit" fullWidth className="mt-6" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brass hover:text-brass-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

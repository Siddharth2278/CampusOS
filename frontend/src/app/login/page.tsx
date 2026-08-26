"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Seal } from "@/components/ui/Seal";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-sm md:grid-cols-2">
        {/* Left panel - institutional identity, not marketing */}
        <div className="hidden flex-col justify-between bg-slate-tint p-10 md:flex lg:p-14">
          <div>
            <div className="flex items-center gap-3">
              <Seal size={40} />
              <span className="font-display text-xl font-bold text-ink">
                Campus<span className="text-brass">OS</span>
              </span>
            </div>
            <div className="mt-24">
              <h1 className="text-3xl font-bold leading-tight text-ink">
                College administration,
                <br />
                in one place.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">
                Attendance, exams, timetables, assignments, and notices — a
                single system for your Principal, HODs, teachers, and
                students.
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-ink-soft">
            CampusOS &middot; Academic administration
          </p>
        </div>

        {/* Right panel - the form */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <div className="md:hidden">
            <Seal size={36} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brass">
            Welcome back
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Use your registered account to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? (
              <div className="rounded-lg border border-brick/20 bg-brick-tint px-4 py-3 text-sm font-medium text-brick">
                {error}
              </div>
            ) : null}
            <Button type="submit" fullWidth disabled={submitting} className="py-3">
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
            <div className="flex items-center justify-between pt-1 text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-brass hover:text-brass-light"
              >
                Forgot password?
              </Link>
              <Link
                href="/register"
                className="font-medium text-ink-soft hover:text-ink"
              >
                Create account →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

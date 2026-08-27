"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { clearSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Seal } from "@/components/ui/Seal";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Aggressively clear any lingering session so login never auto-redirects to previous account
  useEffect(() => {
    try {
      clearSession();
      localStorage.clear();
      sessionStorage.clear();
      ["token","role","user_data","campusos_session","campusos_last_route"].forEach(k => {
        try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {}
      });
      // clear per-account last routes
      try {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith("campusos_last_route:")) localStorage.removeItem(k);
        });
      } catch {}
    } catch {}
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="campus-ambient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="campus-card grid w-full max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xl md:grid-cols-2 p-0">
        
        {/* Left Panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-50 to-slate-tint p-10 md:flex lg:p-14 border-r border-hairline">
          <div>
            <div className="flex items-center gap-3">
              <Seal size={40} />
              <span className="font-display text-2xl font-bold text-ink tracking-tight">
                Campus<span className="text-brass">OS</span>
              </span>
            </div>
            <div className="mt-24">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-ink tracking-tight">
                College administration,
                <br />
                <span className="campus-gradient-text pb-1">in one place.</span>
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-soft font-medium">
                Attendance, exams, timetables, assignments, and notices — a
                single enterprise system for your Principal, HODs, teachers, and students.
              </p>
            </div>
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate">
            CampusOS &middot; Academic administration
          </p>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white">
          <div className="md:hidden mb-8">
            <Seal size={40} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-brass">
            Welcome Back
          </p>
          <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-ink tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-ink-soft font-medium">
            Use your registered credentials to access your workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              label="Email Address"
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
            
            <Button type="submit" className="w-full bg-brass text-white hover:bg-brass-light py-3 mt-2 text-base shadow-md" disabled={submitting}>
              {submitting ? "Authenticating..." : "Sign In"}
            </Button>
            
            <div className="flex items-center justify-between pt-4 text-sm font-medium">
              <Link href="/forgot-password" className="text-slate hover:text-brass transition-colors">
                Forgot password?
              </Link>
              <Link href="/register" className="text-brass hover:text-brass-light transition-colors">
                Create account &rarr;
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
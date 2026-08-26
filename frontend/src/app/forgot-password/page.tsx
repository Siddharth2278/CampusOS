"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { Seal } from "@/components/ui/Seal";

function getError(error: unknown) {
  if (error instanceof ApiError) {
    try {
      const body = JSON.parse(error.message);
      return body.message || body.error || error.message;
    } catch {
      return error.message;
    }
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resend, setResend] = useState(0);

  useEffect(() => {
    if (!resend) return;
    const timer = window.setInterval(() => setResend((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resend]);

  async function requestOtp(e?: FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return setError("Enter your registered email address.");
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.requestPasswordOtp(email.trim());
      setSuccess(result.message || "Verification code sent.");
      setStep(2);
      setResend(60);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e?: FormEvent) {
    e?.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit verification code.");
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.verifyPasswordOtp(email.trim(), otp);
      setSuccess(result.message || "OTP verified.");
      setStep(3);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset(e?: FormEvent) {
    e?.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.resetPassword({ email: email.trim(), otp, newPassword: password });
      setSuccess(result.message || "Password reset successfully.");
      window.setTimeout(() => window.location.assign("/login"), 1200);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-brass focus:ring-4 focus:ring-brass/10";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-ink-soft";
  const buttonClass =
    "w-full rounded-lg bg-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brass-light disabled:opacity-50";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-sm lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden flex-col justify-between bg-slate-tint p-10 lg:flex xl:p-14">
          <div>
            <Link href="/login" className="inline-flex items-center gap-3">
              <Seal size={40} />
              <span className="font-display text-xl font-bold text-ink">
                Campus<span className="text-brass">OS</span>
              </span>
            </Link>
            <div className="mt-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-brass">
                Account recovery
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-ink">
                Get back into your workspace.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">
                Verify your email, confirm the one-time code, and set a new
                password securely.
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-ink-soft">
            CampusOS security &middot; OTP protected
          </p>
        </div>

        {/* Right panel */}
        <div className="p-6 sm:p-9 lg:p-14">
          <Link href="/login" className="text-sm font-medium text-brass hover:text-brass-light">
            ← Back to sign in
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">
              Reset password
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Secure account recovery</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {step === 1
                ? "We'll send a verification code to your registered email."
                : step === 2
                ? "Enter the code we sent you."
                : "Choose a new password for your CampusOS account."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {["Email", "Verify", "Reset"].map((label, i) => {
              const active = i + 1 <= step;
              return (
                <div key={label}>
                  <div className={`h-1.5 rounded-full ${active ? "bg-brass" : "bg-hairline"}`} />
                  <p
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                      active ? "text-brass" : "text-ink-soft"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            {step === 1 && (
              <form onSubmit={requestOtp} className="space-y-4">
                <label className={labelClass}>
                  Registered email
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoFocus
                    required
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>
                <div className="rounded-lg border border-hairline bg-slate-tint p-4 text-xs leading-5 text-ink-soft">
                  Your OTP expires automatically. Never share your verification code with anyone.
                </div>
                <button disabled={busy} className={buttonClass}>
                  {busy ? "Sending code..." : "Send verification code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="rounded-lg border border-hairline bg-slate-tint p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                    Code sent to
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">{email}</p>
                </div>
                <label className={labelClass}>
                  One-time password
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    className={`${inputClass} text-center text-2xl font-bold tracking-[.4em]`}
                  />
                </label>
                <button disabled={busy || otp.length !== 6} className={buttonClass}>
                  {busy ? "Checking code..." : "Verify code"}
                </button>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="text-ink-soft hover:text-ink"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    disabled={busy || resend > 0}
                    onClick={() => requestOtp()}
                    className="text-brass disabled:text-ink-soft"
                  >
                    {resend ? `Resend in ${resend}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={reset} className="space-y-4">
                <label className={labelClass}>
                  New password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    minLength={8}
                    placeholder="At least 8 characters"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Confirm password
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={8}
                    placeholder="Repeat your new password"
                    className={inputClass}
                  />
                </label>
                <div className="rounded-lg border border-hairline bg-slate-tint p-4 text-xs leading-5 text-ink-soft">
                  Use at least 8 characters and avoid reusing an old password.
                </div>
                <button disabled={busy} className={buttonClass}>
                  {busy ? "Updating password..." : "Reset password"}
                </button>
              </form>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-brick/20 bg-brick-tint px-4 py-3 text-sm font-medium text-brick">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg border border-moss/20 bg-moss-tint px-4 py-3 text-sm font-medium text-moss">
              ✓ {success}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

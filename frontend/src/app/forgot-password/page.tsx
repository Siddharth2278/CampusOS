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
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await api.requestPasswordOtp(email.trim());
      setSuccess(result.message || "Verification code sent.");
      setStep(2); setResend(60);
    } catch (err) { setError(getError(err)); } 
    finally { setBusy(false); }
  }

  async function verifyOtp(e?: FormEvent) {
    e?.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit verification code.");
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await api.verifyPasswordOtp(email.trim(), otp);
      setSuccess(result.message || "OTP verified.");
      setStep(3);
    } catch (err) { setError(getError(err)); } 
    finally { setBusy(false); }
  }

  async function reset(e?: FormEvent) {
    e?.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await api.resetPassword({ email: email.trim(), otp, newPassword: password });
      setSuccess(result.message || "Password reset successfully.");
      window.setTimeout(() => window.location.assign("/login"), 1200);
    } catch (err) { setError(getError(err)); } 
    finally { setBusy(false); }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none transition-all focus:border-brass focus:ring-2 focus:ring-brass/20";
  const labelClass = "block text-sm font-semibold text-slate";
  const buttonClass = "w-full rounded-xl bg-brass px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brass-light disabled:opacity-50";

  return (
    <main className="campus-ambient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <section className="campus-card grid w-full max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xl lg:grid-cols-2 p-0">
        
        {/* Left panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-50 to-slate-tint p-10 lg:flex xl:p-14 border-r border-hairline">
          <div>
            <Link href="/login" className="flex items-center gap-3 w-fit">
              <Seal size={40} />
              <span className="font-display text-2xl font-bold text-ink tracking-tight">
                Campus<span className="text-brass">OS</span>
              </span>
            </Link>
            <div className="mt-24">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brass">
                Account Recovery
              </p>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight text-ink tracking-tight">
                Get back into<br />your workspace.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-soft font-medium">
                Verify your email, confirm the secure one-time code, and set a new password to regain access to CampusOS.
              </p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">
            CampusOS Security &middot; OTP Protected
          </p>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white">
          <Link href="/login" className="text-sm font-semibold text-brass hover:text-brass-light transition-colors w-fit mb-8">
            &larr; Back to sign in
          </Link>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brass">
              Reset Password
            </p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-ink tracking-tight">Secure Recovery</h2>
            <p className="mt-2 text-sm text-ink-soft font-medium">
              {step === 1 ? "We'll send a verification code to your registered email." : step === 2 ? "Enter the 6-digit code we sent you." : "Choose a new password for your account."}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Email", "Verify", "Reset"].map((label, i) => {
              const active = i + 1 <= step;
              return (
                <div key={label}>
                  <div className={`h-1.5 rounded-full ${active ? "bg-brass" : "bg-hairline"}`} />
                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${active ? "text-brass" : "text-slate"}`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            {step === 1 && (
              <form onSubmit={requestOtp} className="space-y-5">
                <label className={labelClass}>
                  Registered Email Address
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoFocus required placeholder="you@example.com" className={inputClass} />
                </label>
                <div className="rounded-xl border border-hairline bg-slate-tint/50 p-4 text-xs leading-relaxed text-ink-soft font-medium">
                  Your OTP expires automatically. Never share your verification code with anyone.
                </div>
                <button disabled={busy} className={buttonClass}>
                  {busy ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div className="rounded-xl border border-hairline bg-slate-tint/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Code sent to</p>
                  <p className="mt-1 truncate text-sm font-bold text-ink">{email}</p>
                </div>
                <label className={labelClass}>
                  One-Time Password
                  <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus placeholder="000000" className={`${inputClass} text-center text-3xl font-bold tracking-[.4em] py-4`} />
                </label>
                <button disabled={busy || otp.length !== 6} className={buttonClass}>
                  {busy ? "Checking Code..." : "Verify Code"}
                </button>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mt-4">
                  <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="text-slate hover:text-ink transition-colors">
                    Change Email
                  </button>
                  <button type="button" disabled={busy || resend > 0} onClick={() => requestOtp()} className="text-brass disabled:text-slate transition-colors">
                    {resend ? `Resend in ${resend}s` : "Resend Code"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={reset} className="space-y-5">
                <label className={labelClass}>
                  New Password
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus minLength={8} placeholder="At least 8 characters" className={inputClass} />
                </label>
                <label className={labelClass}>
                  Confirm Password
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} placeholder="Repeat your new password" className={inputClass} />
                </label>
                <button disabled={busy} className={buttonClass}>
                  {busy ? "Updating Password..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>

          {error && <div className="mt-6 rounded-lg border border-brick/20 bg-brick-tint px-4 py-3 text-sm font-medium text-brick">{error}</div>}
          {success && <div className="mt-6 rounded-lg border border-moss/20 bg-moss-tint px-4 py-3 text-sm font-medium text-moss">✓ {success}</div>}
        </div>
      </section>
    </main>
  );
}
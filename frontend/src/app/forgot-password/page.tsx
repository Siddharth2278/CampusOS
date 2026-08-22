"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";

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
  const [step,setStep]=useState<1|2|3>(1);
  const [email,setEmail]=useState("");
  const [otp,setOtp]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [resend,setResend]=useState(0);

  useEffect(() => {
    if (!resend) return;
    const timer=window.setInterval(() => setResend(v => Math.max(0,v-1)),1000);
    return () => window.clearInterval(timer);
  },[resend]);

  async function requestOtp(e?:FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return setError("Enter your registered email address.");
    setBusy(true); setError(""); setSuccess("");
    try {
      const result=await api.requestPasswordOtp(email.trim());
      setSuccess(result.message || "Verification code sent.");
      setStep(2); setResend(60);
    } catch(err) { setError(getError(err)); }
    finally { setBusy(false); }
  }

  async function verifyOtp(e?:FormEvent) {
    e?.preventDefault();
    if (otp.length!==6) return setError("Enter the complete 6-digit verification code.");
    setBusy(true); setError(""); setSuccess("");
    try {
      const result=await api.verifyPasswordOtp(email.trim(),otp);
      setSuccess(result.message || "OTP verified.");
      setStep(3);
    } catch(err) { setError(getError(err)); }
    finally { setBusy(false); }
  }

  async function reset(e?:FormEvent) {
    e?.preventDefault();
    if (password.length<8) return setError("Password must be at least 8 characters.");
    if (password!==confirm) return setError("Passwords do not match.");
    setBusy(true); setError(""); setSuccess("");
    try {
      const result=await api.resetPassword({email:email.trim(),otp,newPassword:password});
      setSuccess(result.message || "Password reset successfully.");
      window.setTimeout(() => window.location.assign("/login"), 1200);
    } catch(err) { setError(getError(err)); }
    finally { setBusy(false); }
  }

  return (
    <main className="campus-login-bg relative min-h-screen overflow-hidden px-4 py-7 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute left-[5%] top-[8%] h-64 w-64 rounded-full bg-[#7c6cff]/15 blur-3xl"/>
      <div className="pointer-events-none absolute bottom-[5%] right-[6%] h-72 w-72 rounded-full bg-[#32d2a1]/8 blur-3xl"/>

      <div className="relative mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1527]/85 shadow-[0_45px_120px_rgba(0,0,0,.42)] backdrop-blur-2xl lg:grid-cols-[.85fr_1.15fr]">
          <div className="hidden min-h-[650px] flex-col justify-between border-r border-white/10 p-10 lg:flex xl:p-14">
            <div>
              <Link href="/login" className="inline-flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.05]">✦</div>
                <span className="font-display text-xl font-black text-white">Campus<span className="text-[#a69bff]">OS</span></span>
              </Link>
              <div className="mt-28">
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#9d93ff]">Account recovery</p>
                <h1 className="mt-4 text-5xl font-black leading-[1.04] tracking-[-.045em] text-white">Get back into your workspace.</h1>
                <p className="mt-6 max-w-md text-sm leading-6 text-[#8996aa]">Verify your email, confirm the one-time code, and create a new password securely.</p>
              </div>
            </div>
            <p className="text-xs text-[#66748b]">CampusOS security • OTP protected</p>
          </div>

          <div className="p-6 sm:p-9 lg:p-14">
            <Link href="/login" className="text-sm font-semibold text-[#8f87ff] hover:text-white">← Back to sign in</Link>

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#9d93ff]">Reset password</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-white">Secure account recovery</h2>
              <p className="mt-2 text-sm leading-6 text-[#8694aa]">
                {step===1 ? "We'll send a verification code to your registered email." : step===2 ? "Enter the code we sent you." : "Choose a new password for your CampusOS account."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2">
              {["Email","Verify","Reset"].map((label,i) => {
                const active=i+1<=step;
                return <div key={label}><div className={`h-1.5 rounded-full ${active?"bg-gradient-to-r from-[#8b7cff] to-[#5b54d6]":"bg-[#1b2940]"}`}/><p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${active?"text-[#c0baff]":"text-[#65738a]"}`}>{label}</p></div>;
              })}
            </div>

            <div className="mt-8">
              {step===1 && <form onSubmit={requestOtp} className="space-y-5">
                <label className="block text-xs font-black uppercase tracking-[.08em] text-[#8996aa]">
                  Registered email
                  <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoFocus required placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-[#2b3a55] bg-[#071221] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#8b7cff] focus:ring-4 focus:ring-[#8b7cff]/10"/>
                </label>
                <div className="rounded-2xl border border-[#263650] bg-white/[.025] p-4 text-xs leading-5 text-[#718097]">Your OTP expires automatically. Never share your verification code with anyone.</div>
                <button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-[#8b7cff] to-[#5b54d6] px-5 py-3.5 text-sm font-black text-white shadow-[0_15px_32px_rgba(99,91,255,.25)] transition hover:-translate-y-0.5 disabled:opacity-45">{busy?"Sending code…":"Send verification code"}</button>
              </form>}

              {step===2 && <form onSubmit={verifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-[#263650] bg-white/[.025] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#718097]">Code sent to</p><p className="mt-1 truncate text-sm font-bold text-white">{email}</p></div>
                <label className="block text-xs font-black uppercase tracking-[.08em] text-[#8996aa]">
                  One-time password
                  <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus placeholder="000000" className="mt-2 w-full rounded-2xl border border-[#2b3a55] bg-[#071221] px-4 py-4 text-center text-3xl font-black tracking-[.4em] text-white outline-none focus:border-[#8b7cff] focus:ring-4 focus:ring-[#8b7cff]/10"/>
                </label>
                <button disabled={busy||otp.length!==6} className="w-full rounded-2xl bg-gradient-to-r from-[#8b7cff] to-[#5b54d6] px-5 py-3.5 text-sm font-black text-white shadow-[0_15px_32px_rgba(99,91,255,.25)] transition hover:-translate-y-0.5 disabled:opacity-45">{busy?"Checking code…":"Verify code"}</button>
                <div className="flex items-center justify-between text-xs font-bold"><button type="button" onClick={()=>{setStep(1);setOtp("");setError("");}} className="text-[#7a879d] hover:text-white">Change email</button><button type="button" disabled={busy||resend>0} onClick={()=>requestOtp()} className="text-[#aaa2ff] disabled:text-[#59667a]">{resend?`Resend in ${resend}s`:"Resend code"}</button></div>
              </form>}

              {step===3 && <form onSubmit={reset} className="space-y-5">
                <label className="block text-xs font-black uppercase tracking-[.08em] text-[#8996aa]">New password
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoFocus minLength={8} placeholder="At least 8 characters" className="mt-2 w-full rounded-2xl border border-[#2b3a55] bg-[#071221] px-4 py-3.5 text-sm text-white outline-none focus:border-[#8b7cff] focus:ring-4 focus:ring-[#8b7cff]/10"/>
                </label>
                <label className="block text-xs font-black uppercase tracking-[.08em] text-[#8996aa]">Confirm password
                  <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={8} placeholder="Repeat your new password" className="mt-2 w-full rounded-2xl border border-[#2b3a55] bg-[#071221] px-4 py-3.5 text-sm text-white outline-none focus:border-[#8b7cff] focus:ring-4 focus:ring-[#8b7cff]/10"/>
                </label>
                <div className="rounded-2xl border border-[#263650] bg-white/[.025] p-4 text-xs leading-5 text-[#718097]">Use at least 8 characters and avoid reusing an old password.</div>
                <button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-[#8b7cff] to-[#5b54d6] px-5 py-3.5 text-sm font-black text-white shadow-[0_15px_32px_rgba(99,91,255,.25)] transition hover:-translate-y-0.5 disabled:opacity-45">{busy?"Updating password…":"Reset password"}</button>
              </form>}
            </div>

            {error && <div className="mt-5 rounded-2xl border border-[#713142] bg-[#2e1721] px-4 py-3 text-sm font-medium text-[#ff9aac]">{error}</div>}
            {success && <div className="mt-5 rounded-2xl border border-[#255845] bg-[#12332d] px-4 py-3 text-sm font-medium text-[#78e3c0]">✓ {success}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

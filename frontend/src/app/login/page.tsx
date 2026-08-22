"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Seal } from "@/components/ui/Seal";

export default function LoginPage(){
  const {login}=useAuth();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [submitting,setSubmitting]=useState(false);

  async function handleSubmit(e:FormEvent){
    e.preventDefault(); setError(""); setSubmitting(true);
    try{ await login(email,password); }
    catch(err){ setError(err instanceof ApiError ? err.message : "Unable to sign in. Check your credentials and try again."); }
    finally{ setSubmitting(false); }
  }

  return (
    <div className="campus-login-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-brass/15 blur-3xl"/>
      <div className="pointer-events-none absolute bottom-[8%] right-[7%] h-64 w-64 rounded-full bg-moss/10 blur-3xl"/>
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1527]/80 shadow-[0_40px_120px_rgba(0,0,0,.42)] backdrop-blur-2xl md:grid-cols-[1.1fr_.9fr]">
        <div className="hidden min-h-[660px] flex-col justify-between border-r border-white/10 p-10 md:flex lg:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.05] shadow-lg"><Seal size={30}/></div>
              <div className="font-display text-xl font-black tracking-tight text-white">Campus<span className="text-[#a69bff]">OS</span></div>
            </div>
            <div className="mt-28 max-w-xl">
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#9e95ff]">Smart campus workspace</p>
              <h1 className="mt-5 text-5xl font-black leading-[1.04] tracking-[-.045em] text-white">
                Everything your campus needs.<br/><span className="text-[#a69bff]">One workspace.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate">
                Attendance, assignments, exams, timetables, notices and AI assistance in one secure system.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {["Role-based","Secure","AI assisted"].map(x=><span key={x} className="rounded-full border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-bold text-slate">{x}</span>)}
              </div>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate/70">CampusOS • Modern academic operations</p>
        </div>

        <div className="flex min-h-[660px] flex-col justify-center p-6 sm:p-9 lg:p-14">
          <div className="md:hidden"><Seal size={38}/></div>
          <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-[#9e95ff]">Welcome back</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-white">Sign in to CampusOS</h2>
          <p className="mt-2 text-sm leading-6 text-slate">Use your registered account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            <Input label="Email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
            <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
            {error ? <div className="rounded-xl border border-brick/20 bg-brick-tint px-4 py-3 text-sm font-medium text-brick">{error}</div> : null}
            <Button type="submit" fullWidth disabled={submitting} className="mt-2 py-3.5">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
            <div className="flex items-center justify-between pt-1 text-sm">
              <Link href="/forgot-password" className="font-semibold text-[#aaa2ff] hover:text-white">Forgot password?</Link>
              <Link href="/register" className="font-semibold text-slate hover:text-white">Create account →</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

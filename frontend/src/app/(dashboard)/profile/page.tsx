 "use client";
import { useEffect,useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Profile(){
 const {session}=useAuth(); const [name,setName]=useState(session?.displayName??""); const [email,setEmail]=useState(session?.email??""); const [phone,setPhone]=useState(""); const [msg,setMsg]=useState("");
 useEffect(()=>{setName(session?.displayName??"");setEmail(session?.email??"")},[session]);
 async function save(){
  setMsg("");
  try{ const base=process.env.NEXT_PUBLIC_API_URL??"http://localhost:8080"; const raw=sessionStorage.getItem("campusos_session"); const token=raw?JSON.parse(raw).token:"";
   const r=await fetch(`${base}/api/profile`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({displayName:name,email,phone})});
   if(!r.ok)throw new Error(); setMsg("Profile updated successfully.");
  }catch{setMsg("Profile API is not connected yet. Your existing backend remains unchanged.");}
 }
 return <main className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8"><div className="campus-card">
  <div className="border-b border-hairline p-6"><h1 className="font-display text-2xl font-semibold text-ink">My Profile</h1><p className="mt-1 text-sm text-slate">Manage your personal information and account security.</p></div>
  <div className="grid gap-8 p-6 md:grid-cols-[180px_1fr]"><div className="text-center"><div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brass-tint text-3xl font-semibold text-brass">{(name||"U").slice(0,1).toUpperCase()}</div><button className="mt-3 text-sm font-semibold text-brass">Change photo</button></div>
  <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-ink">Full name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-hairline bg-paper px-4 py-3 outline-none focus:border-brass"/></label><label className="text-sm font-medium text-ink">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-xl border border-hairline bg-paper px-4 py-3 outline-none focus:border-brass"/></label></div><label className="text-sm font-medium text-ink">Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-hairline bg-paper px-4 py-3 outline-none focus:border-brass" placeholder="Add phone number"/></label>
  <div className="rounded-2xl border border-hairline bg-paper p-4"><p className="text-xs uppercase tracking-wider text-slate">Account</p><p className="mt-2 font-semibold text-ink">{session?.role}</p><p className="text-sm text-slate">Role is managed by CampusOS administration.</p></div>{msg&&<p className="text-sm text-brass">{msg}</p>}<div className="flex flex-wrap gap-3"><button onClick={save} className="rounded-xl bg-brass px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brass-light">Save changes</button><a href="/settings/password" className="rounded-xl border border-hairline bg-surface px-5 py-3 text-sm font-bold text-ink transition hover:border-brass/40 hover:bg-brass-tint">Change password</a></div>
  </div></div></div></main>
}
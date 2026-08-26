"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function Profile() {
  const { session } = useAuth(); 
  const [name, setName] = useState(session?.displayName ?? ""); 
  const [email, setEmail] = useState(session?.email ?? ""); 
  const [phone, setPhone] = useState(""); 
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setName(session?.displayName ?? "");
    setEmail(session?.email ?? "");
  }, [session]);

  async function save() {
    setMsg("");
    try { 
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"; 
      const raw = sessionStorage.getItem("campusos_session"); 
      const token = raw ? JSON.parse(raw).token : "";
      
      const r = await fetch(`${base}/api/profile`,{
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: name, email, phone })
      });
      if(!r.ok) throw new Error(); 
      setMsg("Profile updated successfully.");
    } catch {
      setMsg("Profile API is not connected yet. Your existing backend remains unchanged.");
    }
  }

  return (
    <div className="campus-page max-w-4xl mx-auto py-6">
      <div className="campus-card campus-reveal">
        <div className="border-b border-hairline p-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-ink">My Profile</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage your personal information and account security.</p>
        </div>
        
        <div className="grid gap-8 p-6 lg:p-8 md:grid-cols-[180px_1fr]">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-32 w-32 rounded-full border-4 border-white bg-brass-tint text-4xl font-semibold text-brass shadow-md">
              {(name || "U").slice(0,1).toUpperCase()}
            </div>
            <button className="mt-4 text-sm font-semibold text-brass hover:text-brass-light transition-colors">Change Photo</button>
          </div>
          
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate">Full Name
                <input 
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all"
                />
              </label>
              <label className="text-sm font-semibold text-slate">Email Address
                <input 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  type="email" 
                  className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all"
                />
              </label>
            </div>
            
            <label className="block text-sm font-semibold text-slate">Phone Number
              <input 
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all" 
                placeholder="Add phone number"
              />
            </label>
            
            <div className="rounded-2xl border border-hairline bg-paper/50 p-5 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate">Account Access</p>
                  <p className="mt-1 font-bold text-ink">{session?.role}</p>
                </div>
                <span className="rounded-full bg-moss-tint border border-moss/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-moss">
                  Active
                </span>
              </div>
              <p className="text-xs font-medium text-slate mt-3 pt-3 border-t border-hairline/60">Role and base privileges are managed by CampusOS administration.</p>
            </div>

            {msg && <p className="text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg border border-moss/20">{msg}</p>}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-hairline">
              <Button onClick={save} className="bg-brass text-white hover:bg-brass-light px-8 shadow-sm">Save Changes</Button>
              <a href="/settings/password" className="inline-flex items-center justify-center rounded-lg border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-slate-50 shadow-sm">
                Change Password
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
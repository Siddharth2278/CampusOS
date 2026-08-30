"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

export default function Profile() {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getProfile()
      .then((p) => {
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setPhone(p.phone ?? "");
        setPhotoUrl(p.photoUrl);
      })
      .catch(() => setErr("Failed to load profile."));
  }, []);

  async function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setUploading(true);
    try {
      const p = await api.uploadProfilePhoto(file);
      setPhotoUrl(p.photoUrl);
    } catch (er) {
      setErr(er instanceof ApiError ? er.message : "Photo upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const initials = `${(firstName || "U").slice(0, 1).toUpperCase()}${(lastName || "").slice(0, 1).toUpperCase()}`;

  function roleLabel(role?: string) {
    switch (role) {
      case "STUDENT": return "Student";
      case "TEACHER": return "Teacher";
      case "HOD": return "Head of Department";
      case "PRINCIPAL": return "Principal";
      default: return role;
    }
  }

  return (
    <div className="campus-page max-w-4xl mx-auto py-6">
      <div className="campus-card campus-reveal">
        <div className="border-b border-hairline p-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-ink">My Profile</h1>
          <p className="mt-1 text-sm text-ink-soft">Your personal information and account details.</p>
        </div>

        <div className="grid gap-8 p-6 lg:p-8 md:grid-cols-[180px_1fr]">
          <div className="text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brass-tint text-4xl font-semibold text-brass shadow-md">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoChange}
            />
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-brass hover:text-brass-light transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate">First Name
                <div className="mt-2 w-full rounded-xl border border-hairline bg-slate-tint/50 px-4 py-3 text-ink font-medium">{firstName || "—"}</div>
              </label>
              <label className="text-sm font-semibold text-slate">Last Name
                <div className="mt-2 w-full rounded-xl border border-hairline bg-slate-tint/50 px-4 py-3 text-ink font-medium">{lastName || "—"}</div>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate">Email Address
              <div className="mt-2 w-full rounded-xl border border-hairline bg-slate-tint/50 px-4 py-3 text-ink font-medium">{email || "—"}</div>
            </label>

            <label className="block text-sm font-semibold text-slate">Phone Number
              <div className="mt-2 w-full rounded-xl border border-hairline bg-slate-tint/50 px-4 py-3 text-ink font-medium">{phone || "Not provided"}</div>
            </label>

            <div className="rounded-2xl border border-hairline bg-paper/50 p-5 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate">Account Access</p>
                  <p className="mt-1 font-bold text-ink">{roleLabel(session?.role)}</p>
                </div>
                <span className="rounded-full bg-moss-tint border border-moss/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-moss">
                  Active
                </span>
              </div>
              <p className="text-xs font-medium text-slate mt-3 pt-3 border-t border-hairline/60">Role and privileges are managed by CampusOS administration. Contact your department HOD or Principal for changes.</p>
            </div>

            {err && <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg border border-brick/20">{err}</p>}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-hairline">
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

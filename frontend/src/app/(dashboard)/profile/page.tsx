"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { clearSession } from "@/lib/auth";

export default function Profile() {
  const { session, updateSession } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function save() {
    setMsg(""); setErr(""); setSaving(true);
    try {
      const updated = await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      updateSession({ displayName: `${updated.firstName} ${updated.lastName}`, email: updated.email });
      setMsg("Profile updated successfully.");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Unable to update profile.");
    } finally { setSaving(false); }
  }

  async function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(""); setErr(""); setUploading(true);
    try {
      const p = await api.uploadProfilePhoto(file);
      setPhotoUrl(p.photoUrl);
      updateSession({ photoUrl: p.photoUrl });
      setMsg("Profile photo updated.");
    } catch (er) {
      setErr(er instanceof ApiError ? er.message : "Photo upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto() {
    setMsg(""); setErr(""); setUploading(true);
    try {
      const p = await api.removeProfilePhoto();
      setPhotoUrl(null);
      updateSession({ photoUrl: null });
      setMsg("Profile photo removed.");
    } catch (er) {
      setErr(er instanceof ApiError ? er.message : "Failed to remove photo.");
    } finally { setUploading(false); }
  }

  async function deletePrincipal() {
    if (session?.role !== "PRINCIPAL") return;
    const ok = confirm("Delete your Principal account? This will RESET the entire college data — all departments, teachers, students, and settings will be permanently deleted. This cannot be undone. Continue?");
    if (!ok) return;
    const confirm2 = prompt("Type DELETE to confirm:");
    if (confirm2 !== "DELETE") { setErr("Deletion cancelled. Type DELETE exactly to confirm."); return; }
    setDeleting(true); setErr(""); setMsg("");
    try {
      await api.deleteOwnAccount();
      clearSession();
      alert("Principal account and college data deleted. You will be redirected to Register.");
      router.push("/register");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Unable to delete account.");
    } finally { setDeleting(false); }
  }

  const initials = `${(firstName || "U").slice(0, 1).toUpperCase()}${(lastName || "").slice(0, 1).toUpperCase()}`;

  return (
    <div className="campus-page max-w-4xl mx-auto py-6">
      <div className="campus-card campus-reveal">
        <div className="border-b border-hairline p-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-ink">My Profile</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage your personal information and account security.</p>
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
              {photoUrl ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={removePhoto}
                  className="text-xs font-medium text-slate hover:text-brick transition-colors"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate">First Name
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all"
                />
              </label>
              <label className="text-sm font-semibold text-slate">Last Name
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate">Email Address
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-2 w-full rounded-xl border border-hairline bg-paper/80 px-4 py-3 text-ink font-medium outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all"
              />
            </label>

            <label className="block text-sm font-semibold text-slate">Phone Number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            {err && <p className="text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg border border-brick/20">{err}</p>}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-hairline">
              <Button onClick={save} disabled={saving} className="bg-brass text-white hover:bg-brass-light px-8 shadow-sm disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <a href="/settings/password" className="inline-flex items-center justify-center rounded-lg border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-slate-50 shadow-sm">
                Change Password
              </a>
            </div>

            {session?.role === "PRINCIPAL" ? (
              <div className="mt-8 rounded-xl border border-brick/20 bg-brick-tint p-5">
                <h3 className="text-sm font-bold text-brick">Danger Zone — Principal</h3>
                <p className="mt-1 text-xs font-medium text-brick/80">Delete your Principal account and reset single-college system. All college data will be erased and the Principal registration option will reappear for a new college setup.</p>
                <Button onClick={deletePrincipal} disabled={deleting} className="mt-4 bg-brick text-white hover:bg-brick/90 text-sm px-6 disabled:opacity-50">
                  {deleting ? "Deleting..." : "Delete My Principal Account & Reset College"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

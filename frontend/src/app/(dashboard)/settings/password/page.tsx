"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="campus-page max-w-2xl mx-auto py-10">
      <header className="mb-8 border-b border-hairline pb-6">
        <h1 className="campus-gradient-text pb-1 text-3xl">Change Password</h1>
        <p className="mt-2 text-ink-soft text-base">Update your CampusOS account security credentials.</p>
      </header>

      <div className="campus-card p-6 lg:p-10 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6">Password Security</h2>
        
        <form onSubmit={submit} className="space-y-5">
          <Input 
            label="Current Password" 
            type="password" 
            required 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)} 
          />
          <div className="pt-4 border-t border-hairline/60 space-y-5">
            <Input 
              label="New Password" 
              type="password" 
              minLength={6} 
              required 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              minLength={6} 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
          </div>

          <div className="bg-slate-tint border border-hairline rounded-lg p-4 text-xs font-medium text-ink-soft mt-2">
            Use at least 6 characters and avoid reusing an old password.
          </div>

          {error ? <p className="rounded-lg bg-brick-tint border border-brick/20 px-4 py-3 text-sm font-medium text-brick">{error}</p> : null}
          {message ? <p className="rounded-lg bg-moss-tint border border-moss/20 px-4 py-3 text-sm font-medium text-moss">{message}</p> : null}
          
          <div className="pt-4">
            <Button type="submit" disabled={saving} className="bg-brass text-white hover:bg-brass-light w-full sm:w-auto px-8">
              {saving ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
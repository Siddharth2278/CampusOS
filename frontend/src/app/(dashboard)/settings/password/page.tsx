"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
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
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Change password</h1>
        <p className="mt-1 text-sm text-slate">Update your CampusOS account password.</p>
      </div>
      <Card title="Password security">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Current password" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <Input label="New password" type="password" minLength={6} required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" minLength={6} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          {error ? <p className="rounded-lg bg-brick-tint px-3 py-2 text-sm text-brick">{error}</p> : null}
          {message ? <p className="rounded-lg bg-moss-tint px-3 py-2 text-sm text-moss">{message}</p> : null}
          <Button type="submit" disabled={saving}>{saving ? "Updating..." : "Change password"}</Button>
        </form>
      </Card>
    </div>
  );
}

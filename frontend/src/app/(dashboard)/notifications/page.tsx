"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/lib/types";

function formatDateTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    if (!session?.userId) {
      setLoading(false);
      return;
    }
    api
      .getNotifications(session?.userId)
      .then(setNotifications)
      .catch(() => setError("Unable to load notifications."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [session?.userId]);

  async function markRead(id: number) {
    await api.markNotificationRead(id);
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  async function markAllRead() {
    if (!session?.userId) return;
    await api.markAllNotificationsRead(session?.userId);
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
  }

  async function remove(id: number) {
    await api.deleteNotification(id);
    setNotifications((current) => current.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="campus-page space-y-8 max-w-4xl mx-auto py-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="campus-gradient-text pb-1">Notifications</h1>
          <p className="mt-2 text-ink-soft text-base">
            {unreadCount > 0 ? `You have ${unreadCount} unread alerts.` : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button className="bg-slate-tint text-ink hover:bg-hairline px-5 shadow-sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        ) : null}
      </header>

      <div className="campus-card p-6 lg:p-8 campus-reveal">
        {loading ? (
          <div className="animate-breathe text-brass font-medium py-4 text-center">Loading notifications...</div>
        ) : error ? (
          <div className="p-4 bg-brick-tint text-brick rounded-xl text-sm font-medium">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-tint/50 rounded-xl border border-dashed border-slate/30">
            <p className="text-sm font-medium text-slate">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...notifications]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border p-5 transition-colors ${
                    notification.isRead
                      ? "border-hairline bg-surface hover:border-slate-300"
                      : "border-brass/30 bg-brass-tint/40 shadow-sm"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-ink text-base">{notification.title}</p>
                      {!notification.isRead ? (
                        <span className="rounded-full bg-brass-tint border border-brass/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{notification.message}</p>
                    <p className="mt-3 text-xs font-medium text-slate tracking-wide uppercase">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 mt-2 sm:mt-0">
                    {!notification.isRead ? (
                      <Button className="bg-white border border-hairline text-ink hover:border-brass/40 hover:bg-brass-tint text-xs px-4" onClick={() => markRead(notification.id)}>
                        Mark Read
                      </Button>
                    ) : null}
                    <Button className="bg-transparent text-slate hover:bg-brick-tint hover:text-brick text-xs px-4" onClick={() => remove(notification.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
            <p className="mt-1 text-sm text-slate">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
            </p>
          </div>
          {unreadCount > 0 ? (
            <Button variant="secondary" onClick={markAllRead}>
              Mark all as read
            </Button>
          ) : null}
        </div>

        <Card>
          {loading ? (
            <p className="text-sm text-slate">Loading notifications...</p>
          ) : error ? (
            <p className="text-sm text-brick">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-slate">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {[...notifications]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={[
                      "flex items-start justify-between gap-4 rounded-xl border p-4",
                      notification.isRead
                        ? "border-slate-tint bg-white"
                        : "border-brass-tint bg-brass-tint/60",
                    ].join(" ")}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{notification.title}</p>
                        {!notification.isRead ? <Badge tone="indigo">New</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {!notification.isRead ? (
                        <Button variant="secondary" onClick={() => markRead(notification.id)}>
                          Mark read
                        </Button>
                      ) : null}
                      <Button variant="ghost" onClick={() => remove(notification.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, dashboardPath, getSession, login as loginUser, saveSession } from "@/lib/auth";
import type { AuthSession } from "@/lib/types";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSession: (patch: Partial<AuthSession>) => void;
  refreshSession: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSession(getSession()); setLoading(false); }, []);

  const refreshSession = useCallback(async () => {
    try {
      const current = getSession();
      if (!current?.token) return;
      const { api } = await import("@/lib/api");
      const me = await api.me();
      const updated: AuthSession = {
        ...current,
        role: me.role,
        email: me.email,
        userId: me.userId,
        profileId: me.profileId,
        departmentId: me.departmentId,
        semester: me.semester,
        displayName: `${me.firstName} ${me.lastName}`,
        photoUrl: me.photoUrl,
      };
      setSession(updated);
      saveSession(updated);
    } catch {
      // Silent fail — session remains as-is
    }
  }, []);

  useEffect(() => {
    const current = getSession();
    if (current?.token) {
      intervalRef.current = setInterval(refreshSession, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    clearSession();
    if (intervalRef.current) clearInterval(intervalRef.current);

    const nextSession = await loginUser(email, password);
    setSession(nextSession);

    intervalRef.current = setInterval(refreshSession, 15000);

    try {
      const { api } = await import("@/lib/api");
      const saved = await api.getLastRoute(nextSession.token);
      const route = saved.route;

      if (
        route &&
        route.startsWith("/") &&
        !route.startsWith("//") &&
        !route.startsWith("/login") &&
        !route.startsWith("/register") &&
        !route.startsWith("/forgot-password")
      ) {
        router.push(route);
        return;
      }
    } catch {
      // Fall back to this account's role dashboard.
    }

    router.push(dashboardPath(nextSession.role));
  }, [router, refreshSession]);

  const logout = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    clearSession();
    setSession(null);
    router.push("/login");
  }, [router]);

  const updateSession = useCallback((patch: Partial<AuthSession>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveSession(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ session, loading, login, logout, updateSession, refreshSession }), [session, loading, login, logout, updateSession, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

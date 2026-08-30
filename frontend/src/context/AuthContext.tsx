"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, dashboardPath, getSession, login as loginUser, saveSession } from "@/lib/auth";
import type { AuthSession } from "@/lib/types";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSession: (patch: Partial<AuthSession>) => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setSession(getSession()); setLoading(false); }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Never allow the previous browser account to influence the new login.
    clearSession();

    const nextSession = await loginUser(email, password);
    setSession(nextSession);

    try {
      // IMPORTANT: query the resume route with the NEW account's JWT.
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
  }, [router]);

  const logout = useCallback(() => { clearSession(); setSession(null); router.push("/login"); }, [router]);

  const updateSession = useCallback((patch: Partial<AuthSession>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveSession(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ session, loading, login, logout, updateSession }), [session, loading, login, logout, updateSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

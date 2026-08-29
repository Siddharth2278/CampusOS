import { api } from "./api";
import type { AuthSession, Role } from "./types";

const SESSION_KEY = "campusos_session";

function storage() {
  return typeof window !== "undefined" ? window.sessionStorage : null;
}

export function getSession(): AuthSession | null {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  storage()?.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  storage()?.removeItem(SESSION_KEY);
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await api.login({ email, password });

  // Keep the JWT in this browser TAB only.
  storage()?.setItem(
    SESSION_KEY,
    JSON.stringify({ token: response.token, role: response.role, email }),
  );

  const me = await api.me();

  const session: AuthSession = {
    token: response.token,
    role: me.role,
    email: me.email,
    userId: me.userId,
    profileId: me.profileId,
    departmentId: me.departmentId,
    semester: me.semester,
    displayName: `${me.firstName} ${me.lastName}`,
    photoUrl: me.photoUrl,
  };

  saveSession(session);
  return session;
}

export function dashboardPath(role: Role): string {
  switch (role) {
    case "STUDENT": return "/dashboard/student";
    case "TEACHER": return "/dashboard/teacher";
    case "HOD": return "/dashboard/hod";
    case "PRINCIPAL": return "/dashboard/principal";
    default: return "/dashboard";
  }
}

/**
 * This cache is intentionally per-account.
 * It is only a convenience fallback; the server is still the source of truth
 * for cross-device resume.
 */
export function getAccountLastRoute(email: string): string | null {
  if (typeof window === "undefined" || !email) return null;
  try {
    return localStorage.getItem(`campusos_last_route:${email.toLowerCase()}`);
  } catch {
    return null;
  }
}

export function saveAccountLastRoute(email: string, route: string) {
  if (typeof window === "undefined" || !email || !route.startsWith("/")) return;
  try {
    localStorage.setItem(`campusos_last_route:${email.toLowerCase()}`, route);
  } catch {
    // Ignore storage errors.
  }
}

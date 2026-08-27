"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveAccountLastRoute } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Seal } from "@/components/ui/Seal";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", match: "/dashboard" },
  { href: "/attendance", label: "Attendance", match: "/attendance" },
  { href: "/assignments", label: "Assignments", match: "/assignments" },
  { href: "/exams", label: "Exams", match: "/exams" },
  { href: "/timetable", label: "Timetable", match: "/timetable" },
  { href: "/leaves", label: "Leaves", match: "/leaves" },
  { href: "/calendar", label: "Calendar", match: "/calendar" },
  { href: "/notices", label: "Notices", match: "/notices" },
];
const directoryItem = { href: "/directory", label: "Directory", match: "/directory" };

function roleLabel(role: string) {
  switch (role) {
    case "STUDENT": return "Student";
    case "TEACHER": return "Teacher";
    case "HOD": return "Head of Department";
    case "PRINCIPAL": return "Principal";
    default: return role;
  }
}

const roleAccent: Record<Role, string> = {
  PRINCIPAL: "bg-maroon",
  HOD: "bg-brass",
  TEACHER: "bg-moss",
  STUDENT: "bg-slate",
};

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.6 1 5.2 1.5 6H4.5C5 14.2 6 12.6 6 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    Overview: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    Attendance: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
    Assignments: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h4",
    Exams: "M5 4h14v16H5zM8 8h8M8 12h5",
    Timetable: "M5 5h14v14H5zM8 3v4M16 3v4M5 10h14",
    Leaves: "M7 4h10v16H7zM10 8h4M10 12h4M10 16h4",
    Calendar: "M5 5h14v14H5zM8 3v4M16 3v4M5 10h14",
    Notices: "M5 9a7 7 0 0 1 14 0v5l2 2H3l2-2zM10 20h4",
    Notifications: "M6 9a6 6 0 1 1 12 0c0 4 2 5 2 6H4c0-1 2-2 2-6zM10 19h4",
    Directory: "M5 5h14v14H5zM9 9h2M13 9h2M9 13h6",
    Approvals: "M5 5h14v14H5zM8 12l3 3 5-6",
    "My Profile": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0",
    "Change password": "M8 10V7a4 4 0 0 1 8 0v3M6 10h12v10H6z",
    "Student approvals": "M5 5h14v14H5zM8 12l3 3 5-6",
  };
  const d = paths[type] || paths.Overview;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pageTitle(pathname: string) {
  if (pathname.includes("/dashboard/")) {
    if (pathname.includes("/principal")) return "Principal Dashboard";
    if (pathname.includes("/teacher")) return "Teacher Dashboard";
    if (pathname.includes("/hod")) return "HOD Dashboard";
    if (pathname.includes("/student")) return "Student Dashboard";
  }
  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/attendance": "Attendance",
    "/assignments": "Assignments",
    "/exams": "Examinations",
    "/timetable": "Timetable",
    "/leaves": "Leave Management",
    "/calendar": "Academic Calendar",
    "/notices": "Notices",
    "/notifications": "Notifications",
    "/directory": "Directory",
    "/approvals": "Approvals",
    "/profile": "My Profile",
    "/settings/password": "Account Security",
  };
  return map[pathname] || "CampusOS";
}

function NavLinks({
  navItems,
  pathname,
  unread,
  onNavigate,
  variant = "sidebar",
}: {
  navItems: { href: string; label: string }[];
  pathname: string;
  unread: number;
  onNavigate?: () => void;
  variant?: "sidebar" | "drawer";
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "campus-nav-item flex items-center justify-between rounded-xl px-3 text-sm font-medium transition-all duration-200",
              variant === "drawer" ? "py-2.5" : "py-2",
              active
                ? "bg-brass-tint text-brass shadow-sm"
                : "text-ink-soft hover:bg-paper hover:text-ink",
            ].join(" ")}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className={active ? "text-brass" : "text-slate"}><DashboardIcon type={item.label} /></span>
              <span className="truncate">{item.label}</span>
            </span>
            {item.href === "/notifications" && unread > 0 ? (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1.5 text-xs font-semibold text-white">
                {unread}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const lastSavedRoute = useRef("");

  const navItems =
    session?.role === "PRINCIPAL"
      ? [
          baseNavItems[0],
          directoryItem,
          { href: "/approvals", label: "Approvals", match: "/approvals" },
          baseNavItems[5],
          baseNavItems[6],
          baseNavItems[7],
        ]
      : session?.role === "HOD"
        ? [
            baseNavItems[0],
            baseNavItems[1],
            baseNavItems[2],
            baseNavItems[3],
            baseNavItems[4],
            baseNavItems[5],
            baseNavItems[6],
            baseNavItems[7],
            directoryItem,
            { href: "/approvals", label: "Approvals", match: "/approvals" },
          ]
        : session?.role === "TEACHER"
          ? [
              baseNavItems[0],
              baseNavItems[1],
              baseNavItems[2],
              baseNavItems[3],
              baseNavItems[4],
              baseNavItems[5],
              baseNavItems[6],
              baseNavItems[7],
              { href: "/approvals", label: "Student approvals", match: "/approvals" },
            ]
          : [
              ...baseNavItems,
            ];

  useEffect(() => {
    if (!session?.userId) return;
    api.getUnreadCount(session.userId).then(setUnread).catch(() => setUnread(0));
    if (
      pathname &&
      pathname.startsWith("/") &&
      !pathname.startsWith("//") &&
      pathname !== lastSavedRoute.current
    ) {
      lastSavedRoute.current = pathname;
      saveAccountLastRoute(session.email, pathname);
      api.saveLastRoute(pathname, session.token).catch(() => undefined);
    }
  }, [session?.userId, pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const accountCard = (
    <div className="campus-card rounded-xl border border-hairline bg-paper/80 p-4">
      <div className="flex items-center gap-2">
        {session ? (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${roleAccent[session.role]}`}
            aria-hidden="true"
          />
        ) : null}
        <p className="truncate text-sm font-semibold text-ink">
          {session?.displayName ?? session?.email}
        </p>
      </div>
      <p className="mt-1 text-xs text-slate">{session ? roleLabel(session.role) : ""}</p>
      <Button variant="ghost" className="mt-3 w-full justify-start px-0 text-maroon hover:text-maroon" onClick={logout}>
        Sign out
      </Button>
    </div>
  );

  // Dedicated mobile drawer profile footer — Avatar, Full Name, Role, View Profile + Log Out
  const mobileProfileFooter = (
    <div className="rounded-2xl border border-hairline bg-paper/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brass to-brass-light text-sm font-bold text-white shadow-sm">
          {(session?.displayName ?? session?.email ?? "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{session?.displayName ?? session?.email}</p>
          <p className="truncate text-xs font-medium text-slate">{session ? roleLabel(session.role) : ""}</p>
          <p className="truncate text-[11px] text-ink-soft">{session?.email}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/profile"
          onClick={() => setDrawerOpen(false)}
          className="inline-flex items-center justify-center rounded-xl border border-hairline bg-white px-3 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition"
        >
          View Profile
        </Link>
        <Button variant="ghost" className="w-full justify-center rounded-xl bg-maroon text-white hover:bg-maroon/90 text-xs font-semibold py-2.5" onClick={logout}>
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="campus-sidebar hidden w-[232px] shrink-0 border-r border-hairline px-4 py-8 lg:flex lg:flex-col">
          <Link href="/dashboard" className="mb-12 flex items-center gap-3 rounded-[4px] px-2 py-2 hover:bg-white/[.03]">
            <Seal size={32} />
            <span className="font-display text-lg font-bold tracking-tight text-ink">Campus<span className="text-brass">OS</span></span>
          </Link>
          <NavLinks navItems={navItems} pathname={pathname} unread={unread} />
          <div className="mt-auto pt-10">{accountCard}</div>
        </aside>

        {/* Mobile slide-out drawer */}
        <div
          className={[
            "fixed inset-0 z-40 bg-ink/40 transition-opacity lg:hidden",
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          onClick={() => setDrawerOpen(false)}
          aria-hidden={!drawerOpen}
        />
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-hairline bg-surface px-5 py-6 shadow-xl transition-transform duration-200 lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          aria-label="Navigation menu"
        >
          <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Seal size={30} />
              <span className="font-display text-lg font-bold tracking-tight text-ink">Campus<span className="text-brass">OS</span></span>
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-md p-1.5 text-ink-soft hover:bg-paper"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks
              navItems={navItems}
              pathname={pathname}
              unread={unread}
              onNavigate={() => setDrawerOpen(false)}
              variant="drawer"
            />
          </div>
          <div className="pt-6">{mobileProfileFooter}</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop top bar */}
          <header className="campus-topbar sticky top-0 z-20 hidden h-[76px] items-center justify-between border-b border-hairline px-8 lg:flex">
            <div className="relative">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-soft">CampusOS</p>
              <h1 className="font-display font-bold tracking-tight text-ink">{pageTitle(pathname)}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative rounded-xl border border-hairline bg-surface p-2.5 text-ink-soft transition hover:border-brass/30 hover:bg-brass-tint hover:text-brass" aria-label="Notifications" title="Notifications">
                <BellIcon />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="group flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-2.5 py-2 shadow-sm transition hover:border-brass/30 hover:bg-brass-tint"
                  aria-expanded={accountOpen}
                  aria-label="Open profile menu"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brass to-brass-light text-xs font-bold text-white shadow-sm">
                    {(session?.displayName ?? session?.email ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="max-w-44 text-left">
                    <p className="truncate text-sm font-semibold text-ink">{session?.displayName ?? session?.email}</p>
                    <p className="truncate text-[11px] text-slate">{session ? roleLabel(session.role) : ""}</p>
                  </div>
                  <svg className={`h-4 w-4 text-slate transition-transform ${accountOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                  </svg>
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-hairline bg-surface p-2 shadow-lg">
                    <div className="border-b border-hairline px-3 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{session?.displayName ?? session?.email}</p>
                      <p className="mt-0.5 truncate text-xs text-slate">{session?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setAccountOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-tint hover:text-ink">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-tint">◎</span>
                      My Profile
                    </Link>
                    <Link href="/settings/password" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-tint hover:text-ink">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-tint">⌁</span>
                      Change password
                    </Link>
                    <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-maroon hover:bg-maroon-tint">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon-tint">↗</span>
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {/* Mobile top bar */}
          <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-2 text-ink-soft hover:bg-paper"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Seal size={24} />
              <span className="font-display font-semibold text-ink">CampusOS</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative rounded-md p-2 text-ink-soft hover:bg-paper"
                aria-label="Notifications"
              >
                <BellIcon />
                {unread > 0 ? (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-maroon text-[10px] font-semibold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brass to-brass-light text-xs font-bold text-white shadow-sm"
                  aria-expanded={accountOpen}
                  aria-label="Open profile menu"
                >
                  {(session?.displayName ?? session?.email ?? "U").slice(0, 1).toUpperCase()}
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-hairline bg-surface p-2 shadow-lg">
                    <div className="border-b border-hairline px-3 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{session?.displayName ?? session?.email}</p>
                      <p className="mt-0.5 truncate text-xs text-slate">{session?.email}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{session ? roleLabel(session.role) : ""}</p>
                    </div>
                    <Link href="/profile" onClick={() => setAccountOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-tint hover:text-ink">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-tint">◎</span>
                      My Profile
                    </Link>
                    <Link href="/settings/password" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-tint hover:text-ink">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-tint">⌁</span>
                      Change password
                    </Link>
                    <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-maroon hover:bg-maroon-tint">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon-tint">↗</span>
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          
          <main className="campus-page flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="pointer-events-none fixed right-[5%] top-[18%] z-0 h-28 w-28 rounded-full bg-brass/8 blur-3xl animate-[campus-float_7s_ease-in-out_infinite]" />
            <div className="relative z-10">{children}</div>

            <footer className="relative z-10 mt-12 border-t border-hairline px-1 pb-8 pt-6 sm:mt-16">
              <div className="flex flex-col gap-3 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
                <span>&copy; {new Date().getFullYear()} CampusOS</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                  System operational
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
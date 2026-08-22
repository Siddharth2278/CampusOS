"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/auth";

export default function HomePage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? dashboardPath(session.role) : "/login");
  }, [loading, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-slate">Redirecting...</p>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/auth";

export default function DashboardIndexPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.replace(dashboardPath(session.role));
    }
  }, [loading, session, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-breathe text-brass font-medium text-lg">
        Loading your workspace...
      </div>
    </div>
  );
}
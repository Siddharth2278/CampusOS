"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function DataRefreshListener() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleRefresh = () => {
      router.refresh();
      refreshSession();
    };

    window.addEventListener("campusos:data-changed", handleRefresh);
    return () => {
      window.removeEventListener("campusos:data-changed", handleRefresh);
    };
  }, [router, refreshSession]);

  return null;
}
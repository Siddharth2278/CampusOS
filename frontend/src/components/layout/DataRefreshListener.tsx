"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DataRefreshListener() {
  const router = useRouter();

  useEffect(() => {
    const handleRefresh = () => {
      // Removed the 120ms delay - this now refreshes the data instantly
      router.refresh();
    };

    window.addEventListener("campusos:data-changed", handleRefresh);
    return () => {
      window.removeEventListener("campusos:data-changed", handleRefresh);
    };
  }, [router]);

  return null;
}
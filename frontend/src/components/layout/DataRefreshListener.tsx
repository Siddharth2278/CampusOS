"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DataRefreshListener() {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;
    const handleRefresh = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        router.refresh();
        timer = undefined;
      }, 120);
    };

    window.addEventListener("campusos:data-changed", handleRefresh);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("campusos:data-changed", handleRefresh);
    };
  }, [router]);

  return null;
}

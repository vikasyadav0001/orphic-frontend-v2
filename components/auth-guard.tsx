"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getToken } from "@/lib/api";

const PUBLIC_PATHS = ["/", "/privacy", "/terms"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    if (PUBLIC_PATHS.includes(path) || path.startsWith("/api/auth")) {
      return true;
    }
    return Boolean(getToken());
  });

  useEffect(() => {
    // Public pages requiring no auth check
    if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth")) {
      setChecked(true);
      return;
    }

    const token = getToken();
    if (!token) {
      // Redirect to Scalekit OAuth Login
      window.location.href = "/api/auth/login";
      return;
    }

    setChecked(true);
  }, [pathname]);

  if (!checked && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#0D0A06] text-white">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="text-sm font-medium text-amber-200/80">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

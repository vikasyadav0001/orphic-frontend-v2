"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getToken } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Landing page is public
    if (pathname === "/") {
      setChecked(true);
      return;
    }

    // Public auth endpoints
    if (pathname.startsWith("/api/auth")) {
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

  if (!checked && pathname !== "/") {
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

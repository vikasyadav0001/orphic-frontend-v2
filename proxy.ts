import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public landing page, auth endpoints, and static assets
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Read authentication tokens from cookies
  const scalekitToken = request.cookies.get("scalekit_token")?.value;
  const orphicAuth = request.cookies.get("orphic_auth")?.value;

  const isAuthenticated = Boolean(scalekitToken || orphicAuth);

  // 3. If unauthenticated, redirect user immediately to Scalekit OAuth Login
  if (!isAuthenticated) {
    const loginUrl = new URL("/api/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Apply proxy to all routes except public static files and api/auth
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

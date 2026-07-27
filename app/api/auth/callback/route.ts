import { NextResponse, NextRequest } from "next/server";
import { scalekit } from "@/auth/scalekit-client";

export const dynamic = 'force-dynamic';

function getPublicOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return new NextResponse(`Auth failed: ${error}`, { status: 400 });
  }

  const origin = getPublicOrigin(req);
  const redirectUri = `${origin}/api/auth/callback`;

  try {
    // Exchange the code for the JWT tokens
    const authResp = await scalekit.authenticateWithCode(code, redirectUri);
    
    // Redirect the user to your actual chat interface
    const response = NextResponse.redirect(new URL("/chat", origin));
    
    // Save the token in a cookie so your Orphic Adapter can read it
    response.cookies.set("scalekit_token", authResp.idToken, {
      httpOnly: false, // False so our frontend client can read it for the FastAPI header
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (err: any) {
    console.error("Authentication exchange failed", err);
    return new NextResponse(`Authentication failed: ${err.message || err.toString()}`, { status: 500 });
  }
}

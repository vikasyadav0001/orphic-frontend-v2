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
  const origin = getPublicOrigin(req);
  const redirectUri = `${origin}/api/auth/callback`;
  const promptParam = url.searchParams.get("prompt");

  try {
    let authorizationUrl = scalekit.getAuthorizationUrl(redirectUri);
    if (promptParam) {
      const parsedUrl = new URL(authorizationUrl);
      parsedUrl.searchParams.set("prompt", promptParam);
      authorizationUrl = parsedUrl.toString();
    }
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Error generating Scalekit Auth URL", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

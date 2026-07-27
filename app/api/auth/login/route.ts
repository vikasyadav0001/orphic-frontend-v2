import { NextResponse, NextRequest } from "next/server";
import { scalekit } from "@/auth/scalekit-client";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
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

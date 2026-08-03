import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const homeUrl = new URL("/", req.url);
  const response = NextResponse.redirect(homeUrl);

  // Deep cookie deletion across all path variants
  response.cookies.delete("scalekit_token");
  response.cookies.delete("orphic_auth");
  response.cookies.set("scalekit_token", "", { path: "/", expires: new Date(0), maxAge: 0 });
  response.cookies.set("orphic_auth", "", { path: "/", expires: new Date(0), maxAge: 0 });

  return response;
}

export async function POST(req: NextRequest) {
  return GET(req);
}

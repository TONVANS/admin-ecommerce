// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && !pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (token && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"], // apply to all pages except static/api
};

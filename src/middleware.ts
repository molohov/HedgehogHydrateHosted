import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  STALE_SESSION_PARAM,
  sessionCookieOptions,
  shouldRefreshSession,
  signSessionToken,
  verifySessionToken,
} from "@/lib/session";

function isProtected(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings") ||
    pathname === "/"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/login")) {
    // Without this the deactivated-user case ping-pongs: the page redirects
    // here because the account is gone, and we redirect back because the
    // token still verifies.
    if (searchParams.has(STALE_SESSION_PARAM)) {
      const response = NextResponse.next();
      response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
      return response;
    }
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (isProtected(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  if (session && shouldRefreshSession(session.issuedAt)) {
    response.cookies.set(
      SESSION_COOKIE,
      await signSessionToken(session.payload),
      sessionCookieOptions(),
    );
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/settings", "/settings/:path*", "/admin/:path*"],
};

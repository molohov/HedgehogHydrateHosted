import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "hedgehog_session";

// Signals that the cookie carries a well-formed token for an account that can
// no longer sign in, so the login page must clear it instead of honoring it.
export const STALE_SESSION_PARAM = "stale";

// Sessions slide: any authenticated request older than the refresh threshold
// re-issues the token, so the max age is an inactivity window rather than a
// hard cap on how long a signed-in user stays signed in.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24;

export type SessionPayload = {
  sub: string;
  username: string;
  role: Role;
};

export type VerifiedSession = {
  payload: SessionPayload;
  issuedAt: number;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

function isRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "USER";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

// Returns null rather than throwing when the secret is missing so an
// unconfigured deployment redirects to the login page instead of erroring.
export async function verifySessionToken(
  token: string,
): Promise<VerifiedSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") {
      return null;
    }
    if (!isRole(payload.role)) {
      return null;
    }
    return {
      payload: {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      },
      issuedAt: typeof payload.iat === "number" ? payload.iat : 0,
    };
  } catch {
    return null;
  }
}

export function shouldRefreshSession(
  issuedAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  return nowSeconds - issuedAt >= SESSION_REFRESH_THRESHOLD_SECONDS;
}

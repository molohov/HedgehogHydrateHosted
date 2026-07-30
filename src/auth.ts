import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "hedgehog_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  username: string;
  role: Role;
  timezone: string;
  dailyGoalOz: number;
  backgroundColor: string;
  hasAvatar: boolean;
  hasBackground: boolean;
};

type SessionPayload = {
  sub: string;
  username: string;
  role: Role;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export { hashPassword, verifyPassword };

export async function createSession(user: {
  id: string;
  username: string;
  role: Role;
}): Promise<void> {
  const token = await new SignJWT({
    username: user.username,
    role: user.role,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function readSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (!payload.sub || typeof payload.username !== "string") {
      return null;
    }
    if (payload.role !== Role.ADMIN && payload.role !== Role.USER) {
      return null;
    }
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await readSessionPayload();
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      username: true,
      role: true,
      timezone: true,
      dailyGoalOz: true,
      backgroundColor: true,
      isActive: true,
      avatarData: true,
      backgroundData: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    timezone: user.timezone,
    dailyGoalOz: user.dailyGoalOz,
    backgroundColor: user.backgroundColor,
    hasAvatar: user.avatarData !== null,
    hasBackground: user.backgroundData !== null,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== Role.ADMIN) {
    redirect("/");
  }
  return user;
}

export async function authenticateCredentials(
  username: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      timezone: true,
      dailyGoalOz: true,
      backgroundColor: true,
      passwordHash: true,
      isActive: true,
      avatarData: true,
      backgroundData: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    timezone: user.timezone,
    dailyGoalOz: user.dailyGoalOz,
    backgroundColor: user.backgroundColor,
    hasAvatar: user.avatarData !== null,
    hasBackground: user.backgroundData !== null,
  };
}

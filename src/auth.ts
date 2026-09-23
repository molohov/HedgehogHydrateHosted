import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  STALE_SESSION_PARAM,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

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

export { hashPassword, verifyPassword };

export async function createSession(user: {
  id: string;
  username: string;
  role: Role;
}): Promise<void> {
  const token = await signSessionToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: "/" });
}

async function readSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const verified = await verifySessionToken(token);
  return verified?.payload ?? null;
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
    redirect(`/login?${STALE_SESSION_PARAM}=1`);
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import {
  authenticateCredentials,
  createSession,
  destroySession,
  requireAdminUser,
} from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/db";
import { BUILTIN_PRESETS } from "@/lib/hydration";
import { createUserSchema, loginSchema, userIdSchema } from "@/lib/validation";

export type ActionResult = {
  ok: boolean;
  message?: string;
};

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid username and password." };
  }

  const user = await authenticateCredentials(
    parsed.data.username,
    parsed.data.password,
  );

  if (!user) {
    return { ok: false, message: "Invalid username or password." };
  }

  await createSession(user);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  await requireAdminUser();

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid user details.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, message: "That username is already taken." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      passwordHash,
      role: Role.USER,
      presets: {
        create: BUILTIN_PRESETS.map((preset) => ({
          label: preset.label,
          oz: preset.oz,
          builtin: true,
        })),
      },
    },
  });

  revalidatePath("/admin/users");
  return { ok: true, message: `Created user ${parsed.data.username}.` };
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await requireAdminUser();
  const parsedId = userIdSchema.safeParse(userId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid user." };
  }

  if (parsedId.data === admin.id) {
    return { ok: false, message: "You cannot deactivate your own admin account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsedId.data },
    select: { id: true, role: true, username: true },
  });

  if (!target) {
    return { ok: false, message: "User not found." };
  }

  if (target.role === Role.ADMIN && !isActive) {
    return { ok: false, message: "Admin accounts cannot be deactivated." };
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { isActive },
  });

  revalidatePath("/admin/users");
  return {
    ok: true,
    message: `${target.username} is now ${isActive ? "active" : "inactive"}.`,
  };
}

export async function createUserFormAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return createUserAction(formData);
}

export async function loginFormAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return loginAction(formData);
}

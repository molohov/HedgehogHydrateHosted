"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { processUploadedImage } from "@/lib/images";
import { backgroundColorSchema, timezoneSchema } from "@/lib/validation";
import type { ActionResult } from "@/app/actions/auth";

function toPrismaBytes(data: Buffer) {
  return Uint8Array.from(data);
}

export async function updateTimezoneAction(timezone: string): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsed = timezoneSchema.safeParse(timezone);
  if (!parsed.success) {
    return { ok: false, message: "Choose a valid timezone." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Timezone updated." };
}

export async function updateBackgroundColorAction(
  color: string,
): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsed = backgroundColorSchema.safeParse(color);
  if (!parsed.success) {
    return { ok: false, message: "Use a hex color like #F7F0E4." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { backgroundColor: parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Background color saved." };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const user = await requireSessionUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  try {
    const processed = await processUploadedImage(file, 256);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarData: toPrismaBytes(processed.data),
        avatarMime: processed.mime,
      },
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Upload failed.",
    };
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Hedgehog picture updated." };
}

export async function clearAvatarAction(): Promise<ActionResult> {
  const user = await requireSessionUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarData: null, avatarMime: null },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Avatar reset to default hedgehog." };
}

export async function uploadBackgroundAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireSessionUser();
  const file = formData.get("background");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  try {
    const processed = await processUploadedImage(file, 1920);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        backgroundData: toPrismaBytes(processed.data),
        backgroundMime: processed.mime,
      },
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Upload failed.",
    };
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Background image updated." };
}

export async function clearBackgroundAction(): Promise<ActionResult> {
  const user = await requireSessionUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { backgroundData: null, backgroundMime: null },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Background image removed." };
}

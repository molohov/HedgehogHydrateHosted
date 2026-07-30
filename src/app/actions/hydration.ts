"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import {
  encouragementForLog,
  formatEntryTime,
  getLocalDateKey,
  goalProgressPercent,
  rollingSevenDayTotals,
  todayTotal,
} from "@/lib/hydration";
import {
  entryIdSchema,
  goalSchema,
  ozSchema,
  presetIdSchema,
  presetSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/app/actions/auth";

export type HydrationDashboardData = {
  todayOz: number;
  goalOz: number;
  progressPercent: number;
  remainingOz: number;
  presets: Array<{ id: string; label: string; oz: number; builtin: boolean }>;
  todayEntries: Array<{ id: string; oz: number; timeLabel: string }>;
  sevenDayTotals: Array<{ day: string; totalOz: number; label: string }>;
  encouragement: { message: string; mood: string } | null;
};

export async function getHydrationDashboard(): Promise<HydrationDashboardData> {
  const user = await requireSessionUser();

  const [dbUser, entries] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        dailyGoalOz: true,
        timezone: true,
        presets: { orderBy: [{ builtin: "desc" }, { oz: "asc" }] },
      },
    }),
    prisma.waterEntry.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
      select: { id: true, oz: true, loggedAt: true },
    }),
  ]);

  const todayKey = getLocalDateKey(new Date(), dbUser.timezone);
  const todayOz = todayTotal(entries, dbUser.timezone);
  const goalOz = dbUser.dailyGoalOz;

  return {
    todayOz,
    goalOz,
    progressPercent: goalProgressPercent(todayOz, goalOz),
    remainingOz: Math.max(goalOz - todayOz, 0),
    presets: dbUser.presets,
    todayEntries: entries
      .filter((entry) => getLocalDateKey(entry.loggedAt, dbUser.timezone) === todayKey)
      .map((entry) => ({
        id: entry.id,
        oz: entry.oz,
        timeLabel: formatEntryTime(entry.loggedAt, dbUser.timezone),
      })),
    sevenDayTotals: rollingSevenDayTotals(entries, dbUser.timezone),
    encouragement: null,
  };
}

export async function logDrinkAction(ozInput: number): Promise<
  ActionResult & {
    encouragement?: { message: string; mood: string };
  }
> {
  const user = await requireSessionUser();
  const parsedOz = ozSchema.safeParse(ozInput);
  if (!parsedOz.success) {
    return { ok: false, message: "Enter a valid ounce amount." };
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { dailyGoalOz: true, timezone: true },
  });

  const entries = await prisma.waterEntry.findMany({
    where: { userId: user.id },
    select: { oz: true, loggedAt: true },
  });

  const beforeTodayOz = todayTotal(entries, dbUser.timezone);

  await prisma.waterEntry.create({
    data: {
      userId: user.id,
      oz: parsedOz.data,
    },
  });

  const afterTodayOz = beforeTodayOz + parsedOz.data;
  const encouragement = encouragementForLog(
    beforeTodayOz,
    afterTodayOz,
    dbUser.dailyGoalOz,
  );

  revalidatePath("/");
  return {
    ok: true,
    message: encouragement.message,
    encouragement,
  };
}

export async function updateEntryAction(
  entryId: string,
  ozInput: number,
): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsedId = entryIdSchema.safeParse(entryId);
  const parsedOz = ozSchema.safeParse(ozInput);

  if (!parsedId.success || !parsedOz.success) {
    return { ok: false, message: "Invalid entry update." };
  }

  const entry = await prisma.waterEntry.findFirst({
    where: { id: parsedId.data, userId: user.id },
    select: { id: true },
  });

  if (!entry) {
    return { ok: false, message: "Entry not found." };
  }

  await prisma.waterEntry.update({
    where: { id: entry.id },
    data: { oz: parsedOz.data },
  });

  revalidatePath("/");
  return { ok: true, message: `Updated to ${parsedOz.data} oz.` };
}

export async function deleteEntryAction(entryId: string): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsedId = entryIdSchema.safeParse(entryId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid entry." };
  }

  const entry = await prisma.waterEntry.findFirst({
    where: { id: parsedId.data, userId: user.id },
    select: { id: true },
  });

  if (!entry) {
    return { ok: false, message: "Entry not found." };
  }

  await prisma.waterEntry.delete({ where: { id: entry.id } });
  revalidatePath("/");
  return { ok: true, message: "Drink removed." };
}

export async function updateGoalAction(goalInput: number): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsed = goalSchema.safeParse(goalInput);
  if (!parsed.success) {
    return { ok: false, message: "Daily goal must be between 1 and 999 oz." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { dailyGoalOz: parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Daily goal saved." };
}

export async function addPresetAction(
  label: string,
  ozInput: number,
): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsed = presetSchema.safeParse({ label, oz: ozInput });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid preset.",
    };
  }

  await prisma.waterPreset.create({
    data: {
      userId: user.id,
      label: parsed.data.label,
      oz: parsed.data.oz,
      builtin: false,
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Preset added." };
}

export async function removePresetAction(presetId: string): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsedId = presetIdSchema.safeParse(presetId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid preset." };
  }

  const preset = await prisma.waterPreset.findFirst({
    where: { id: parsedId.data, userId: user.id },
    select: { id: true, builtin: true },
  });

  if (!preset) {
    return { ok: false, message: "Preset not found." };
  }

  if (preset.builtin) {
    return { ok: false, message: "Built-in presets cannot be removed." };
  }

  await prisma.waterPreset.delete({ where: { id: preset.id } });
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, message: "Preset removed." };
}

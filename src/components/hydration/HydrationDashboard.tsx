"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { logDrinkAction } from "@/app/actions/hydration";
import { EncouragementBubble } from "@/components/hydration/EncouragementBubble";
import { HedgehogMascot } from "@/components/hydration/HedgehogMascot";
import { PresetStickerButton } from "@/components/hydration/PresetStickerButton";
import { SevenDayChart } from "@/components/hydration/SevenDayChart";
import { TodayEntriesList } from "@/components/hydration/TodayEntriesList";
import { WaterProgressRing } from "@/components/hydration/WaterProgressRing";
import type { HydrationDashboardData } from "@/app/actions/hydration";

const PRESET_TINTS = [
  "bg-warm-peach",
  "bg-dusty-rose",
  "bg-leaf",
  "bg-water/70",
  "bg-parchment-deep",
];

type HydrationDashboardProps = HydrationDashboardData & {
  hasAvatar: boolean;
};

export function HydrationDashboard({
  todayOz,
  goalOz,
  progressPercent,
  remainingOz,
  presets,
  todayEntries,
  sevenDayTotals,
  hasAvatar,
}: HydrationDashboardProps) {
  const [encouragement, setEncouragement] = useState<{
    message: string;
    mood: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLog(oz: number) {
    startTransition(async () => {
      const result = await logDrinkAction(oz);
      if (result.encouragement) {
        setEncouragement(result.encouragement);
      }
      setFeedback(result.message ?? null);
    });
  }

  const mood =
    encouragement?.mood === "goalReached"
      ? "goalReached"
      : encouragement?.mood === "happySip"
        ? "happySip"
        : todayOz >= goalOz
          ? "goalReached"
          : "idle";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-soft-cream bg-soft-cream shadow-md">
          {hasAvatar ? (
            <Image
              src="/api/images/avatar"
              alt="Your hedgehog avatar"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <HedgehogMascot mood={mood} className="h-full w-full" />
          )}
        </div>
        <WaterProgressRing
          percent={progressPercent}
          todayOz={todayOz}
          goalOz={goalOz}
        />
      </section>

      {encouragement ? (
        <EncouragementBubble message={encouragement.message} />
      ) : null}

      <p className="text-center text-base font-medium text-moss">
        {remainingOz > 0
          ? `${remainingOz} oz to go today`
          : "Daily goal complete!"}
      </p>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-moss">Log a drink</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map((preset, index) => (
            <PresetStickerButton
              key={preset.id}
              label={preset.label}
              oz={preset.oz}
              tintClass={PRESET_TINTS[index % PRESET_TINTS.length]}
              disabled={isPending}
              onClick={() => handleLog(preset.oz)}
            />
          ))}
        </div>
        {feedback && !encouragement ? (
          <p className="mt-3 text-sm text-moss-dark">{feedback}</p>
        ) : null}
      </section>

      <TodayEntriesList entries={todayEntries} />
      <SevenDayChart totals={sevenDayTotals} goalOz={goalOz} />
    </div>
  );
}

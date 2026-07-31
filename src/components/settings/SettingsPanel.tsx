"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  addPresetAction,
  removePresetAction,
  updateGoalAction,
} from "@/app/actions/hydration";
import {
  clearAvatarAction,
  clearBackgroundAction,
  updateBackgroundColorAction,
  updateTimezoneAction,
  uploadAvatarAction,
  uploadBackgroundAction,
} from "@/app/actions/settings";
import { HedgehogMascot } from "@/components/hydration/HedgehogMascot";

type SettingsPanelProps = {
  dailyGoalOz: number;
  timezone: string;
  backgroundColor: string;
  hasAvatar: boolean;
  hasBackground: boolean;
  presets: Array<{ id: string; label: string; oz: number; builtin: boolean }>;
};

const TIMEZONE_OPTIONS = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
];

export function SettingsPanel({
  dailyGoalOz,
  timezone,
  backgroundColor,
  hasAvatar,
  hasBackground,
  presets,
}: SettingsPanelProps) {
  const [goal, setGoal] = useState(String(dailyGoalOz));
  const [color, setColor] = useState(backgroundColor);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [presetLabel, setPresetLabel] = useState("");
  const [presetOz, setPresetOz] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [, avatarAction, avatarPending] = useActionState(async (_prev: null, formData: FormData) => {
    const result = await uploadAvatarAction(formData);
    setMessage(result.message ?? null);
    return null;
  }, null);

  const [, backgroundAction, backgroundPending] = useActionState(
    async (_prev: null, formData: FormData) => {
      const result = await uploadBackgroundAction(formData);
      setMessage(result.message ?? null);
      return null;
    },
    null,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Hedgehog picture</h2>
        <p className="mt-1 text-sm text-woodland-muted">
          Upload a photo to replace the mascot on your dashboard.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-moss/20 bg-parchment">
            {hasAvatar ? (
              <Image
                src="/api/images/avatar"
                alt="Avatar preview"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <HedgehogMascot className="h-full w-full p-2" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <form action={avatarAction}>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="text-sm file:rounded-full file:border file:border-moss/20 file:px-4 file:py-2"
              />
              <button
                type="submit"
                disabled={avatarPending}
                className="mt-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
              >
                {avatarPending ? "Uploading..." : "Choose photo"}
              </button>
            </form>
            <button
              type="button"
              disabled={isPending || !hasAvatar}
              onClick={() =>
                startTransition(async () => {
                  const result = await clearAvatarAction();
                  setMessage(result.message ?? null);
                })
              }
              className="rounded-full border border-moss/20 px-4 py-2 text-sm font-semibold text-moss-dark"
            >
              Reset avatar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Background</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="backgroundColor" className="text-sm font-medium text-moss">
              Background color
            </label>
            <div className="mt-2 flex gap-3">
              <input
                id="backgroundColor"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-11 w-16 rounded-xl border border-moss/20"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await updateBackgroundColorAction(color);
                    setMessage(result.message ?? null);
                  })
                }
                className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
              >
                Save color
              </button>
            </div>
          </div>
          <form action={backgroundAction}>
            <label htmlFor="background" className="text-sm font-medium text-moss">
              Background image
            </label>
            <input
              id="background"
              type="file"
              name="background"
              accept="image/*"
              className="mt-2 block text-sm file:rounded-full file:border file:border-moss/20 file:px-4 file:py-2"
            />
            <button
              type="submit"
              disabled={backgroundPending}
              className="mt-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
            >
              {backgroundPending ? "Uploading..." : "Upload background"}
            </button>
          </form>
          <button
            type="button"
            disabled={isPending || !hasBackground}
            onClick={() =>
              startTransition(async () => {
                const result = await clearBackgroundAction();
                setMessage(result.message ?? null);
              })
            }
            className="rounded-full border border-moss/20 px-4 py-2 text-sm font-semibold text-moss-dark"
          >
            Remove background image
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Daily goal (oz)</h2>
        <div className="mt-3 flex gap-3">
          <input
            value={goal}
            onChange={(event) => setGoal(event.target.value.replace(/\D/g, ""))}
            className="w-32 rounded-2xl border border-moss/20 px-4 py-2"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await updateGoalAction(Number(goal));
                setMessage(result.message ?? null);
              })
            }
            className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
          >
            Save goal
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Timezone</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedTimezone}
            onChange={(event) => setSelectedTimezone(event.target.value)}
            className="rounded-2xl border border-moss/20 px-4 py-2"
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await updateTimezoneAction(selectedTimezone);
                setMessage(result.message ?? null);
              })
            }
            className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
          >
            Save timezone
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Custom presets</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <input
            value={presetLabel}
            onChange={(event) => setPresetLabel(event.target.value)}
            placeholder="Label"
            className="rounded-2xl border border-moss/20 px-4 py-2"
          />
          <input
            value={presetOz}
            onChange={(event) => setPresetOz(event.target.value.replace(/\D/g, ""))}
            placeholder="Ounces"
            className="rounded-2xl border border-moss/20 px-4 py-2"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await addPresetAction(presetLabel, Number(presetOz));
                setMessage(result.message ?? null);
                if (result.ok) {
                  setPresetLabel("");
                  setPresetOz("");
                }
              })
            }
            className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white"
          >
            Add preset
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {presets
            .filter((preset) => !preset.builtin)
            .map((preset) => (
              <li
                key={preset.id}
                className="flex items-center justify-between rounded-2xl bg-parchment px-3 py-2"
              >
                <span>
                  {preset.label} ({preset.oz} oz)
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await removePresetAction(preset.id);
                      setMessage(result.message ?? null);
                    })
                  }
                  className="rounded-full bg-dusty-rose/20 px-3 py-1 text-xs font-semibold"
                >
                  Remove
                </button>
              </li>
            ))}
        </ul>
      </section>

      {message ? (
        <p className="rounded-2xl bg-leaf/30 px-4 py-3 text-sm text-woodland">{message}</p>
      ) : null}
    </div>
  );
}

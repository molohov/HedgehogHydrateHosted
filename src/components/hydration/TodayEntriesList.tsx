"use client";

import { useState, useTransition } from "react";
import {
  deleteEntryAction,
  updateEntryAction,
} from "@/app/actions/hydration";

type TodayEntriesListProps = {
  entries: Array<{ id: string; oz: number; timeLabel: string }>;
};

export function TodayEntriesList({ entries }: TodayEntriesListProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(entryId: string, currentOz: number) {
    const next = window.prompt("Update ounces", String(currentOz));
    if (!next) {
      return;
    }
    const oz = Number(next);
    if (!Number.isFinite(oz)) {
      setMessage("Enter a valid number.");
      return;
    }

    startTransition(async () => {
      const result = await updateEntryAction(entryId, oz);
      setMessage(result.message ?? null);
    });
  }

  function handleDelete(entryId: string) {
    if (!window.confirm("Remove this drink entry?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEntryAction(entryId);
      setMessage(result.message ?? null);
    });
  }

  return (
    <div className="rounded-3xl bg-soft-cream/90 p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-moss">Today&apos;s drinks</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-woodland-muted">No drinks logged yet today.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-2xl bg-parchment px-3 py-2"
            >
              <div>
                <p className="font-medium text-woodland">{entry.oz} oz</p>
                <p className="text-xs text-woodland-muted">{entry.timeLabel}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleUpdate(entry.id, entry.oz)}
                  className="rounded-full bg-leaf px-3 py-1 text-xs font-semibold text-woodland"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-full bg-dusty-rose/30 px-3 py-1 text-xs font-semibold text-woodland"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {message ? <p className="mt-3 text-xs text-moss-dark">{message}</p> : null}
    </div>
  );
}

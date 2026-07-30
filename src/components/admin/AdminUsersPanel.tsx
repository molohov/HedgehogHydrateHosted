"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createUserFormAction,
  toggleUserActiveAction,
} from "@/app/actions/auth";
import type { ActionResult } from "@/app/actions/auth";

type AdminUsersPanelProps = {
  users: Array<{
    id: string;
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  currentUserId: string;
};

const initialState: ActionResult = { ok: false, message: "" };

export function AdminUsersPanel({ users, currentUserId }: AdminUsersPanelProps) {
  const [createState, createAction, createPending] = useActionState(
    createUserFormAction,
    initialState,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Create account</h2>
        <p className="mt-1 text-sm text-woodland-muted">
          New users receive a permanent password. Share it securely; it cannot be
          changed or recovered in the app.
        </p>
        <form action={createAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="username"
            placeholder="Username"
            required
            className="rounded-2xl border border-moss/20 px-4 py-3"
          />
          <input
            name="password"
            type="password"
            placeholder="Permanent password"
            required
            minLength={8}
            className="rounded-2xl border border-moss/20 px-4 py-3"
          />
          <button
            type="submit"
            disabled={createPending}
            className="rounded-full bg-moss px-4 py-3 font-semibold text-white sm:col-span-2"
          >
            {createPending ? "Creating..." : "Create user"}
          </button>
        </form>
        {createState.message ? (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              createState.ok ? "bg-leaf/30 text-woodland" : "bg-dusty-rose/20 text-woodland"
            }`}
          >
            {createState.message}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl bg-soft-cream/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-moss">Users</h2>
        <ul className="mt-4 space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-3 rounded-2xl bg-parchment px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-woodland">
                  {user.username}{" "}
                  <span className="text-xs uppercase text-woodland-muted">
                    {user.role}
                  </span>
                </p>
                <p className="text-xs text-woodland-muted">
                  Created {new Date(user.createdAt).toLocaleDateString()} ·{" "}
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              {user.id !== currentUserId && user.role !== "ADMIN" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await toggleUserActiveAction(
                        user.id,
                        !user.isActive,
                      );
                      setStatusMessage(result.message ?? null);
                    })
                  }
                  className="rounded-full bg-moss/10 px-4 py-2 text-sm font-semibold text-moss-dark"
                >
                  {user.isActive ? "Deactivate" : "Reactivate"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {statusMessage ? (
          <p className="mt-3 text-sm text-moss-dark">{statusMessage}</p>
        ) : null}
      </section>
    </div>
  );
}

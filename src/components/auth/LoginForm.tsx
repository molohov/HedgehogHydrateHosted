"use client";

import { useActionState } from "react";
import { loginFormAction } from "@/app/actions/auth";
import type { ActionResult } from "@/app/actions/auth";

const initialState: ActionResult = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginFormAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-moss">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="w-full rounded-2xl border border-moss/20 bg-white px-4 py-3 text-woodland outline-none ring-moss focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-moss">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-moss/20 bg-white px-4 py-3 text-woodland outline-none ring-moss focus:ring-2"
        />
      </div>
      {state.message ? (
        <p className="rounded-xl bg-dusty-rose/20 px-3 py-2 text-sm text-woodland">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-moss px-4 py-3 font-semibold text-white hover:bg-moss-dark disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-woodland-muted">
        Accounts are created by an admin. Passwords are permanent.
      </p>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/actions/auth";
import { DEV_MOCK_USERS, DEV_SKIP_PASSWORD } from "@/lib/dev-auth";

const initialState: AuthState = {};

const devSkipEnabled = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to Doora</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your unified platform</p>
      </div>

      {devSkipEnabled && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">Dev only — skip login (no database)</p>
          <p className="mt-1 text-xs text-amber-700">
            Browse the UI without PostgreSQL. Food, chat, and Doora actions still need a DB.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEV_MOCK_USERS.map((user) => (
              <form key={user.id} action={formAction}>
                <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />
                <input type="hidden" name="email" value={user.email} />
                <input type="hidden" name="password" value={DEV_SKIP_PASSWORD} />
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-lg border border-amber-300 bg-white px-2 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  {user.role}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />
        {state.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-doora-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-doora-orange-dark disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/register" className="font-medium text-doora-orange hover:underline">
          Register
        </Link>
      </p>
      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Demo accounts</p>
        <p>resident@demo.com / password123</p>
        <p>admin@doora.local / admin123</p>
      </div>
    </div>
  );
}

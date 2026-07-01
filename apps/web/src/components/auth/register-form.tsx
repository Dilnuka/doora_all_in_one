"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "@/actions/auth";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Join the Doora platform</p>
      </div>
      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div>
        )}
        {state.success && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {state.success}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
            minLength={6}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="tower" className="text-sm font-medium text-slate-700">
              Tower
            </label>
            <input
              id="tower"
              name="tower"
              placeholder="B"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="apartment" className="text-sm font-medium text-slate-700">
              Apartment
            </label>
            <input
              id="apartment"
              name="apartment"
              placeholder="1204"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <input type="hidden" name="role" value="RESIDENT" />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

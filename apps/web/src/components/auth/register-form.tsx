"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  completeRegisterAction,
  startRegisterAction,
  type AuthState,
} from "@/actions/auth";

const initialStartState: AuthState = { step: "details" };
const initialCompleteState: AuthState = {};

export function RegisterForm() {
  const [details, setDetails] = useState({
    name: "",
    email: "",
    password: "",
    tower: "",
    apartment: "",
  });
  const [manualOtpStep, setManualOtpStep] = useState(false);
  const [startState, startAction, startPending] = useActionState(
    startRegisterAction,
    initialStartState,
  );
  const [completeState, completeAction, completePending] = useActionState(
    completeRegisterAction,
    initialCompleteState,
  );

  const otpStep =
    manualOtpStep ||
    (completeState.step === "details"
      ? false
      : startState.step === "otp" || completeState.step === "otp");

  useEffect(() => {
    if (startState.step === "otp") setManualOtpStep(true);
    if (completeState.step === "details" || startState.step === "details") {
      setManualOtpStep(false);
    }
  }, [startState.step, completeState.step]);

  const activeEmail = completeState.email || startState.email || details.email;
  const activeName = completeState.name || startState.name || details.name;

  function captureDetails(form: HTMLFormElement) {
    const data = new FormData(form);
    setDetails({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      tower: String(data.get("tower") ?? ""),
      apartment: String(data.get("apartment") ?? ""),
    });
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          {otpStep ? "Verify your email to finish signing up" : "Join the Doora platform"}
        </p>
      </div>

      {!otpStep ? (
        <form
          id="register-details-form"
          action={startAction}
          className="space-y-4"
          onSubmit={(e) => captureDetails(e.currentTarget)}
        >
          {(startState.error || completeState.error) && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {startState.error || completeState.error}
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
              defaultValue={details.name}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
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
              defaultValue={details.email}
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
              minLength={6}
              defaultValue={details.password}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
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
                defaultValue={details.tower}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
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
                defaultValue={details.apartment}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
              />
            </div>
          </div>
          <input type="hidden" name="role" value="RESIDENT" />
          <button
            type="submit"
            disabled={startPending}
            className="w-full rounded-lg bg-doora-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-doora-orange-dark disabled:opacity-60"
          >
            {startPending ? "Sending code..." : "Continue with email verification"}
          </button>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById("register-details-form") as HTMLFormElement | null;
              if (form) captureDetails(form);
              setManualOtpStep(true);
            }}
            className="w-full text-sm text-doora-orange hover:underline"
          >
            I already received my code
          </button>
        </form>
      ) : (
        <>
          <form action={completeAction} className="space-y-4">
            <input type="hidden" name="name" value={activeName} />
            <input type="hidden" name="email" value={activeEmail} />
            <input type="hidden" name="password" value={details.password} />
            <input type="hidden" name="tower" value={details.tower} />
            <input type="hidden" name="apartment" value={details.apartment} />
            <input type="hidden" name="role" value="RESIDENT" />

            {completeState.error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {completeState.error}
              </div>
            )}
            {startState.success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {startState.success}
              </div>
            )}
            {startState.previewCode && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Dev preview code: <strong>{startState.previewCode}</strong>
              </div>
            )}
            <p className="text-sm text-slate-600">
              Code sent to <span className="font-medium">{activeEmail}</span>
            </p>
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="123456"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:border-doora-orange focus:ring-2 focus:ring-doora-orange/20"
              />
            </div>
            <button
              type="submit"
              disabled={completePending}
              className="w-full rounded-lg bg-doora-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-doora-orange-dark disabled:opacity-60"
            >
              {completePending ? "Creating account..." : "Verify and create account"}
            </button>
          </form>
          <form
            action={startAction}
            className="mt-3"
            onSubmit={(e) => captureDetails(e.currentTarget)}
          >
            <input type="hidden" name="name" value={activeName} />
            <input type="hidden" name="email" value={activeEmail} />
            <input type="hidden" name="password" value={details.password} />
            <input type="hidden" name="tower" value={details.tower} />
            <input type="hidden" name="apartment" value={details.apartment} />
            <input type="hidden" name="role" value="RESIDENT" />
            <button type="submit" className="w-full text-sm text-doora-orange hover:underline">
              Resend code
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-doora-orange hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

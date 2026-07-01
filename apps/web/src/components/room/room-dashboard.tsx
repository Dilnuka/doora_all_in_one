"use client";

import {
  AlarmClock,
  Blinds,
  Coffee,
  Lightbulb,
  Lock,
  ShieldAlert,
  Thermometer,
  Tv,
  Zap,
} from "lucide-react";
import { useRoomSimulation } from "@/components/room/room-simulation-provider";

function Toggle({
  label,
  icon,
  active,
  onClick,
  disabled,
  color = "indigo",
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition disabled:opacity-40 ${
        active
          ? `border-${color}-500/50 bg-${color}-500/10`
          : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
      }`}
      style={
        active
          ? { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.1)" }
          : undefined
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`rounded-xl p-2 ${active ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400"}`}
        >
          {icon}
        </div>
        <div
          className={`h-6 w-11 rounded-full p-0.5 transition ${active ? "bg-indigo-600" : "bg-slate-600"}`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow transition ${active ? "translate-x-5" : ""}`}
          />
        </div>
      </div>
      <p className="font-medium text-white">{label}</p>
      <p className="text-xs text-slate-400">{active ? "ON" : "OFF"}</p>
    </button>
  );
}

export function RoomDashboard() {
  const sim = useRoomSimulation();
  const { roomState, readOnly, roomLabel, logs } = sim;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-400">Smart Room</p>
          <h1 className="text-2xl font-bold text-white">{roomLabel}</h1>
          {readOnly && (
            <p className="mt-1 text-sm text-amber-400">Read-only (admin view)</p>
          )}
          <p className="mt-2 text-sm text-slate-400">
            Ambient {roomState.ambientTemp}°C · AC target {roomState.ac.temp}°C
          </p>
        </div>

        {roomState.alarm?.ringing && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-red-500/20 px-4 py-3 text-red-200">
            <span className="flex items-center gap-2 font-medium">
              <AlarmClock className="h-5 w-5" />
              Alarm ringing!
            </span>
            <button
              onClick={sim.dismissAlarm}
              className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {roomState.smokeDetected && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-500/20 px-4 py-3 text-orange-200">
            <ShieldAlert className="h-5 w-5" />
            Smoke detected
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Toggle
            label="All lights"
            icon={<Lightbulb className="h-5 w-5" />}
            active={roomState.lights.master}
            onClick={() => sim.setLight("all", !roomState.lights.master)}
            disabled={readOnly}
          />
          <Toggle
            label="Living lights"
            icon={<Lightbulb className="h-5 w-5" />}
            active={roomState.lights.living}
            onClick={() => sim.setLight("living", !roomState.lights.living)}
            disabled={readOnly}
          />
          <Toggle
            label="Bedroom lights"
            icon={<Lightbulb className="h-5 w-5" />}
            active={roomState.lights.bed}
            onClick={() => sim.setLight("bed", !roomState.lights.bed)}
            disabled={readOnly}
          />
          <Toggle
            label="Air conditioning"
            icon={<Thermometer className="h-5 w-5" />}
            active={roomState.ac.isOn}
            onClick={() => sim.setAc(!roomState.ac.isOn, undefined)}
            disabled={readOnly}
          />
          <Toggle
            label="Television"
            icon={<Tv className="h-5 w-5" />}
            active={roomState.tv}
            onClick={() => sim.setTv(!roomState.tv)}
            disabled={readOnly}
          />
          <Toggle
            label="Living curtains"
            icon={<Blinds className="h-5 w-5" />}
            active={roomState.curtains.living}
            onClick={() => sim.setCurtains("living", !roomState.curtains.living)}
            disabled={readOnly}
          />
          <Toggle
            label="Door lock"
            icon={<Lock className="h-5 w-5" />}
            active={roomState.doorLocked}
            onClick={() => sim.setDoor(!roomState.doorLocked)}
            disabled={readOnly}
          />
          <Toggle
            label="Coffee maker"
            icon={<Coffee className="h-5 w-5" />}
            active={roomState.coffeeMaker}
            onClick={() => sim.setCoffee(!roomState.coffeeMaker)}
            disabled={readOnly}
          />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-4">
          <p className="mb-3 text-sm font-medium text-slate-300">Climate</p>
          <div className="flex items-center gap-4">
            <button
              disabled={readOnly || !roomState.ac.isOn}
              onClick={() => sim.setAc(true, roomState.ac.temp - 1)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-white disabled:opacity-40"
            >
              −
            </button>
            <span className="text-3xl font-bold text-white">{roomState.ac.temp}°C</span>
            <button
              disabled={readOnly || !roomState.ac.isOn}
              onClick={() => sim.setAc(true, roomState.ac.temp + 1)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-white disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <aside className="w-full border-t border-slate-700 bg-slate-900/50 lg:w-80 lg:border-l lg:border-t-0">
        <div className="border-b border-slate-700 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Zap className="h-4 w-4 text-indigo-400" />
            System logs
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto p-3 font-mono text-xs lg:max-h-none lg:flex-1">
          {logs.length === 0 && (
            <p className="text-slate-500">No activity yet. Toggle a device to begin.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="mb-2 border-b border-slate-800 pb-2 text-slate-400">
              <span className="text-slate-500">[{log.timestamp}]</span>{" "}
              <span
                className={
                  log.source === "error"
                    ? "text-red-400"
                    : log.source === "iot"
                      ? "text-cyan-400"
                      : "text-slate-300"
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

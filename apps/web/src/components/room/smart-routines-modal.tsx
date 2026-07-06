"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { useRoomSimulation } from "@/components/room/room-simulation-provider";

type Routine = {
  id: string;
  triggerPhrase: string;
  actions: Record<string, string | number>;
};

export function SmartRoutinesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { runRoutine, readOnly } = useRoomSimulation();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/room/routines")
      .then((r) => r.json())
      .then((d) => setRoutines(d.routines ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Smart Routines</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && <p className="text-center text-slate-400">Loading...</p>}
          {!loading && routines.length === 0 && (
            <p className="text-center text-slate-400">No routines yet</p>
          )}
          <div className="space-y-2">
            {routines.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3"
              >
                <span className="font-medium text-white">{r.triggerPhrase}</span>
                <button
                  disabled={readOnly}
                  onClick={() => {
                    runRoutine(r.actions as Record<string, string | number>);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-doora-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-doora-orange-dark disabled:opacity-40"
                >
                  <Play className="h-4 w-4" />
                  Run
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

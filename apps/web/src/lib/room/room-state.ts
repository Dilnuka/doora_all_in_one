export const DEFAULT_ROOM_STATE = {
  lights: {
    master: false,
    kitchen: false,
    bath: false,
    bed: false,
    living: false,
  },
  ac: { isOn: true, temp: 22 },
  ambientTemp: 24.5,
  tv: false,
  curtains: { living: false, bed: false },
  doorLocked: true,
  occupancy: true,
  smokeDetected: false,
  coffeeMaker: false,
  windowOpen: { living: false, bed: false },
  alarm: { enabled: false, time: "07:00", ringing: false },
};

export type RoomState = typeof DEFAULT_ROOM_STATE;

export type RoomSnapshot = {
  roomState: RoomState;
  serviceQueue: { id: number; type: string; text: string; time: string }[];
  logs: { id: number; message: string; source: string; timestamp: string }[];
};

export function mergeRoomState(partial: Partial<RoomState> | null | undefined): RoomState {
  if (!partial || typeof partial !== "object") {
    return { ...DEFAULT_ROOM_STATE };
  }

  const curtains =
    typeof partial.curtains === "object"
      ? { ...DEFAULT_ROOM_STATE.curtains, ...partial.curtains }
      : DEFAULT_ROOM_STATE.curtains;

  const windowOpen =
    typeof partial.windowOpen === "object"
      ? { ...DEFAULT_ROOM_STATE.windowOpen, ...partial.windowOpen }
      : DEFAULT_ROOM_STATE.windowOpen;

  return {
    ...DEFAULT_ROOM_STATE,
    ...partial,
    lights: { ...DEFAULT_ROOM_STATE.lights, ...(partial.lights || {}) },
    ac: { ...DEFAULT_ROOM_STATE.ac, ...(partial.ac || {}) },
    curtains,
    windowOpen,
    alarm: { ...DEFAULT_ROOM_STATE.alarm, ...(partial.alarm || {}) },
  };
}

export function parsePersistedRoomSnapshot(raw: unknown): RoomSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  return {
    roomState: data.roomState ? mergeRoomState(data.roomState as Partial<RoomState>) : mergeRoomState(null),
    serviceQueue: Array.isArray(data.serviceQueue) ? (data.serviceQueue as RoomSnapshot["serviceQueue"]) : [],
    logs: Array.isArray(data.logs) ? (data.logs as RoomSnapshot["logs"]) : [],
  };
}

import type { RoomState } from "./room-state";

export type RoomLog = {
  id: number;
  message: string;
  source: string;
  timestamp: string;
};

export type RoomSimulationActions = {
  setLight: (zone: string, state: boolean) => void;
  setAc: (isOn?: boolean, temp?: number) => void;
  setTv: (state: boolean) => void;
  setCurtains: (zone: string, state: boolean) => void;
  setDoor: (locked: boolean) => void;
  setWindow: (zone: string, state: boolean) => void;
  setCoffee: (state: boolean) => void;
  setAlarm: (enabled: boolean, time?: string) => void;
  dismissAlarm: () => void;
  roomState: RoomState;
};

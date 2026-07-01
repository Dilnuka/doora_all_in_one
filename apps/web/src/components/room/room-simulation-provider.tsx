"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import mqtt from "mqtt";
import { useSession } from "next-auth/react";
import {
  DEFAULT_ROOM_STATE,
  mergeRoomState,
  type RoomState,
} from "@/lib/room/room-state";
import type { RoomLog } from "@/lib/room/types";
import { loadRoomSnapshot, persistRoomSnapshot } from "@/lib/room/client";
import { applyRoutineActions } from "@/lib/room/apply-routine";
import type { RoomSimulationActions } from "@/lib/room/types";

type ServiceRequest = { id: number; type: string; text: string; time: string };

type SimulationContextValue = RoomSimulationActions & {
  logs: RoomLog[];
  serviceQueue: ServiceRequest[];
  isHydrated: boolean;
  readOnly: boolean;
  roomLabel: string;
  setActiveRoomId: (id: string | null) => void;
  addLog: (message: string, source?: string) => void;
  runRoutine: (actions: Record<string, string | number>) => void;
};

const SimulationContext = createContext<SimulationContextValue | null>(null);

const MQTT_URL =
  process.env.NEXT_PUBLIC_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

export function RoomSimulationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("roomId");
    }
    return null;
  });
  const roomId =
    isAdmin && activeRoomId ? activeRoomId : session?.user?.roomId ?? null;

  const [roomState, setRoomState] = useState<RoomState>(DEFAULT_ROOM_STATE);
  const [serviceQueue, setServiceQueue] = useState<ServiceRequest[]>([]);
  const [logs, setLogs] = useState<RoomLog[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [roomLabel, setRoomLabel] = useState("Smart Room");
  const [readOnly, setReadOnly] = useState(false);

  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const snapshotRef = useRef({
    roomState: DEFAULT_ROOM_STATE,
    serviceQueue: [] as ServiceRequest[],
    logs: [] as RoomLog[],
  });
  const persistReadyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acceptMqttRef = useRef(false);

  const clientId = useMemo(() => Math.random().toString(36).substring(7), []);
  const TOPIC_SYNC = useMemo(
    () => (roomId ? `doora/platform/rooms/${roomId}/sync` : null),
    [roomId],
  );

  const isAdminViewingRoom = isAdmin && !!activeRoomId;

  useEffect(() => {
    snapshotRef.current = { roomState, serviceQueue, logs };
  }, [roomState, serviceQueue, logs]);

  const flushPersist = useCallback(async () => {
    if (!roomId || !persistReadyRef.current || isAdminViewingRoom) return;
    await persistRoomSnapshot(snapshotRef.current);
  }, [roomId, isAdminViewingRoom]);

  const queuePersist = useCallback(
    (immediate = false) => {
      if (!roomId || !persistReadyRef.current || isAdminViewingRoom) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (immediate) {
        void flushPersist().catch(console.error);
        return;
      }
      saveTimerRef.current = setTimeout(() => {
        void flushPersist().catch(console.error);
      }, 400);
    },
    [roomId, isAdminViewingRoom, flushPersist],
  );

  const publishState = useCallback(
    (newState: RoomState) => {
      snapshotRef.current = { ...snapshotRef.current, roomState: newState };
      queuePersist(true);
      if (mqttClientRef.current?.connected && TOPIC_SYNC) {
        mqttClientRef.current.publish(
          TOPIC_SYNC,
          JSON.stringify({ clientId, type: "SYNC_STATE", payload: newState }),
        );
      }
    },
    [clientId, TOPIC_SYNC, queuePersist],
  );

  const addLog = useCallback(
    (message: string, source = "system") => {
      const logEntry: RoomLog = {
        id: Date.now() + Math.random(),
        message,
        source,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [logEntry, ...prev].slice(0, 50));
      if (mqttClientRef.current?.connected && TOPIC_SYNC) {
        mqttClientRef.current.publish(
          TOPIC_SYNC,
          JSON.stringify({ clientId, type: "ADD_LOG", payload: logEntry }),
        );
      }
    },
    [clientId, TOPIC_SYNC],
  );

  useEffect(() => {
    if (status !== "authenticated" || !roomId) {
      persistReadyRef.current = false;
      acceptMqttRef.current = false;
      setIsHydrated(false);
      return;
    }

    let cancelled = false;
    persistReadyRef.current = false;
    acceptMqttRef.current = false;
    setIsHydrated(false);

    void (async () => {
      try {
        const adminRoomId = isAdmin && activeRoomId ? activeRoomId : null;
        const data = await loadRoomSnapshot(adminRoomId);
        if (cancelled) return;
        setRoomState(data.roomState ? mergeRoomState(data.roomState) : DEFAULT_ROOM_STATE);
        setServiceQueue(data.serviceQueue ?? []);
        setLogs(data.logs ?? []);
        setRoomLabel(data.roomName || data.roomCode || "Smart Room");
        setReadOnly(!!data.readOnly || isAdminViewingRoom);
        persistReadyRef.current = !isAdminViewingRoom;
        setTimeout(() => {
          acceptMqttRef.current = true;
        }, 1500);
      } catch (e) {
        console.error("Failed to load room state", e);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, activeRoomId, isAdmin, isAdminViewingRoom, status]);

  useEffect(() => {
    if (!roomId || !isHydrated || !persistReadyRef.current) return;
    queuePersist(false);
  }, [roomId, isHydrated, roomState, serviceQueue, logs, queuePersist]);

  useEffect(() => {
    if (!TOPIC_SYNC || !isHydrated) return;

    const client = mqtt.connect(MQTT_URL);
    mqttClientRef.current = client;

    client.on("connect", () => {
      client.subscribe(TOPIC_SYNC);
      addLog("Connected to MQTT broker", "system");
    });

    client.on("message", (topic, message) => {
      if (topic !== TOPIC_SYNC) return;
      try {
        const data = JSON.parse(message.toString()) as {
          clientId?: string;
          type?: string;
          payload?: unknown;
        };
        if (data.clientId === clientId) return;
        if (data.type === "SYNC_STATE" && data.payload && acceptMqttRef.current) {
          setRoomState((prev) => mergeRoomState({ ...prev, ...(data.payload as RoomState) }));
        } else if (data.type === "ADD_LOG" && data.payload) {
          setLogs((prev) => [data.payload as RoomLog, ...prev].slice(0, 50));
        }
      } catch {
        // ignore parse errors
      }
    });

    const tempInterval = setInterval(() => {
      setRoomState((prev) => {
        let current = prev.ambientTemp ?? 24.5;
        const target = prev.ac?.isOn ? prev.ac.temp : 28;
        if (Math.abs(current - target) < 0.1) return prev;
        current += current < target ? 0.1 : -0.1;
        const newState = { ...prev, ambientTemp: Number(current.toFixed(1)) };
        if (client.connected && TOPIC_SYNC) {
          client.publish(
            TOPIC_SYNC,
            JSON.stringify({ clientId, type: "SYNC_STATE", payload: newState }),
          );
        }
        return newState;
      });
    }, 5000);

    return () => {
      clearInterval(tempInterval);
      client.end();
    };
  }, [clientId, TOPIC_SYNC, addLog, isHydrated]);

  const setLight = useCallback(
    (zone: string, state: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const newLights = { ...prev.lights };
        if (zone === "all" || zone === "master") {
          Object.keys(newLights).forEach((k) => {
            newLights[k as keyof typeof newLights] = state;
          });
        } else if (zone in newLights) {
          newLights[zone as keyof typeof newLights] = state;
        }
        const computed = { ...prev, lights: newLights };
        publishState(computed);
        return computed;
      });
      addLog(`Light ${zone} → ${state ? "ON" : "OFF"}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setAc = useCallback(
    (isOn?: boolean, temp?: number) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const computed = {
          ...prev,
          ac: {
            isOn: isOn !== undefined ? isOn : prev.ac.isOn,
            temp: temp ?? prev.ac.temp,
          },
        };
        publishState(computed);
        return computed;
      });
      addLog(`AC → ${isOn ? "ON" : "OFF"} ${temp ? `${temp}°C` : ""}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setTv = useCallback(
    (state: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const computed = { ...prev, tv: state };
        publishState(computed);
        return computed;
      });
      addLog(`TV → ${state ? "ON" : "OFF"}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setCurtains = useCallback(
    (zone: string, state: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const newCurtains = { ...prev.curtains, [zone]: state };
        const computed = { ...prev, curtains: newCurtains };
        publishState(computed);
        return computed;
      });
      addLog(`Curtains ${zone} → ${state ? "OPEN" : "CLOSED"}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setDoor = useCallback(
    (locked: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const computed = { ...prev, doorLocked: locked };
        publishState(computed);
        return computed;
      });
      addLog(`Door → ${locked ? "LOCKED" : "UNLOCKED"}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setWindow = useCallback(
    (zone: string, state: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const newWindows = { ...prev.windowOpen, [zone]: state };
        const computed = { ...prev, windowOpen: newWindows };
        publishState(computed);
        return computed;
      });
      addLog(`Window ${zone} → ${state ? "OPEN" : "CLOSED"}`, "iot");
    },
    [addLog, publishState, readOnly],
  );

  const setCoffee = useCallback(
    (state: boolean) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const computed = { ...prev, coffeeMaker: state };
        publishState(computed);
        return computed;
      });
      addLog(`Coffee maker → ${state ? "BREWING" : "OFF"}`, "iot");
      if (state) {
        setTimeout(() => {
          setRoomState((prev) => {
            const done = { ...prev, coffeeMaker: false };
            publishState(done);
            return done;
          });
        }, 5000);
      }
    },
    [addLog, publishState, readOnly],
  );

  const setAlarm = useCallback(
    (enabled: boolean, time?: string) => {
      if (readOnly) return;
      setRoomState((prev) => {
        const computed = {
          ...prev,
          alarm: { enabled, time: time || prev.alarm?.time || "07:00", ringing: false },
        };
        publishState(computed);
        return computed;
      });
      addLog(`Alarm ${enabled ? `set for ${time}` : "disabled"}`, "system");
    },
    [addLog, publishState, readOnly],
  );

  const dismissAlarm = useCallback(() => {
    if (readOnly) return;
    setRoomState((prev) => {
      const computed = {
        ...prev,
        alarm: { ...prev.alarm, ringing: false, enabled: false },
      };
      publishState(computed);
      return computed;
    });
    addLog("Alarm dismissed", "system");
  }, [addLog, publishState, readOnly]);

  const runRoutine = useCallback(
    (actions: Record<string, string | number>) => {
      const sim = {
        setLight,
        setAc,
        setTv,
        setCurtains,
        setDoor,
        setWindow,
        setCoffee,
        setAlarm,
        dismissAlarm,
        roomState,
      };
      applyRoutineActions(actions, sim);
      addLog("Routine executed", "system");
    },
    [
      setLight,
      setAc,
      setTv,
      setCurtains,
      setDoor,
      setWindow,
      setCoffee,
      setAlarm,
      dismissAlarm,
      roomState,
      addLog,
    ],
  );

  const value: SimulationContextValue = {
    roomState,
    logs,
    serviceQueue,
    isHydrated,
    readOnly,
    roomLabel,
    setActiveRoomId,
    setLight,
    setAc,
    setTv,
    setCurtains,
    setDoor,
    setWindow,
    setCoffee,
    setAlarm,
    dismissAlarm,
    addLog,
    runRoutine,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useRoomSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useRoomSimulation must be used within RoomSimulationProvider");
  return ctx;
}

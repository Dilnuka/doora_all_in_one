import type { RoomSimulationActions } from "@/lib/room/types";

type RoutineActions = Record<string, string | number>;

export function applyRoutineActions(
  actions: RoutineActions,
  sim: RoomSimulationActions,
) {
  const on = (v: string | number | undefined) => v === "on" || v === "open" || v === "lock";
  const off = (v: string | number | undefined) => v === "off" || v === "close" || v === "unlock";

  if (actions.light_master === "on") sim.setLight("all", true);
  if (actions.light_master === "off") sim.setLight("all", false);
  if (actions.light_kitchen === "on") sim.setLight("kitchen", true);
  if (actions.light_kitchen === "off") sim.setLight("kitchen", false);
  if (actions.light_bath === "on") sim.setLight("bath", true);
  if (actions.light_bath === "off") sim.setLight("bath", false);
  if (actions.light_bed === "on") sim.setLight("bed", true);
  if (actions.light_bed === "off") sim.setLight("bed", false);
  if (actions.light_living === "on") sim.setLight("living", true);
  if (actions.light_living === "off") sim.setLight("living", false);

  if (actions.curtains_bed === "open") sim.setCurtains("bed", true);
  if (actions.curtains_bed === "close") sim.setCurtains("bed", false);
  if (actions.curtains_living === "open") sim.setCurtains("living", true);
  if (actions.curtains_living === "close") sim.setCurtains("living", false);

  if (actions.window_bed === "open") sim.setWindow("bed", true);
  if (actions.window_bed === "close") sim.setWindow("bed", false);
  if (actions.window_living === "open") sim.setWindow("living", true);
  if (actions.window_living === "close") sim.setWindow("living", false);

  if (actions.ac_power === "on") sim.setAc(true, undefined);
  if (actions.ac_power === "off") sim.setAc(false, undefined);
  if (typeof actions.ac_temp === "number") sim.setAc(true, actions.ac_temp);

  if (actions.tv === "on" || on(actions.tv)) sim.setTv(true);
  if (actions.tv === "off" || off(actions.tv)) sim.setTv(false);

  if (actions.door === "lock") sim.setDoor(true);
  if (actions.door === "unlock") sim.setDoor(false);
}

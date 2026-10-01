import { GAME_CONFIG } from "./config";
import { aperture, rotorAngle, type GameNode } from "./nodes";

export interface PilotTarget {
  node: GameNode;
  x: number;
  y: number;
  distance: number;
}
export interface PilotCue {
  type: GameNode["type"] | "receiver";
  horizontal: number;
  vertical: number;
  distance: number;
}

/** Course bends are automatic; pilot input changes offsets inside the skyway. */
export function flightControls(keys: Set<string>, mouse = 0) {
  const braking = keys.has("s") || keys.has("arrowdown");
  const boosting = keys.has("shift") && !braking;
  const accelerating = keys.has("w") || keys.has("arrowup");
  const keyboard =
    Number(keys.has("d") || keys.has("arrowright")) -
    Number(keys.has("a") || keys.has("arrowleft"));
  return {
    boosting,
    steer: Math.max(
      -1,
      Math.min(
        1,
        ["a", "d", "arrowleft", "arrowright"].some((key) => keys.has(key))
          ? keyboard
          : mouse,
      ),
    ),
    lift: Number(keys.has("q")) - Number(keys.has("e")),
    targetSpeed: braking
      ? GAME_CONFIG.movement.brakeSpeed
      : boosting
        ? GAME_CONFIG.movement.boostSpeed
        : accelerating
          ? GAME_CONFIG.movement.accelerateSpeed
          : GAME_CONFIG.movement.cruiseSpeed,
  };
}

export function axisVelocity(
  previous: number,
  input: number,
  speed: number,
  response: number,
  dt: number,
) {
  const target = input * speed;
  const rate = input === 0 ? GAME_CONFIG.movement.releaseResponse : response;
  return target + (previous - target) * Math.exp(-rate * dt);
}

/** Both the HUD and the 3D line point at the actual current opening. */
export function pilotTarget(
  nodes: GameNode[],
  z: number,
  elapsed: number,
): PilotTarget | null {
  const node = nodes.find(
    (n) =>
      n.z < z &&
      ["shutter", "curtain", "rotor", "booster", "relay", "tracker"].includes(
        n.type,
      ),
  );
  if (!node) return null;
  const opening = aperture(node, elapsed);
  if (node.type === "tracker") {
    // The blue guide goes around red hazards, never into their center.
    opening.x +=
      (node.x >= 0 ? -1 : 1) *
      (node.radius + GAME_CONFIG.guidance.trackerMargin);
  }
  if (node.type === "rotor") {
    // Follow one open quadrant continuously, avoiding sudden side switches.
    const angle = rotorAngle(node, elapsed) + Math.PI / 4;
    opening.x += Math.cos(angle) * GAME_CONFIG.guidance.rotorAimRadius;
    opening.y += Math.sin(angle) * GAME_CONFIG.guidance.rotorAimRadius;
  }
  return { node, ...opening, distance: z - node.z };
}

export function pilotCue(
  target: PilotTarget | null,
  x: number,
  y: number,
  distance: number,
): PilotCue {
  const direction = (gap: number) =>
    Math.abs(gap) < GAME_CONFIG.guidance.directionDeadzone ? 0 : Math.sign(gap);
  return {
    type: target?.node.type ?? "receiver",
    horizontal: direction((target?.x ?? 0) - x),
    vertical: direction((target?.y ?? 0) - y),
    distance: Math.round(target?.distance ?? distance),
  };
}

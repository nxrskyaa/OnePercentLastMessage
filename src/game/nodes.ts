import { GAME_CONFIG } from "./config";

export type NodeType =
  | "relay"
  | "tracker"
  | "booster"
  | "tip"
  | "safe"
  | "public"
  | "curtain"
  | "shutter"
  | "rotor";
export interface GameNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  z: number;
  radius: number;
  height?: number;
  sway?: number;
  rise?: number;
  frequency?: number;
  phase?: number;
}
export function curtainOpening(node: GameNode, elapsed: number): number {
  return Math.max(
    -10.5,
    Math.min(
      10.5,
      node.x +
        Math.sin(elapsed * (node.frequency ?? 0) + (node.phase ?? 0)) *
          (node.sway ?? 0),
    ),
  );
}
export function aperture(node: GameNode, elapsed: number) {
  return {
    x: curtainOpening(node, elapsed),
    y:
      node.y +
      Math.sin(elapsed * (node.frequency ?? 0) + (node.phase ?? 0) + 0.8) *
        (node.rise ?? 0),
  };
}
export function rotorAngle(node: GameNode, elapsed: number) {
  return (
    elapsed * (node.frequency ?? GAME_CONFIG.obstacles.rotorSpeed) +
    (node.phase ?? 0)
  );
}
/** Visual and collision code share these paths, with clearance for the packet shell. */
export function hitsObstacle(
  node: GameNode,
  x: number,
  y: number,
  elapsed: number,
) {
  const packet = GAME_CONFIG.movement.collisionRadius;
  if (node.type === "curtain")
    return Math.abs(x - curtainOpening(node, elapsed)) + packet > node.radius;
  if (node.type === "shutter") {
    const opening = aperture(node, elapsed);
    return (
      Math.abs(x - opening.x) + packet > node.radius ||
      Math.abs(y - opening.y) + packet > (node.height ?? 3.5)
    );
  }
  if (node.type === "rotor") {
    const dx = x - node.x,
      dy = y - node.y;
    const angle = rotorAngle(node, elapsed);
    const localX = Math.cos(angle) * dx + Math.sin(angle) * dy;
    const localY = -Math.sin(angle) * dx + Math.cos(angle) * dy;
    const width = GAME_CONFIG.obstacles.rotorHalfWidth + packet;
    const blade = node.radius + packet;
    return (
      (Math.abs(localY) < width && Math.abs(localX) < blade) ||
      (Math.abs(localX) < width && Math.abs(localY) < blade)
    );
  }
  return false;
}
/** Authored beats leave time to read, steer and change altitude; seeds alter gentle gate motion. */
export function generateNodes(runId: number, stageIndex = 0): GameNode[] {
  const nodes: GameNode[] = [];
  const add = (
    type: NodeType,
    z: number,
    x: number,
    y: number,
    radius: number,
    extra: Partial<GameNode> = {},
  ) => {
    nodes.push({ id: `${type}-${z}-${x}`, type, z, x, y, radius, ...extra });
  };
  const difficulty = 1 + Math.min(2, stageIndex) * 0.08;
  const gate = (z: number, x: number, y: number, moving = false) =>
    add("shutter", z, x, y, 6 / difficulty, {
      height: 4.8 / difficulty,
      sway: moving ? 1.1 : 0,
      rise: moving ? 0.6 : 0,
      frequency: moving ? 0.22 * difficulty : 0,
      phase: runId * 0.47 + z * 0.01,
    });
  add("relay", -65, 0, 0, 5);
  add("tip", -110, -4, 2, 2.4);
  add("relay", -165, -3, 2, 5);
  gate(-235, -3, 3);
  add("booster", -285, -3, 3, 5);
  add("tracker", -345, 3, 2, 3);
  gate(-415, 4, 0);
  add("booster", -460, 4, 0, 5);
  add("tip", -490, 5, -2, 2.6);
  gate(-550, -4, 5, true);
  add("booster", -595, -4, 5, 5);
  add("relay", -650, 0, 4, 5);
  add("safe", GAME_CONFIG.course.splitZ, -9, 7, 6);
  add("public", GAME_CONFIG.course.splitZ, 9, -3, 6);
  add("tip", -790, 9, -3, 2.6);
  add("tracker", -835, 8, -2, 3);
  gate(-895, 3, 6, true);
  add("booster", -940, 3, 6, 5);
  add("rotor", -1005, 0, 3, 15, {
    frequency: GAME_CONFIG.obstacles.rotorSpeed * difficulty,
    phase: runId * 0.31,
  });
  add("relay", -1060, -9, -3, 5);
  add("booster", -1100, -9, -3, 4);
  gate(-1160, -7, -3, true);
  add("rotor", -1240, 0, 3, 15, {
    frequency: -GAME_CONFIG.obstacles.rotorSpeed * difficulty,
    phase: runId * 0.51 + 1.4,
  });
  add("booster", -1290, 7, 7, 4.5);
  add("tip", -1320, 7, 7, 2.6);
  gate(-1380, 7, 8, true);
  add("relay", -1435, 0, 3, 5);
  gate(-1495, -6, -3, true);
  add("booster", -1545, -6, -3, 4.5);
  add("rotor", -1610, 0, 3, 15, {
    frequency: GAME_CONFIG.obstacles.rotorSpeed * difficulty,
    phase: runId * 0.6 + 0.8,
  });
  gate(-1680, 4, 5, true);
  add("booster", -1725, 4, 5, 4.5);
  add("relay", -1760, 0, 0, 5);
  return nodes
    .map((node) => {
      if (node.z > -200 || node.type === "safe" || node.type === "public")
        return node;
      if (stageIndex % 3 === 1) return { ...node, y: 5 - node.y };
      if (stageIndex % 3 === 2) return { ...node, x: -node.x };
      return node;
    })
    .sort((a, b) => b.z - a.z);
}

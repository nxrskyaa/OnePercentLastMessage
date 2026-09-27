export type NodeType =
  "relay" | "tracker" | "booster" | "tip" | "safe" | "public" | "curtain";

export interface GameNode {
  id: string;
  type: NodeType;
  x: number;
  z: number;
  radius: number;
  sway?: number;
  frequency?: number;
  phase?: number;
}

/** The illuminated opening slides slowly; visual and collision code share this path. */
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

const TEMPLATE: GameNode[] = [
  { id: "relay-a", type: "relay", x: 0, z: -72, radius: 5 },
  { id: "tip-a", type: "tip", x: -6, z: -111, radius: 2.2 },
  { id: "tracker-a", type: "tracker", x: 0, z: -153, radius: 2.8 },
  { id: "relay-b", type: "relay", x: -8, z: -202, radius: 5 },
  { id: "booster-a", type: "booster", x: -10, z: -247, radius: 4 },
  { id: "safe-gate", type: "safe", x: -10, z: -310, radius: 7 },
  { id: "public-gate", type: "public", x: 10, z: -310, radius: 7 },
  { id: "tip-b", type: "tip", x: 9, z: -350, radius: 2.2 },
  { id: "tracker-b", type: "tracker", x: -6, z: -383, radius: 2.8 },
  { id: "relay-c", type: "relay", x: 7, z: -427, radius: 5 },
  { id: "tip-c", type: "tip", x: 6, z: -460, radius: 2.2 },
  { id: "booster-b", type: "booster", x: 9, z: -505, radius: 4 },
  { id: "relay-d", type: "relay", x: 0, z: -542, radius: 5 },
  { id: "tracker-c", type: "tracker", x: 1, z: -580, radius: 2.8 },
];

const CURTAINS: readonly GameNode[][] = [
  [
    {
      id: "curtain-1",
      type: "curtain",
      x: -8.5,
      z: -218,
      radius: 5.3,
      sway: 2.1,
      frequency: 0.44,
    },
    {
      id: "curtain-2",
      type: "curtain",
      x: 8.5,
      z: -466,
      radius: 5.3,
      sway: 2.1,
      frequency: 0.48,
    },
  ],
  [
    {
      id: "curtain-1",
      type: "curtain",
      x: 9,
      z: -185,
      radius: 5.2,
      sway: 2.7,
      frequency: 0.56,
    },
    {
      id: "curtain-2",
      type: "curtain",
      x: -9,
      z: -356,
      radius: 5.2,
      sway: 2.7,
      frequency: 0.6,
    },
    {
      id: "curtain-3",
      type: "curtain",
      x: 9,
      z: -532,
      radius: 5.2,
      sway: 2.7,
      frequency: 0.58,
    },
  ],
  [
    {
      id: "curtain-1",
      type: "curtain",
      x: 9,
      z: -180,
      radius: 4.9,
      sway: 3,
      frequency: 0.64,
    },
    {
      id: "curtain-2",
      type: "curtain",
      x: -9,
      z: -300,
      radius: 4.9,
      sway: 3,
      frequency: 0.68,
    },
    {
      id: "curtain-3",
      type: "curtain",
      x: 9,
      z: -420,
      radius: 4.9,
      sway: 3,
      frequency: 0.7,
    },
    {
      id: "curtain-4",
      type: "curtain",
      x: -9,
      z: -550,
      radius: 4.9,
      sway: 3,
      frequency: 0.72,
    },
  ],
];

export function generateNodes(runId: number, stageIndex = 0): GameNode[] {
  const base = TEMPLATE.map((node, index) => {
    if (node.type === "safe" || node.type === "public") return node;
    const variation = Math.sin(runId * 13.37 + index * 7.11) * 1.6;
    return { ...node, x: Math.max(-12, Math.min(12, node.x + variation)) };
  });
  const curtains = CURTAINS[stageIndex % CURTAINS.length].map(
    (node, index) => ({
      ...node,
      phase: runId * 0.73 + index * 1.9,
    }),
  );
  return [...base, ...curtains];
}

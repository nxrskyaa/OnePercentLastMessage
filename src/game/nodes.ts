export type NodeType =
  "relay" | "tracker" | "booster" | "tip" | "safe" | "public";

export interface GameNode {
  id: string;
  type: NodeType;
  x: number;
  z: number;
  radius: number;
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

export function generateNodes(runId: number): GameNode[] {
  return TEMPLATE.map((node, index) => {
    if (node.type === "safe" || node.type === "public") return node;
    const variation = Math.sin(runId * 13.37 + index * 7.11) * 1.6;
    return { ...node, x: Math.max(-12, Math.min(12, node.x + variation)) };
  });
}

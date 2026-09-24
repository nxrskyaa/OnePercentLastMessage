import type { GameNode } from "@/game/nodes";

export interface AdvisorState {
  battery: number;
  privacy: number;
  distance: number;
  playerZ: number;
}
export interface AIAdvisor {
  recommend(state: AdvisorState, nodes: GameNode[]): string;
}

export class LocalRuleAdvisor implements AIAdvisor {
  recommend(state: AdvisorState, nodes: GameNode[]): string {
    if (state.battery < 0.18) {
      const booster = nodes.find(
        (node) =>
          node.type === "booster" &&
          node.z < state.playerZ &&
          state.playerZ - node.z < 130,
      );
      if (booster)
        return `Battery critical. Booster ${booster.x < 0 ? "left" : "right"}, ${Math.round(state.playerZ - booster.z)}m ahead.`;
      if (state.distance < 120)
        return "Receiver close. Accelerate now; save the remaining signal.";
    }
    if (state.privacy < 50)
      return "Privacy low. Keep clear of the red tracker rings.";
    if (state.playerZ > -340 && state.playerZ < -200)
      return "Split ahead. Left preserves privacy; right grants speed at a cost.";
    const tracker = nodes.find(
      (node) =>
        node.type === "tracker" &&
        node.z < state.playerZ &&
        state.playerZ - node.z < 100,
    );
    if (tracker)
      return `Tracker ${Math.round(state.playerZ - tracker.z)}m ahead. Steer clear or skim its edge.`;
    return "Channel clear. The bright hub marks your receiver.";
  }
}

export const localAdvisor: AIAdvisor = new LocalRuleAdvisor();

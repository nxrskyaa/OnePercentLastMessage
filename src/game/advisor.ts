import type { GameNode } from "@/game/nodes";
import type { Language } from "@/store/settingsStore";
import { GAME_CONFIG } from "./config";

export interface AdvisorState {
  battery: number;
  privacy: number;
  distance: number;
  playerZ: number;
}
export interface AIAdvisor {
  recommend(
    state: AdvisorState,
    nodes: GameNode[],
    language?: Language,
  ): string;
}

export class LocalRuleAdvisor implements AIAdvisor {
  recommend(
    state: AdvisorState,
    nodes: GameNode[],
    language: Language = "en",
  ): string {
    const id = language === "id";
    if (state.battery < 0.18) {
      const booster = nodes.find(
        (node) =>
          node.type === "booster" &&
          node.z < state.playerZ &&
          state.playerZ - node.z < 130,
      );
      if (booster)
        return id
          ? `Baterai kritis. Booster di ${booster.x < 0 ? "kiri" : "kanan"}, ${Math.round(state.playerZ - booster.z)}m lagi.`
          : `Battery critical. Booster ${booster.x < 0 ? "left" : "right"}, ${Math.round(state.playerZ - booster.z)}m ahead.`;
      if (state.distance < 120)
        return id
          ? "Penerima dekat. Percepat sekarang; jaga sisa sinyal."
          : "Receiver close. Accelerate now; save the remaining signal.";
    }
    if (state.privacy < 50)
      return id
        ? "Privasi rendah. Hindari cincin pelacak merah."
        : "Privacy low. Keep clear of the red tracker rings.";
    if (
      state.playerZ > GAME_CONFIG.course.splitEnd &&
      state.playerZ < GAME_CONFIG.course.splitStart
    )
      return id
        ? "Persimpangan di depan. Kiri menjaga privasi; kanan lebih cepat dengan risiko."
        : "Split ahead. Left preserves privacy; right grants speed at a cost.";
    const curtain = nodes.find(
      (node) =>
        (node.type === "curtain" ||
          node.type === "shutter" ||
          node.type === "rotor") &&
        node.z < state.playerZ &&
        state.playerZ - node.z < 115,
    );
    if (curtain)
      return id
        ? curtain.type === "rotor"
          ? "Rotor di depan. Lewati ruang di antara bilah."
          : `Gerbang ${Math.round(state.playerZ - curtain.z)}m di depan. Q/E untuk naik/turun ke celah terang.`
        : curtain.type === "rotor"
          ? "Rotor ahead. Fly between the blades."
          : `Gate ${Math.round(state.playerZ - curtain.z)}m ahead. Q/E to climb/dive into the bright aperture.`;
    const tracker = nodes.find(
      (node) =>
        node.type === "tracker" &&
        node.z < state.playerZ &&
        state.playerZ - node.z < 100,
    );
    if (tracker)
      return id
        ? `Pelacak ${Math.round(state.playerZ - tracker.z)}m di depan. Hindari atau lewati tepinya.`
        : `Tracker ${Math.round(state.playerZ - tracker.z)}m ahead. Steer clear or skim its edge.`;
    return id
      ? "Jalur aman. Hub terang menandai penerima."
      : "Channel clear. The bright hub marks your receiver.";
  }
}

export const localAdvisor: AIAdvisor = new LocalRuleAdvisor();

import { create } from "zustand";
import { GAME_CONFIG } from "@/game/config";

export type GamePhase = "menu" | "playing" | "paused" | "success" | "failed";

interface GameState {
  phase: GamePhase;
  runId: number;
  battery: number;
  elapsed: number;
  distance: number;
  speed: number;
  boosting: boolean;
  bestTime: number | null;
  startRun: () => void;
  sample: (
    battery: number,
    elapsed: number,
    distance: number,
    speed: number,
    boosting: boolean,
  ) => void;
  pause: () => void;
  resume: () => void;
  finish: (elapsed: number, battery: number) => void;
  fail: (elapsed: number) => void;
  loadBestTime: () => void;
}

const BEST_TIME_KEY = "last-message.best-time";

export const useGameStore = create<GameState>((set, get) => ({
  phase: "menu",
  runId: 0,
  battery: GAME_CONFIG.battery.start,
  elapsed: 0,
  distance: Math.abs(GAME_CONFIG.destination.z),
  speed: GAME_CONFIG.movement.cruiseSpeed,
  boosting: false,
  bestTime: null,
  startRun: () =>
    set((state) => ({
      phase: "playing",
      runId: state.runId + 1,
      battery: GAME_CONFIG.battery.start,
      elapsed: 0,
      distance: Math.abs(GAME_CONFIG.destination.z),
      speed: GAME_CONFIG.movement.cruiseSpeed,
      boosting: false,
    })),
  sample: (battery, elapsed, distance, speed, boosting) =>
    set({ battery, elapsed, distance, speed, boosting }),
  pause: () => {
    if (get().phase === "playing") set({ phase: "paused", boosting: false });
  },
  resume: () => {
    if (get().phase === "paused") set({ phase: "playing" });
  },
  finish: (elapsed, battery) => {
    if (get().phase !== "playing") return;
    const bestTime = get().bestTime;
    const nextBest = bestTime === null ? elapsed : Math.min(bestTime, elapsed);
    set({
      phase: "success",
      elapsed,
      battery,
      distance: 0,
      boosting: false,
      bestTime: nextBest,
    });
    try {
      window.localStorage.setItem(BEST_TIME_KEY, String(nextBest));
    } catch {
      // Storage may be blocked; the run still completes.
    }
  },
  fail: (elapsed) => {
    if (get().phase === "playing")
      set({ phase: "failed", elapsed, battery: 0, boosting: false });
  },
  loadBestTime: () => {
    try {
      const raw = window.localStorage.getItem(BEST_TIME_KEY);
      const value = raw === null ? NaN : Number(raw);
      if (Number.isFinite(value) && value > 0) set({ bestTime: value });
    } catch {
      // Local storage is optional.
    }
  },
}));

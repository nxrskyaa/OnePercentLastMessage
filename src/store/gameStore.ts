import { create } from "zustand";
import { GAME_CONFIG } from "@/game/config";
import { MISSIONS, nextMissionIndex } from "@/game/missions";
import { awardsFor, finalScore } from "@/game/scoring";
import { STAGES } from "@/game/stages";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore } from "@/store/settingsStore";

export type GamePhase =
  | "loading"
  | "ident"
  | "title"
  | "menu"
  | "profile"
  | "briefing"
  | "tutorial"
  | "countdown"
  | "playing"
  | "paused"
  | "success"
  | "failed";
export type MenuPanel = "none" | "how" | "settings" | "about" | "profile";
export type GameEvent =
  | "perfect"
  | "nearMiss"
  | "tracker"
  | "booster"
  | "tip"
  | "public"
  | "safe"
  | "curtainHit"
  | "curtainClear";
export interface Feedback {
  id: number;
  title: string;
  detail: string;
  tone: "cyan" | "red" | "gold";
}

interface HudSample {
  battery: number;
  privacy: number;
  elapsed: number;
  distance: number;
  speed: number;
  boosting: boolean;
  scanCooldown: number;
  altitude?: number;
}

interface GameState extends HudSample {
  phase: GamePhase;
  panel: MenuPanel;
  runId: number;
  missionIndex: number;
  stageIndex: number;
  hasSeenIntro: boolean;
  tutorialCompleted: boolean;
  tutorialReturn: "menu" | "countdown";
  eventScore: number;
  score: number;
  perfectRelays: number;
  nearMisses: number;
  trackerHits: number;
  boostersUsed: number;
  tipsCollected: number;
  maxTipCombo: number;
  route: "unselected" | "secure" | "public";
  feedback: Feedback | null;
  advisor: { id: number; text: string } | null;
  scanPulse: number;
  damagePulse: number;
  awards: string[];
  newBest: boolean;
  bestTime: number | null;
  bestScore: number;
  bestPrivacy: number;
  completedRuns: number;
  totalRuns: number;
  bootReady: () => void;
  setPhase: (phase: GamePhase) => void;
  openPanel: (panel: MenuPanel) => void;
  closePanel: () => void;
  finishIntro: () => void;
  openBriefing: (newMission?: boolean) => void;
  selectStage: (index: number) => void;
  completeProfile: () => void;
  openTutorial: (returnTo: "menu" | "countdown") => void;
  completeTutorial: () => void;
  beginCountdown: () => void;
  startRun: () => void;
  retry: () => void;
  goMenu: () => void;
  sample: (sample: HudSample) => void;
  pause: () => void;
  resume: () => void;
  recordEvent: (event: GameEvent, combo?: number) => void;
  setAdvisor: (text: string) => void;
  triggerScan: () => void;
  finish: (elapsed: number, battery: number, privacy: number) => void;
  fail: (elapsed: number, distance: number, privacy: number) => void;
}

const PROFILE_KEY = "last-message.profile.v1";
const INTRO_KEY = "last-message.hasSeenIntro";
const TUTORIAL_KEY = "last-message.tutorialCompleted";
const OLD_BEST_KEY = "last-message.best-time";

interface Profile {
  version: 1;
  bestTime: number | null;
  bestScore: number;
  bestPrivacy: number;
  completedRuns: number;
  totalRuns: number;
  stageIndex: number;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function readProfile(): Profile {
  const empty: Profile = {
    version: 1,
    bestTime: null,
    bestScore: 0,
    bestPrivacy: 0,
    completedRuns: 0,
    totalRuns: 0,
    stageIndex: 0,
  };
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const legacy = Number(window.localStorage.getItem(OLD_BEST_KEY));
      return {
        ...empty,
        bestTime: legacy > 0 && Number.isFinite(legacy) ? legacy : null,
      };
    }
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== "object" ||
      (data as Record<string, unknown>).version !== 1
    )
      return empty;
    const record = data as Record<string, unknown>;
    return {
      version: 1,
      bestTime:
        typeof record.bestTime === "number" && record.bestTime > 0
          ? record.bestTime
          : null,
      bestScore: numberOr(record.bestScore, 0),
      bestPrivacy: numberOr(record.bestPrivacy, 0),
      completedRuns: numberOr(record.completedRuns, 0),
      totalRuns: numberOr(record.totalRuns, 0),
      stageIndex: Math.max(
        0,
        Math.min(STAGES.length - 1, Math.floor(numberOr(record.stageIndex, 0))),
      ),
    };
  } catch {
    return empty;
  }
}

function saveProfile(state: GameState): void {
  const profile: Profile = {
    version: 1,
    bestTime: state.bestTime,
    bestScore: state.bestScore,
    bestPrivacy: state.bestPrivacy,
    completedRuns: state.completedRuns,
    totalRuns: state.totalRuns,
    stageIndex: state.stageIndex,
  };
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* Storage is optional. */
  }
}

function feedbackFor(
  event: GameEvent,
  combo: number,
): { title: string; detail: string; tone: Feedback["tone"]; points: number } {
  const id = useSettingsStore.getState().language === "id";
  switch (event) {
    case "perfect":
      return {
        title: id ? "RELAY SEMPURNA" : "PERFECT RELAY",
        detail: id ? "+300 · DORONGAN KECEPATAN" : "+300 · SPEED BURST",
        tone: "cyan",
        points: 300,
      };
    case "nearMiss":
      return {
        title: id ? "NYARIS KENA" : "NEAR MISS",
        detail: "+450",
        tone: "gold",
        points: 450,
      };
    case "tracker":
      return {
        title: id ? "PRIVASI BOCOR" : "PRIVACY BREACH",
        detail: `-${GAME_CONFIG.nodes.trackerPrivacyDamage}% ${id ? "PRIVASI" : "PRIVACY"} · -${GAME_CONFIG.nodes.trackerBatteryDamage.toFixed(2)}% ${id ? "BATERAI" : "BATTERY"}`,
        tone: "red",
        points: -300,
      };
    case "booster":
      return {
        title: id ? "PENGUAT SINYAL" : "SIGNAL BOOST",
        detail: `+${GAME_CONFIG.nodes.boosterCharge.toFixed(2)}% ${id ? "BATERAI" : "BATTERY"}`,
        tone: "cyan",
        points: 150,
      };
    case "tip":
      return {
        title:
          combo > 1
            ? `${id ? "TIP KOMBO" : "TIP COMBO"} ×${combo}`
            : id
              ? "TIP DIDAPAT"
              : "TIP CAPTURED",
        detail: `+${250 * combo}`,
        tone: "gold",
        points: 250 * combo,
      };
    case "public":
      return {
        title: id ? "RELAY PUBLIK" : "PUBLIC RELAY",
        detail: `${id ? "JALUR CEPAT" : "FAST ROUTE"} · -${GAME_CONFIG.nodes.publicPrivacyDamage}% ${id ? "PRIVASI" : "PRIVACY"}`,
        tone: "gold",
        points: 200,
      };
    case "safe":
      return {
        title: id ? "JALUR AMAN" : "SECURE ROUTE",
        detail: id ? "PRIVASI TERJAGA" : "PRIVACY PRESERVED",
        tone: "cyan",
        points: 100,
      };
    case "curtainHit":
      return {
        title: id ? "TERJERAT PEMINDAI" : "SCANNER CAUGHT YOU",
        detail: `-${GAME_CONFIG.obstacles.damagePrivacy}% ${id ? "PRIVASI" : "PRIVACY"} · -${GAME_CONFIG.obstacles.damageBattery.toFixed(3)}% ${id ? "BATERAI" : "BATTERY"}`,
        tone: "red",
        points: -200,
      };
    case "curtainClear":
      return {
        title: id ? "CELAH DITEMBUS" : "THREAD THE GAP",
        detail: "+350",
        tone: "cyan",
        points: 350,
      };
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "loading",
  panel: "none",
  runId: 0,
  missionIndex: 0,
  stageIndex: 0,
  hasSeenIntro: false,
  tutorialCompleted: false,
  tutorialReturn: "countdown",
  battery: GAME_CONFIG.battery.start,
  privacy: 100,
  elapsed: 0,
  distance: Math.abs(GAME_CONFIG.destination.z),
  speed: GAME_CONFIG.movement.cruiseSpeed,
  boosting: false,
  scanCooldown: 0,
  altitude: 0,
  eventScore: 0,
  score: 0,
  perfectRelays: 0,
  nearMisses: 0,
  trackerHits: 0,
  boostersUsed: 0,
  tipsCollected: 0,
  maxTipCombo: 0,
  route: "unselected",
  feedback: null,
  advisor: null,
  scanPulse: 0,
  damagePulse: 0,
  awards: [],
  newBest: false,
  bestTime: null,
  bestScore: 0,
  bestPrivacy: 0,
  completedRuns: 0,
  totalRuns: 0,
  bootReady: () => {
    const profile = readProfile();
    usePlayerProfileStore.getState().hydrate();
    const hasIdentity = usePlayerProfileStore.getState().complete;
    let hasSeenIntro = false;
    let tutorialCompleted = false;
    try {
      hasSeenIntro = window.localStorage.getItem(INTRO_KEY) === "1";
      tutorialCompleted = window.localStorage.getItem(TUTORIAL_KEY) === "1";
    } catch {
      /* First visit defaults. */
    }
    set({
      ...profile,
      hasSeenIntro,
      tutorialCompleted,
      phase: hasSeenIntro ? (hasIdentity ? "menu" : "profile") : "ident",
    });
  },
  setPhase: (phase) => set({ phase }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: "none" }),
  finishIntro: () => {
    try {
      window.localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* Optional persistence. */
    }
    set({
      hasSeenIntro: true,
      phase: usePlayerProfileStore.getState().complete ? "menu" : "profile",
    });
  },
  completeProfile: () => set({ phase: "menu", panel: "none" }),
  selectStage: (index) => {
    set({ stageIndex: Math.max(0, Math.min(STAGES.length - 1, index)) });
    saveProfile(get());
  },
  openBriefing: (newMission = true) => {
    set((state) => ({
      phase: "briefing",
      panel: "none",
      missionIndex: newMission
        ? nextMissionIndex(state.missionIndex)
        : state.missionIndex,
      stageIndex:
        newMission && (state.phase === "success" || state.phase === "failed")
          ? (state.stageIndex + 1) % STAGES.length
          : state.stageIndex,
      feedback: null,
    }));
    saveProfile(get());
  },
  openTutorial: (tutorialReturn) => set({ phase: "tutorial", tutorialReturn }),
  completeTutorial: () => {
    try {
      window.localStorage.setItem(TUTORIAL_KEY, "1");
    } catch {
      /* Optional persistence. */
    }
    set((state) => ({ tutorialCompleted: true, phase: state.tutorialReturn }));
  },
  beginCountdown: () => set({ phase: "countdown" }),
  startRun: () => {
    set((state) => ({
      phase: "playing",
      panel: "none",
      runId: state.runId + 1,
      battery: GAME_CONFIG.battery.start,
      privacy: 100,
      elapsed: 0,
      distance: Math.abs(GAME_CONFIG.destination.z),
      speed: GAME_CONFIG.movement.cruiseSpeed,
      boosting: false,
      scanCooldown: 0,
      altitude: 0,
      eventScore: 0,
      score: 0,
      perfectRelays: 0,
      nearMisses: 0,
      trackerHits: 0,
      boostersUsed: 0,
      tipsCollected: 0,
      maxTipCombo: 0,
      route: "unselected",
      feedback: null,
      advisor: null,
      awards: [],
      newBest: false,
      totalRuns: state.totalRuns + 1,
    }));
    saveProfile(get());
  },
  retry: () => set({ phase: "countdown", feedback: null }),
  goMenu: () =>
    set((state) => ({
      phase: "menu",
      panel: "none",
      runId: state.runId + 1,
      feedback: null,
      advisor: null,
    })),
  sample: (sample) => set(sample),
  pause: () => {
    if (get().phase === "playing") set({ phase: "paused", boosting: false });
  },
  resume: () => {
    if (get().phase === "paused") set({ phase: "playing" });
  },
  recordEvent: (event, combo = 1) =>
    set((state) => {
      const update = feedbackFor(event, combo);
      return {
        eventScore: state.eventScore + update.points,
        feedback: {
          id: (state.feedback?.id ?? 0) + 1,
          title: update.title,
          detail: update.detail,
          tone: update.tone,
        },
        perfectRelays: state.perfectRelays + Number(event === "perfect"),
        nearMisses: state.nearMisses + Number(event === "nearMiss"),
        trackerHits:
          state.trackerHits +
          Number(event === "tracker" || event === "curtainHit"),
        boostersUsed: state.boostersUsed + Number(event === "booster"),
        tipsCollected: state.tipsCollected + Number(event === "tip"),
        maxTipCombo:
          event === "tip"
            ? Math.max(state.maxTipCombo, combo)
            : state.maxTipCombo,
        damagePulse:
          event === "tracker" || event === "curtainHit"
            ? state.damagePulse + 1
            : state.damagePulse,
        route:
          event === "public"
            ? "public"
            : event === "safe"
              ? "secure"
              : state.route,
      };
    }),
  setAdvisor: (text) =>
    set((state) => ({ advisor: { id: (state.advisor?.id ?? 0) + 1, text } })),
  triggerScan: () => set((state) => ({ scanPulse: state.scanPulse + 1 })),
  finish: (elapsed, battery, privacy) => {
    if (get().phase !== "playing") return;
    const state = get();
    const input = {
      success: true,
      distance: 0,
      elapsed,
      battery,
      privacy,
      eventScore: state.eventScore,
      trackerHits: state.trackerHits,
      perfectRelays: state.perfectRelays,
    };
    const score = finalScore(input);
    const newBest = score > state.bestScore;
    set({
      phase: "success",
      elapsed,
      battery,
      privacy,
      distance: 0,
      boosting: false,
      score,
      awards: awardsFor(input),
      newBest,
      bestScore: Math.max(state.bestScore, score),
      bestTime:
        state.bestTime === null ? elapsed : Math.min(state.bestTime, elapsed),
      bestPrivacy: Math.max(state.bestPrivacy, privacy),
      completedRuns: state.completedRuns + 1,
    });
    saveProfile(get());
  },
  fail: (elapsed, distance, privacy) => {
    if (get().phase !== "playing") return;
    const state = get();
    const score = finalScore({
      success: false,
      distance,
      elapsed,
      battery: 0,
      privacy,
      eventScore: state.eventScore,
      trackerHits: state.trackerHits,
      perfectRelays: state.perfectRelays,
    });
    set({
      phase: "failed",
      elapsed,
      battery: 0,
      privacy,
      distance,
      boosting: false,
      score,
      awards: [],
      newBest: false,
    });
  },
}));

export function currentMission() {
  return MISSIONS[useGameStore.getState().missionIndex];
}

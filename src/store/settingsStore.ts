import { create } from "zustand";

export type Quality = "auto" | "low" | "medium" | "high";

export interface GameSettings {
  version: 1;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mute: boolean;
  cameraShake: boolean;
  screenEffects: boolean;
  bloom: boolean;
  reducedMotion: boolean;
  mouseSensitivity: number;
  quality: Quality;
}

const KEY = "last-message.settings.v1";
export const DEFAULT_SETTINGS: GameSettings = {
  version: 1,
  masterVolume: 0.72,
  musicVolume: 0.38,
  sfxVolume: 0.68,
  mute: false,
  cameraShake: true,
  screenEffects: true,
  bloom: true,
  reducedMotion: false,
  mouseSensitivity: 0.35,
  quality: "auto",
};

function clamp(value: unknown, fallback: number, min = 0, max = 1): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function validate(input: unknown): GameSettings {
  if (!input || typeof input !== "object") return DEFAULT_SETTINGS;
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) return DEFAULT_SETTINGS;
  const quality: Quality = ["auto", "low", "medium", "high"].includes(
    String(raw.quality),
  )
    ? (raw.quality as Quality)
    : DEFAULT_SETTINGS.quality;
  return {
    version: 1,
    masterVolume: clamp(raw.masterVolume, DEFAULT_SETTINGS.masterVolume),
    musicVolume: clamp(raw.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clamp(raw.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    mute: typeof raw.mute === "boolean" ? raw.mute : DEFAULT_SETTINGS.mute,
    cameraShake:
      typeof raw.cameraShake === "boolean"
        ? raw.cameraShake
        : DEFAULT_SETTINGS.cameraShake,
    screenEffects:
      typeof raw.screenEffects === "boolean"
        ? raw.screenEffects
        : DEFAULT_SETTINGS.screenEffects,
    bloom: typeof raw.bloom === "boolean" ? raw.bloom : DEFAULT_SETTINGS.bloom,
    reducedMotion:
      typeof raw.reducedMotion === "boolean"
        ? raw.reducedMotion
        : DEFAULT_SETTINGS.reducedMotion,
    mouseSensitivity: clamp(
      raw.mouseSensitivity,
      DEFAULT_SETTINGS.mouseSensitivity,
      0,
      1,
    ),
    quality,
  };
}

interface SettingsState extends GameSettings {
  hydrated: boolean;
  runtimeQuality: "low" | "medium" | "high";
  hydrate: () => void;
  update: (patch: Partial<Omit<GameSettings, "version">>) => void;
  setRuntimeQuality: (quality: "low" | "medium" | "high") => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  runtimeQuality: "medium",
  hydrate: () => {
    let settings = DEFAULT_SETTINGS;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) settings = validate(JSON.parse(raw));
    } catch {
      // A blocked or malformed store is equivalent to first launch.
    }
    set({
      ...settings,
      hydrated: true,
      runtimeQuality:
        settings.quality === "auto"
          ? window.matchMedia("(max-width: 900px)").matches
            ? "low"
            : "medium"
          : settings.quality,
    });
  },
  update: (patch) => {
    const current = get();
    const settings = validate({ ...current, ...patch, version: 1 });
    set({
      ...settings,
      runtimeQuality:
        settings.quality === "auto"
          ? window.matchMedia("(max-width: 900px)").matches
            ? "low"
            : "medium"
          : settings.quality,
    });
    try {
      window.localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // Settings still work for this session.
    }
  },
  setRuntimeQuality: (runtimeQuality) => set({ runtimeQuality }),
}));

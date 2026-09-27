import { create } from "zustand";

export interface PlayerIdentity {
  name: string;
  xHandle: string;
  avatarUrl: string;
}

interface PlayerProfileState extends PlayerIdentity {
  hydrated: boolean;
  complete: boolean;
  hydrate: () => void;
  save: (identity: PlayerIdentity) => void;
}

const KEY = "last-message.player-identity.v1";

export function normalizeIdentity(input: PlayerIdentity): PlayerIdentity {
  const name = input.name.trim().replace(/\s+/g, " ").slice(0, 28);
  const handle = input.xHandle.trim().replace(/^@/, "").slice(0, 15);
  let avatarUrl = input.avatarUrl.trim().slice(0, 2048);
  try {
    if (avatarUrl && new URL(avatarUrl).protocol !== "https:") avatarUrl = "";
  } catch {
    avatarUrl = "";
  }
  return {
    name,
    xHandle: /^[a-zA-Z0-9_]{1,15}$/.test(handle) ? handle : "",
    avatarUrl,
  };
}

export const usePlayerProfileStore = create<PlayerProfileState>((set) => ({
  name: "",
  xHandle: "",
  avatarUrl: "",
  hydrated: false,
  complete: false,
  hydrate: () => {
    let identity = { name: "", xHandle: "", avatarUrl: "" };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (value && typeof value === "object") {
          const record = value as Record<string, unknown>;
          identity = normalizeIdentity({
            name: typeof record.name === "string" ? record.name : "",
            xHandle: typeof record.xHandle === "string" ? record.xHandle : "",
            avatarUrl:
              typeof record.avatarUrl === "string" ? record.avatarUrl : "",
          });
        }
      }
    } catch {
      // The player can still create a profile for this session.
    }
    set({ ...identity, complete: identity.name.length >= 2, hydrated: true });
  },
  save: (input) => {
    const identity = normalizeIdentity(input);
    set({ ...identity, complete: identity.name.length >= 2 });
    try {
      window.localStorage.setItem(KEY, JSON.stringify(identity));
    } catch {
      // Session profile remains available when storage is blocked.
    }
  },
}));

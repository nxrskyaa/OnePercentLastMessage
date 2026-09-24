import type { GamePhase } from "@/store/gameStore";
import type { GameSettings } from "@/store/settingsStore";

type Sound =
  | "click"
  | "hover"
  | "start"
  | "scan"
  | "relay"
  | "tip"
  | "boost"
  | "hit"
  | "success"
  | "fail"
  | "warning";

let context: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
let sfx: GainNode | null = null;
let drones: OscillatorNode[] = [];
let settings: Pick<
  GameSettings,
  "masterVolume" | "musicVolume" | "sfxVolume" | "mute"
> = {
  masterVolume: 0.72,
  musicVolume: 0.38,
  sfxVolume: 0.68,
  mute: false,
};

function ensureAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (context) {
      if (context.state === "suspended") void context.resume();
      return context;
    }
    context = new AudioContext();
    master = context.createGain();
    music = context.createGain();
    sfx = context.createGain();
    music.connect(master);
    sfx.connect(master);
    master.connect(context.destination);
    const low = context.createOscillator();
    const high = context.createOscillator();
    low.type = "sine";
    high.type = "triangle";
    low.frequency.value = 55;
    high.frequency.value = 82.4;
    const lowGain = context.createGain();
    const highGain = context.createGain();
    lowGain.gain.value = 0.018;
    highGain.gain.value = 0.006;
    low.connect(lowGain).connect(music);
    high.connect(highGain).connect(music);
    low.start();
    high.start();
    drones = [low, high];
    applyVolume();
    return context;
  } catch {
    return null;
  }
}

function applyVolume() {
  if (!context || !master || !music || !sfx) return;
  const now = context.currentTime;
  master.gain.setTargetAtTime(
    settings.mute ? 0 : settings.masterVolume,
    now,
    0.06,
  );
  music.gain.setTargetAtTime(settings.musicVolume, now, 0.1);
  sfx.gain.setTargetAtTime(settings.sfxVolume, now, 0.04);
}

export function configureAudio(next: typeof settings) {
  settings = next;
  applyVolume();
}
export function unlockAudio() {
  ensureAudio();
}

export function setAudioPhase(phase: GamePhase) {
  if (!context || !music || drones.length < 2) return;
  const now = context.currentTime;
  const active = phase === "playing" || phase === "paused";
  drones[0].frequency.setTargetAtTime(active ? 62 : 55, now, 0.5);
  drones[1].frequency.setTargetAtTime(active ? 93 : 82.4, now, 0.5);
  music.gain.setTargetAtTime(
    settings.musicVolume * (phase === "playing" ? 1 : 0.62),
    now,
    0.6,
  );
}

const SOUNDS: Record<Sound, [number, number, number, OscillatorType]> = {
  click: [480, 330, 0.08, "sine"],
  hover: [260, 360, 0.04, "sine"],
  start: [130, 520, 0.34, "triangle"],
  scan: [220, 850, 0.4, "sine"],
  relay: [500, 720, 0.18, "sine"],
  tip: [660, 940, 0.16, "sine"],
  boost: [110, 240, 0.17, "sawtooth"],
  hit: [230, 75, 0.28, "sawtooth"],
  success: [410, 820, 0.6, "sine"],
  fail: [220, 60, 0.55, "triangle"],
  warning: [280, 180, 0.22, "sine"],
};

export function playSound(sound: Sound) {
  const ctx = ensureAudio();
  if (!ctx || !sfx) return;
  const [start, end, duration, type] = SOUNDS[sound];
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(30, end),
      now + duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      sound === "hit" ? 0.18 : 0.095,
      now + 0.012,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(sfx);
    osc.start(now);
    osc.stop(now + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch {
    /* Audio must never block play. */
  }
}

export function shutdownAudio() {
  if (!context) return;
  drones.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* Already stopped. */
    }
  });
  drones = [];
  void context.close();
  context = null;
  master = null;
  music = null;
  sfx = null;
}

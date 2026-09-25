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
let sfx: GainNode | null = null;
let soundtrack: HTMLAudioElement | null = null;
let currentPhase: GamePhase = "loading";
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
    sfx = context.createGain();
    sfx.connect(master);
    master.connect(context.destination);
    applyVolume();
    return context;
  } catch {
    return null;
  }
}

function applyVolume() {
  if (context && master && sfx) {
    const now = context.currentTime;
    master.gain.setTargetAtTime(
      settings.mute ? 0 : settings.masterVolume,
      now,
      0.06,
    );
    sfx.gain.setTargetAtTime(settings.sfxVolume, now, 0.04);
  }
  if (soundtrack)
    soundtrack.volume = settings.mute
      ? 0
      : settings.masterVolume *
        settings.musicVolume *
        (currentPhase === "playing"
          ? 1
          : currentPhase === "paused"
            ? 0.18
            : 0.4);
}

export function configureAudio(next: typeof settings) {
  settings = next;
  applyVolume();
}
export function unlockAudio() {
  ensureAudio();
  if (!soundtrack && typeof window !== "undefined") {
    soundtrack = new Audio("/audio/signal-run.mp3");
    soundtrack.loop = true;
    soundtrack.preload = "auto";
    soundtrack.hidden = true;
    document.body.appendChild(soundtrack);
  }
  applyVolume();
  if (soundtrack && soundtrack.paused) void soundtrack.play().catch(() => {});
}

export function setAudioPhase(phase: GamePhase) {
  // The score is started by the button gesture, so mobile autoplay rules hold.
  currentPhase = phase;
  if (soundtrack) {
    if (phase === "paused") soundtrack.pause();
    else if (soundtrack.paused)
      void soundtrack.play().catch(() => {
        /* Audio never blocks gameplay. */
      });
  }
  applyVolume();
}

export function setAudioIntensity(boosting: boolean, battery: number) {
  if (!soundtrack) return;
  const rate = boosting ? 1.065 : battery < 0.1 ? 0.94 : 1;
  if (Math.abs(soundtrack.playbackRate - rate) > 0.01)
    soundtrack.playbackRate = rate;
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
  soundtrack?.pause();
  soundtrack?.remove();
  soundtrack = null;
  if (context) void context.close();
  context = null;
  master = null;
  sfx = null;
}

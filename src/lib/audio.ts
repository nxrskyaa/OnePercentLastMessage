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
let musicSource: MediaElementAudioSourceNode | null = null;
let musicGain: GainNode | null = null;
let musicFilter: BiquadFilterNode | null = null;
let drive: {
  motor: OscillatorNode;
  air: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
} | null = null;
let unlocked = false;
let boosted = false;
let critical = false;
const MUSIC = {
  file: "/audio/afterglow-dispatch-v1.mp3",
  menuGain: 0.62,
  resultGain: 0.75,
  boostGain: 1.06,
  menuCutoff: 2400,
  flightCutoff: 10000,
  boostCutoff: 16000,
  criticalCutoff: 6500,
  fadeSeconds: 0.22,
};
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
      if (context.state === "suspended" && !document.hidden)
        void context.resume().catch(() => {});
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

/** One reusable jet layer; no new oscillators on each frame or boost press. */
function syncDrive() {
  const active =
    unlocked &&
    boosted &&
    currentPhase === "playing" &&
    !document.hidden &&
    !settings.mute &&
    settings.masterVolume > 0 &&
    settings.sfxVolume > 0;
  if (!context || !sfx) return;
  try {
    if (active && !drive) {
      const motor = context.createOscillator();
      const air = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const buffer = context.createBuffer(
        1,
        context.sampleRate,
        context.sampleRate,
      );
      const data = buffer.getChannelData(0);
      let seed = 137;
      for (let i = 0; i < data.length; i++) {
        seed = (seed * 16807) % 2147483647;
        data[i] = (seed / 2147483647 - 0.5) * 0.35;
      }
      air.buffer = buffer;
      air.loop = true;
      motor.type = "triangle";
      motor.frequency.value = 75;
      filter.type = "lowpass";
      filter.Q.value = 0.6;
      gain.gain.value = 0;
      motor.connect(filter);
      air.connect(filter);
      filter.connect(gain).connect(sfx);
      motor.start();
      air.start();
      drive = { motor, air, filter, gain };
    }
    if (drive) {
      drive.gain.gain.setTargetAtTime(
        active ? 0.12 : 0,
        context.currentTime,
        active ? 0.09 : 0.035,
      );
      drive.motor.frequency.setTargetAtTime(
        active ? 142 : 75,
        context.currentTime,
        0.18,
      );
      drive.filter.frequency.setTargetAtTime(
        active ? 2200 : 450,
        context.currentTime,
        0.18,
      );
    }
  } catch {
    // Synthesis is optional on browsers with restricted audio support.
  }
}

function applyVolume() {
  syncDrive();
  if (context && master && sfx) {
    const now = context.currentTime;
    master.gain.setTargetAtTime(
      settings.mute ? 0 : settings.masterVolume,
      now,
      0.06,
    );
    sfx.gain.setTargetAtTime(settings.sfxVolume, now, 0.04);
  }
  if (!soundtrack) return;
  const playing = currentPhase === "playing";
  const result = currentPhase === "success" || currentPhase === "failed";
  const level = playing
    ? boosted
      ? MUSIC.boostGain
      : 1
    : result
      ? MUSIC.resultGain
      : MUSIC.menuGain;
  soundtrack.muted = settings.mute;
  if (context && musicGain && musicFilter) {
    musicGain.gain.setTargetAtTime(
      settings.musicVolume * level,
      context.currentTime,
      MUSIC.fadeSeconds,
    );
    const cutoff = playing
      ? boosted
        ? MUSIC.boostCutoff
        : critical
          ? MUSIC.criticalCutoff
          : MUSIC.flightCutoff
      : MUSIC.menuCutoff;
    musicFilter.frequency.setTargetAtTime(
      cutoff,
      context.currentTime,
      MUSIC.fadeSeconds,
    );
  } else {
    // Keep the score usable if this browser cannot attach a media source.
    soundtrack.volume = Math.min(
      1,
      settings.masterVolume * settings.musicVolume * level,
    );
  }
}

function musicAllowed() {
  return (
    unlocked &&
    currentPhase !== "paused" &&
    !document.hidden &&
    !settings.mute &&
    settings.masterVolume > 0 &&
    settings.musicVolume > 0
  );
}

function syncMusic() {
  const media = soundtrack;
  if (!media) return;
  if (!musicAllowed()) media.pause();
  else if (media.paused) {
    void media
      .play()
      .then(() => {
        // A pause/mute/tab switch can occur before the play promise settles.
        if (media !== soundtrack || !musicAllowed()) media.pause();
      })
      .catch(() => {
        /* Gesture retry remains available; gameplay never waits. */
      });
  }
}

function onAudioVisibility() {
  if (!document.hidden && context?.state === "suspended")
    void context.resume().catch(() => {});
  syncDrive();
  syncMusic();
}

export function configureAudio(next: typeof settings) {
  settings = next;
  applyVolume();
  syncMusic();
}
export function unlockAudio() {
  const ctx = ensureAudio();
  unlocked = true;
  if (!soundtrack && typeof window !== "undefined") {
    try {
      soundtrack = new Audio(MUSIC.file);
      soundtrack.loop = true;
      soundtrack.preload = "auto";
      soundtrack.hidden = true;
      soundtrack.setAttribute("aria-hidden", "true");
      document.body.appendChild(soundtrack);
      document.addEventListener("visibilitychange", onAudioVisibility);
      if (ctx && master) {
        try {
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          const source = ctx.createMediaElementSource(soundtrack);
          musicFilter = filter;
          musicGain = gain;
          musicSource = source;
          filter.type = "lowpass";
          filter.Q.value = 0.5;
          filter.frequency.value = MUSIC.menuCutoff;
          gain.gain.value = 0;
          source.connect(filter).connect(gain).connect(master);
        } catch {
          /* Direct HTML audio remains the lightweight fallback. */
        }
      }
    } catch {
      /* Missing audio support must not stop the game. */
    }
  }
  applyVolume();
  syncMusic();
}

export function setAudioPhase(phase: GamePhase) {
  // The score is started by the button gesture, so mobile autoplay rules hold.
  currentPhase = phase;
  if (phase !== "playing") {
    boosted = false;
    critical = false;
  }
  applyVolume();
  syncMusic();
}

export function setAudioIntensity(boosting: boolean, battery: number) {
  const nextCritical = battery < 0.1;
  if (boosted === boosting && critical === nextCritical) return;
  boosted = boosting;
  critical = nextCritical;
  applyVolume();
}

const SOUNDS: Record<Sound, [number, number, number, OscillatorType]> = {
  click: [480, 330, 0.08, "sine"],
  hover: [260, 360, 0.04, "sine"],
  start: [130, 520, 0.34, "triangle"],
  scan: [220, 850, 0.4, "sine"],
  relay: [500, 720, 0.18, "sine"],
  tip: [660, 940, 0.16, "sine"],
  boost: [75, 310, 0.36, "triangle"],
  hit: [230, 75, 0.28, "sawtooth"],
  success: [410, 820, 0.6, "sine"],
  fail: [220, 60, 0.55, "triangle"],
  warning: [280, 180, 0.22, "sine"],
};

export function playSound(sound: Sound) {
  if (typeof document === "undefined" || document.hidden || settings.mute)
    return;
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
  if (drive) {
    drive.motor.stop();
    drive.air.stop();
    drive.motor.disconnect();
    drive.air.disconnect();
    drive.filter.disconnect();
    drive.gain.disconnect();
    drive = null;
  }
  soundtrack?.pause();
  soundtrack?.removeAttribute("src");
  soundtrack?.load();
  soundtrack?.remove();
  soundtrack = null;
  musicSource?.disconnect();
  musicFilter?.disconnect();
  musicGain?.disconnect();
  if (typeof document !== "undefined")
    document.removeEventListener("visibilitychange", onAudioVisibility);
  if (context) void context.close().catch(() => {});
  context = null;
  master = null;
  sfx = null;
  musicSource = null;
  musicFilter = null;
  musicGain = null;
  unlocked = false;
  boosted = false;
  critical = false;
}

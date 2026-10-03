// Verify audio lifecycle races with an isolated browser/audio harness.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync("src/lib/audio.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const listeners = new Map();
const media = [];
const contexts = [];
let rejectSource = false;
let rejectPlay = false;
class Param {
  value = 0;
  setTargetAtTime(value) {
    this.value = value;
  }
}
class Node {
  gain = new Param();
  frequency = new Param();
  Q = new Param();
  disconnected = false;
  connect(node) {
    return node;
  }
  disconnect() {
    this.disconnected = true;
  }
}
class Context {
  state = "running";
  currentTime = 0;
  sampleRate = 48000;
  engines = [];
  destination = new Node();
  nodes = [];
  sources = 0;
  constructor() {
    contexts.push(this);
  }
  createOscillator() {
    const node = new Node();
    node.start = () => {
      node.started = true;
    };
    node.stop = () => {
      node.stopped = true;
    };
    this.engines.push(node);
    return node;
  }
  createBufferSource() {
    return this.createOscillator();
  }
  createBuffer(_, size) {
    return { getChannelData: () => new Float32Array(size) };
  }
  createGain() {
    const node = new Node();
    this.nodes.push(node);
    return node;
  }
  createBiquadFilter() {
    const node = new Node();
    if (!this.filter) this.filter = node;
    return node;
  }
  createMediaElementSource() {
    if (rejectSource) throw new Error("Unsupported source");
    this.sources++;
    return new Node();
  }
  async resume() {
    this.state = "running";
  }
  async close() {
    this.state = "closed";
  }
}
class Media {
  paused = true;
  volume = 1;
  playbackRate = 1;
  constructor(src) {
    this.src = src;
    media.push(this);
  }
  setAttribute() {}
  removeAttribute() {
    this.src = "";
  }
  load() {}
  remove() {
    this.removed = true;
  }
  pause() {
    this.paused = true;
  }
  async play() {
    if (rejectPlay) throw new Error("Autoplay denied");
    this.paused = false;
  }
}
const document = {
  hidden: false,
  body: { appendChild() {} },
  addEventListener(name, listener) {
    listeners.set(name, listener);
  },
  removeEventListener(name) {
    listeners.delete(name);
  },
};
const scope = {
  exports: {},
  window: {},
  document,
  Audio: Media,
  AudioContext: Context,
};
vm.runInNewContext(compiled, scope);
const audio = scope.exports;
const settings = {
  masterVolume: 0.72,
  musicVolume: 0.38,
  sfxVolume: 0.68,
  mute: false,
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

audio.configureAudio(settings);
audio.setAudioPhase("menu");
assert.equal(media.length, 0, "No autoplay or downloads before a gesture");
audio.unlockAudio();
await settle();
assert.equal(media[0].paused, false);
assert.equal(media[0].loop, true);
assert.match(media[0].src, /afterglow-dispatch-v1/);
audio.unlockAudio();
assert.equal(media.length, 1, "Repeated gestures reuse one stream");
assert.equal(contexts[0].sources, 1);
audio.setAudioPhase("playing");
assert.equal(contexts[0].filter.frequency.value, 10000);
audio.setAudioIntensity(true, 0.7);
assert.equal(contexts[0].engines.length, 2, "Motor and air start on boost");
const driveGain = contexts[0].nodes.at(-1);
assert.equal(driveGain.gain.value, 0.12, "Nitro has a sustained audible layer");
audio.setAudioIntensity(false, 0.7);
assert.equal(driveGain.gain.value, 0, "Release fades nitro");
audio.setAudioIntensity(true, 0.7);
assert.equal(
  contexts[0].engines.length,
  2,
  "Repeated boost reuses the same engine",
);
assert.equal(media[0].playbackRate, 1, "Boost preserves musical tempo");
document.hidden = true;
listeners.get("visibilitychange")();
assert.equal(driveGain.gain.value, 0, "Hidden tab silences sustained nitro");
document.hidden = false;
listeners.get("visibilitychange")();
assert.equal(driveGain.gain.value, 0.12);
audio.configureAudio({ ...settings, mute: true });
assert.equal(
  driveGain.gain.value,
  0,
  "Mute silences nitro independently of music",
);
audio.configureAudio(settings);
audio.configureAudio({ ...settings, sfxVolume: 0 });
assert.equal(driveGain.gain.value, 0, "SFX slider silences nitro");
audio.configureAudio(settings);
audio.setAudioIntensity(false, 0.08);
assert.equal(contexts[0].filter.frequency.value, 6500);
audio.setAudioPhase("paused");
assert.equal(driveGain.gain.value, 0, "Pause silences nitro");
audio.unlockAudio();
await settle();
assert.equal(
  media[0].paused,
  true,
  "Clicking paused settings must not restart music",
);
audio.setAudioPhase("playing");
await settle();
assert.equal(media[0].paused, false);
audio.configureAudio({ ...settings, mute: true });
assert.equal(media[0].muted, true);
assert.equal(media[0].paused, true);
audio.configureAudio(settings);
await settle();
assert.equal(media[0].paused, false);
audio.configureAudio({ ...settings, musicVolume: 0 });
assert.equal(media[0].paused, true);
audio.configureAudio(settings);
// Race: play() resolves after a pause was requested.
audio.setAudioPhase("paused");
await settle();
assert.equal(media[0].paused, true);
audio.setAudioPhase("menu");
await settle();
document.hidden = true;
listeners.get("visibilitychange")();
assert.equal(media[0].paused, true, "Hidden menus stop playback too");
document.hidden = false;
listeners.get("visibilitychange")();
await settle();
assert.equal(media[0].paused, false);
audio.shutdownAudio();
await settle();
assert.equal(contexts[0].state, "closed");
assert.equal(media[0].removed, true);
assert.equal(media[0].src, "");
assert.equal(listeners.size, 0);
assert(
  contexts[0].engines.every((n) => n.stopped && n.disconnected),
  "Engine sources are cleaned up",
);

// Failed source attachment must still allow direct media volume, at max boost.
rejectSource = true;
audio.configureAudio({ ...settings, masterVolume: 1, musicVolume: 1 });
audio.setAudioPhase("playing");
audio.unlockAudio();
audio.setAudioIntensity(true, 1);
await settle();
assert.equal(
  media[1].volume,
  1,
  "Fallback volume never exceeds HTMLAudio range",
);
assert.equal(media[1].paused, false);
audio.shutdownAudio();
rejectPlay = true;
audio.unlockAudio();
await settle();
assert.equal(media[2].paused, true, "Autoplay rejection does not throw");
audio.shutdownAudio();
console.log(
  "Audio lifecycle passed: gesture, phase, tempo, mute, volumes, visibility, races, fallback, cleanup.",
);

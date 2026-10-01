"""Afterglow Dispatch: original 64-bar score. Offline NumPy + FFmpeg tool.

All instruments are synthesized here. No samples or external audio are used.
"""

import json
from pathlib import Path
import re
import subprocess
import tempfile
import wave
import numpy as np

RATE = 44_100
BPM = 116
BEAT = 60 / BPM
BARS = 64
SAMPLES = round(BARS * 4 * BEAT * RATE)
OUT = Path(__file__).resolve().parents[1] / "public/audio/afterglow-dispatch-v1.mp3"
RNG = np.random.default_rng(10126)
DRUMS = np.zeros((SAMPLES, 2), dtype=np.float32)
MUSIC = np.zeros_like(DRUMS)
AIR = np.zeros_like(DRUMS)
KICKS: list[float] = []


def hz(note: int) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def time(length: float) -> np.ndarray:
    return np.arange(round(length * RATE), dtype=np.float32) / RATE


def add(bus: np.ndarray, start: float, signal: np.ndarray, pan: float = 0) -> None:
    """Equal-power pan; wrap release tails onto the start of the loop."""
    first = round(start * RATE) % SAMPLES
    stereo = signal[:, None] * np.array(
        [np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)], dtype=np.float32,
    )
    split = min(len(stereo), SAMPLES - first)
    bus[first:first + split] += stereo[:split]
    if split < len(stereo):
        bus[:len(stereo) - split] += stereo[split:]


def envelope(t: np.ndarray, attack: float, decay: float) -> np.ndarray:
    release = np.clip((t[-1] - t) / 0.06, 0, 1)
    return np.minimum(1, t / attack) * np.exp(-t * decay) * (0.5 - 0.5 * np.cos(np.pi * release))


def noise(length: float, low: float, high: float) -> np.ndarray:
    n = round(length * RATE)
    spectrum = np.fft.rfft(RNG.normal(0, 1, n))
    frequencies = np.fft.rfftfreq(n, 1 / RATE)
    band = np.minimum(1, (frequencies / low) ** 2) * np.exp(-(frequencies / high) ** 4)
    result = np.fft.irfft(spectrum * band, n).astype(np.float32)
    return result / max(1, float(np.std(result)) * 3)


def kick(start: float, velocity: float = 1) -> None:
    t = time(0.38)
    phase = 2 * np.pi * (46 * t + 87 * (1 - np.exp(-t * 44)) / 44)
    body = np.sin(phase) * envelope(t, 0.0015, 14)
    click = noise(0.018, 1200, 5200) * np.exp(-time(0.018) * 250)
    body[:len(click)] += click * 0.06
    add(DRUMS, start, body * 0.46 * velocity)
    KICKS.append(start)


def snare(start: float, velocity: float = 1) -> None:
    t = time(0.24)
    body = (np.sin(2 * np.pi * 185 * t) + 0.4 * np.sin(2 * np.pi * 327 * t)) * np.exp(-t * 38)
    wire = noise(0.24, 950, 8300) * np.exp(-t * 23)
    add(DRUMS, start, (body * 0.13 + wire * 0.32) * envelope(t, 0.001, 1) * velocity, 0.05)
    for delay in (0.005, 0.013, 0.023):
        tc = time(0.095)
        add(DRUMS, start + delay, noise(0.095, 1500, 6100) * envelope(tc, 0.001, 40) * 0.095 * velocity, -0.16)


def hat(start: float, velocity: float, opened: bool, pan: float) -> None:
    length = 0.18 if opened else 0.07
    t = time(length)
    add(DRUMS, start, noise(length, 5800, 12_000) * envelope(t, 0.001, 23 if opened else 68) * 0.16 * velocity, pan)


def rim(start: float, velocity: float) -> None:
    t = time(0.07)
    tone = np.sin(2 * np.pi * 920 * t) + 0.45 * np.sin(2 * np.pi * 1470 * t)
    add(DRUMS, start, tone * envelope(t, 0.0006, 90) * 0.08 * velocity, -0.32)


def bass(start: float, note: int, duration: float, velocity: float) -> None:
    t = time(duration + 0.12)
    phase = 2 * np.pi * hz(note) * t
    tone = np.sin(phase) + 0.3 * np.sin(2 * phase) * np.exp(-t * 6)
    tone += 0.12 * np.sin(3 * phase) * np.exp(-t * 13)
    sustain = np.exp(-np.maximum(0, t - duration) * 40)
    add(MUSIC, start, tone * envelope(t, 0.009, 0.65) * sustain * 0.28 * velocity)


def piano(start: float, notes: list[int], velocity: float, pan: float) -> None:
    t = time(2.8)
    for index, note in enumerate(notes):
        phase = 2 * np.pi * hz(note) * t
        tone = np.sin(phase + 0.65 * velocity * np.exp(-t * 9) * np.sin(2 * phase))
        tone += 0.16 * np.sin(phase * 3.002) * np.exp(-t * 3.8)
        tone += 0.055 * np.sin(phase * 7.01) * np.exp(-t * 15)
        signal = tone * envelope(t, 0.003, 1.6) * 0.073 * velocity
        onset = start + index * 0.011
        add(MUSIC, onset, signal, pan + (index - 2) * 0.055)
        add(AIR, onset + BEAT * 0.75, signal * 0.13, -pan)


def lead(start: float, note: int, beats: float, velocity: float, pan: float) -> None:
    duration = beats * BEAT
    t = time(duration + 0.32)
    vibrato = 0.011 * np.sin(2 * np.pi * 4.3 * t) * np.minimum(1, t / 0.4)
    phase = 2 * np.pi * hz(note) * t + vibrato
    tone = np.sin(phase) + 0.18 * np.sin(3 * phase) + 0.065 * np.sin(5 * phase)
    tone += 0.12 * np.sin(phase * 1.0018 + 0.15)
    env = np.minimum(1, t / 0.025) * np.exp(-t * 0.85)
    env *= np.exp(-np.maximum(0, t - duration) * 14)
    env *= np.minimum(1, (t[-1] - t) / 0.03)
    signal = tone * env * 0.125 * velocity
    add(MUSIC, start, signal, pan)
    for delay, gain, side in ((0.75, 0.19, -0.45), (1.5, 0.10, 0.45)):
        add(AIR, start + delay * BEAT, signal * gain, side)


def pad(start: float, notes: list[int], length: float, velocity: float) -> None:
    t = time(length + 0.65)
    env = np.minimum(1, t / 0.45) * np.minimum(1, (t[-1] - t) / 0.75)
    for index, note in enumerate(notes):
        phase = 2 * np.pi * hz(note) * t
        tone = np.sin(phase) + 0.2 * np.sin(phase * 1.003 + index)
        add(AIR, start, tone * env * 0.025 * velocity, -0.6 if index % 2 else 0.6)


# Close voicings and two bars per chord leave space to breathe.
VERSE = [([57, 61, 62, 66, 69], 35), ([55, 59, 62, 66, 69], 31),
         ([54, 57, 61, 64, 69], 38), ([55, 59, 61, 64, 66], 33)]
CHORUS = [([54, 57, 61, 64, 69], 38), ([52, 57, 59, 61, 64], 33),
          ([54, 57, 61, 62, 66], 35), ([54, 57, 59, 62, 66], 31)]
# Eight-bar call/response melody with rests and held notes, not a running arp.
HOOK = [
    [(0.5, 66, 0.75), (1.75, 69, 0.5), (2.5, 73, 1)],
    [(0.25, 71, 0.75), (1.5, 69, 1.5)],
    [(0.5, 66, 0.75), (1.75, 69, 0.5), (2.75, 71, 0.75)],
    [(0, 69, 1.5), (2.25, 66, 0.75)],
    [(0.5, 64, 0.75), (1.75, 66, 0.5), (2.5, 69, 1)],
    [(0.25, 66, 0.75), (1.5, 64, 1.5)],
    [(0.5, 61, 0.5), (1.5, 64, 0.5), (2.5, 66, 0.75)],
    [(0.25, 64, 1), (1.75, 61, 1.25)],
]

for bar in range(BARS):
    start = bar * 4 * BEAT
    bridge = 32 <= bar < 40
    intro = bar < 8
    chorus = 16 <= bar < 32 or bar >= 48
    notes, root = (CHORUS if chorus else VERSE)[(bar // 2) % 4]
    energy = 0.65 if intro or bridge else 1
    if bar % 2 == 0:
        pad(start, notes, 8 * BEAT, 0.8 if chorus else 1)
    piano(start + 0.015, notes, 0.84, -0.25)
    if not bridge:
        piano(start + 2.75 * BEAT, notes[:-1], 0.53, 0.22)
    if chorus and bar % 2:
        piano(start + 1.5 * BEAT, notes[1:], 0.40, 0.15)
    groove = [(0, root, 0.9, 1), (1.75, root, 0.4, 0.72),
              (2.5, root + 7, 0.42, 0.74), (3.25, root + 12, 0.5, 0.57)]
    if bar % 2:
        groove[-1] = (3.5, root + 7, 0.3, 0.65)
    for beat, note, length, velocity in groove[:1] if bridge else groove:
        bass(start + beat * BEAT, note, length * BEAT, velocity * energy)
    # Broken kick, backbeat, soft ghost notes and swung sixteenths.
    kick_beats = [0, 2.5] if intro else [0, 1.75, 2.5]
    if bar % 4 == 2 and not intro:
        kick_beats = [0, 0.75, 2.25, 3.5]
    if bridge:
        kick_beats = [0] if bar % 2 == 0 else []
    for index, beat in enumerate(kick_beats):
        kick(start + beat * BEAT, energy * (1 if index == 0 else 0.82))
    if not bridge:
        for beat in (1, 3):
            snare(start + beat * BEAT + 0.006, 0.87 if intro else 1)
        if bar % 2:
            snare(start + 2.75 * BEAT + 0.006, 0.21)
    else:
        rim(start + 3 * BEAT, 0.8)
    for step in range(16):
        if step % 2 and (intro or bridge or step % 4 != 3):
            continue
        swing = BEAT * 0.065 if step % 2 else 0
        human = RNG.uniform(-0.004, 0.004)
        accent = 0.62 if step % 4 == 2 else 0.35 if step % 2 == 0 else 0.17
        hat(start + step * BEAT / 4 + swing + human, accent * energy,
            step == 14 and not bridge, -0.3 if step % 2 else 0.3)
    if not intro and not bridge:
        rim(start + 0.75 * BEAT, 0.55)
        rim(start + 2.25 * BEAT, 0.32)
    if bar % 8 == 7 and not bridge:
        for index, beat in enumerate((3.25, 3.5, 3.75)):
            snare(start + beat * BEAT, 0.25 + index * 0.08)
    if bar >= 4 and not bridge:
        melody = HOOK[bar % 8][:1] if intro else HOOK[bar % 8]
        for index, (beat, note, length) in enumerate(melody):
            if chorus and bar % 8 < 2:
                note = {73: 73, 71: 69, 69: 66, 66: 64}.get(note, note)
            if bar >= 56 and bar % 8 in (2, 3):
                note += 12
            lead(start + beat * BEAT, note, length, 0.8 if chorus else 0.62,
                 0.10 if index % 2 else -0.1)
    elif bridge and bar % 2 == 0:
        lead(start + 1.5 * BEAT, notes[-2], 2, 0.38, 0.3)

# Gentle ducking clears the kick. Delays and tails wrap across the loop boundary.
duck = np.ones(SAMPLES, dtype=np.float32)
td = time(0.21)
shape = 1 - 0.20 * np.exp(-td * 18)
for start in KICKS:
    first = round(start * RATE) % SAMPLES
    split = min(len(shape), SAMPLES - first)
    duck[first:first + split] = np.minimum(duck[first:first + split], shape[:split])
    if split < len(shape):
        duck[:len(shape) - split] = np.minimum(duck[:len(shape) - split], shape[split:])
MUSIC *= duck[:, None]
for delay, gain in ((0.043, 0.07), (0.079, 0.05), (0.137, 0.035), (0.193, 0.025)):
    AIR += np.roll(MUSIC[:, ::-1], round(delay * RATE), axis=0) * gain
MIX = DRUMS + MUSIC + AIR
MIX -= MIX.mean(axis=0)
MIX *= 0.76 / max(float(np.max(np.abs(MIX))), 0.001)

OUT.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as folder:
    wav_path = Path(folder) / "afterglow.wav"
    with wave.open(str(wav_path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes((MIX * 32767).astype("<i2").tobytes())
    analysis = subprocess.run([
        "ffmpeg", "-hide_banner", "-i", str(wav_path), "-af",
        "loudnorm=I=-16:TP=-2:LRA=9:print_format=json", "-f", "null", "-",
    ], capture_output=True, text=True, check=True)
    measured = json.loads(re.search(r'\{\s*"input_i".*?\}', analysis.stderr, re.S).group())
    mastering = (
        "loudnorm=I=-16:TP=-2:LRA=9:linear=true:"
        f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}"
    )
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-af", mastering,
        "-ar", str(RATE), "-codec:a", "libmp3lame", "-b:a", "112k",
        "-metadata", "title=Afterglow Dispatch", "-metadata", "artist=NXR / Last Message",
        str(OUT),
    ], check=True)
print(f"Wrote {OUT.name}: {SAMPLES / RATE:.2f}s, {OUT.stat().st_size / 1024:.0f} KiB")

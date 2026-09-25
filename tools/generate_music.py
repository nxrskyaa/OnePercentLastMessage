"""Render the original, loopable Signal Run score. Requires numpy and ffmpeg."""

from pathlib import Path
import subprocess
import tempfile
import wave

import numpy as np


RATE = 32_000
BPM = 100
BEAT = 60 / BPM
BARS = 16
DURATION = BARS * 4 * BEAT
OUT = Path(__file__).resolve().parents[1] / "public" / "audio" / "signal-run.mp3"
MIX = np.zeros((int(DURATION * RATE), 2), dtype=np.float32)
RNG = np.random.default_rng(104)


def hz(note: int) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def add(start: float, signal: np.ndarray, pan: float = 0) -> None:
    first = int(start * RATE)
    if first >= len(MIX):
        return
    signal = signal[: len(MIX) - first]
    MIX[first : first + len(signal), 0] += signal * (1 - pan) * 0.5
    MIX[first : first + len(signal), 1] += signal * (1 + pan) * 0.5


def pad(start: float, notes: list[int], variant: int) -> None:
    length = 4 * BEAT
    t = np.arange(int(length * RATE), dtype=np.float32) / RATE
    envelope = np.minimum(1, t / 0.32) * np.minimum(1, (length - t) / 0.35)
    for index, note in enumerate(notes):
        f = hz(note)
        drift = 0.004 * np.sin(2 * np.pi * 0.27 * t + index)
        phase = 2 * np.pi * f * (t + drift / f)
        tone = np.sin(phase) + 0.26 * np.sin(phase * 2.01)
        tone += 0.12 * np.sin(phase * 3.01 + variant)
        add(start, tone * envelope * 0.027, (-0.6 if index % 2 else 0.6))


def bass(start: float, note: int, accent: float) -> None:
    t = np.arange(int(0.48 * RATE), dtype=np.float32) / RATE
    phase = 2 * np.pi * hz(note) * t
    envelope = np.minimum(1, t / 0.008) * np.exp(-t * 5.2)
    tone = np.sin(phase) + 0.23 * np.sin(phase * 2)
    add(start, tone * envelope * 0.16 * accent)


def pluck(start: float, note: int, pan: float, accent: float) -> None:
    t = np.arange(int(0.47 * RATE), dtype=np.float32) / RATE
    f = hz(note)
    phase = 2 * np.pi * f * t
    fm = np.sin(phase + 1.2 * np.exp(-t * 18) * np.sin(2 * phase))
    tone = fm + 0.19 * np.sin(phase * 2.01)
    envelope = np.minimum(1, t / 0.004) * np.exp(-t * 7.2)
    add(start, tone * envelope * 0.078 * accent, pan)


def kick(start: float, accent: float) -> None:
    t = np.arange(int(0.34 * RATE), dtype=np.float32) / RATE
    phase = 2 * np.pi * (43 * t + 72 * (1 - np.exp(-t * 28)) / 28)
    tone = np.sin(phase) * np.exp(-t * 18)
    add(start, tone * 0.22 * accent)


def noise_hit(start: float, length: float, volume: float, pan: float) -> None:
    t = np.arange(int(length * RATE), dtype=np.float32) / RATE
    white = RNG.normal(0, 1, len(t)).astype(np.float32)
    bright = white - np.convolve(white, np.ones(9) / 9, mode="same")
    envelope = np.exp(-t * (27 if length < 0.15 else 13))
    add(start, bright * envelope * volume, pan)


CHORDS = [
    ([52, 55, 59, 62], 40),  # Em7
    ([48, 52, 55, 59], 36),  # Cmaj7
    ([43, 47, 50, 57], 31),  # Gadd9
    ([50, 54, 57, 64], 38),  # Dadd9
]

for bar in range(BARS):
    notes, root = CHORDS[bar % len(CHORDS)]
    start = bar * 4 * BEAT
    pad(start, notes, bar // 4)
    for beat in range(4):
        moment = start + beat * BEAT
        if beat % 2 == 0:
            kick(moment, 1 if beat == 0 else 0.7)
        else:
            noise_hit(moment, 0.19, 0.028, 0.08)
        bass(moment, root, 1 if beat == 0 else 0.58)
        noise_hit(moment + BEAT * 0.5, 0.075, 0.013, -0.3 if beat % 2 else 0.3)
    sequence = [0, 2, 1, 3, 2, 1, 3, 1]
    for step, degree in enumerate(sequence):
        if bar < 2 and step % 2:
            continue
        octave = 12 if step in (3, 7) else 0
        pluck(
            start + step * BEAT * 0.5,
            notes[degree] + octave,
            -0.45 if step % 2 else 0.45,
            0.72 if step % 2 else 1,
        )
    if bar in (3, 7, 11, 15):
        for step in range(8):
            noise_hit(start + (3 + step / 8) * BEAT, 0.05, 0.005 + step * 0.002, 0)

# A small edge fade prevents a pop when the browser loops the file.
edge = int(0.025 * RATE)
MIX[:edge] *= np.linspace(0, 1, edge)[:, None]
MIX[-edge:] *= np.linspace(1, 0, edge)[:, None]
MIX = np.tanh(MIX * 1.5)
OUT.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as folder:
    wav_path = Path(folder) / "score.wav"
    with wave.open(str(wav_path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes((MIX * 32767).astype("<i2").tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-af", "volume=8.5dB", "-q:a", "5", str(OUT)],
        check=True,
    )
print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KiB)")

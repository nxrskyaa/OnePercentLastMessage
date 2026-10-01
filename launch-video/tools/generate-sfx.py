"""Original film cues. Game tones reuse the frequency curves in src/lib/audio.ts."""
from pathlib import Path
import wave
import numpy as np

root = Path(__file__).resolve().parents[1] / "public" / "sfx"
root.mkdir(parents=True, exist_ok=True)
sr = 48000
rng = np.random.default_rng(13)

def save(name, signal):
    signal = np.tanh(signal)
    signal = np.stack((signal, np.roll(signal, 37) * 0.97), axis=1)
    with wave.open(str(root / f"{name}.wav"), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes((signal * 32767).astype("<i2").tobytes())

for name, f0, f1, duration in [
    ("notify", 480, 330, .16), ("scan", 220, 850, .4),
    ("relay", 500, 720, .18), ("delivered", 410, 820, .6),
]:
    t = np.arange(int(sr * duration)) / sr
    frequency = f0 * np.exp(np.log(f1 / f0) * t / duration)
    phase = 2 * np.pi * np.cumsum(frequency) / sr
    envelope = np.minimum(t / .012, 1) * np.exp(-t * 10 / duration)
    save(name, np.sin(phase) * envelope * .18)

t = np.arange(int(sr * .5)) / sr
noise = rng.normal(0, 1, t.size)
smoothed = np.convolve(noise, np.ones(14) / 14, mode="same")
env = np.sin(np.pi * np.minimum(t / .5, 1)) ** 2
save("air-cut", (smoothed * .33 + np.sin(2 * np.pi * (110 * t - 70 * t * t)) * .05) * env)
t = np.arange(int(sr * 2.4)) / sr
noise = rng.normal(0, 1, t.size)
noise = np.convolve(noise, np.ones(22) / 22, mode="same")
env = np.minimum(t / .22, 1) * np.minimum((2.4 - t) / .35, 1)
phase = 2 * np.pi * (90 * t + 10 * t * t)
save("nitro", (noise * .35 + np.sin(phase) * .085 + np.sin(phase * 2.01) * .025) * env)
print("Generated six original stereo cues.")

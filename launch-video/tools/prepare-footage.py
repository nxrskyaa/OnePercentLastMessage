"""Cut locally recorded game footage into frame-stable editorial clips."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
footage = root / "public" / "footage"
cuts = [
    ("opening", 1, 3.0, 3.0),
    ("departure", 1, 6.0, 5.2),
    ("nitro", 1, 29.5, 4.0),
    ("rotor", 1, 61.5, 4.0),
    ("prism", 2, 7.0, 4.0),
    ("solar", 3, 7.0, 4.0),
    ("arrival", 1, 104.0, 3.0),
]
metadata = {}
for name, stage, start, duration in cuts:
    source = footage / f"stage-{stage}.webm"
    telemetry = json.loads((footage / f"stage-{stage}.json").read_text())
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-i", str(source),
        "-t", str(duration), "-vf", "scale=1920:1080:flags=lanczos,fps=30,setsar=1",
        "-c:v", "libx264", "-threads", "2", "-preset", "fast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart",
        str(footage / f"{name}.mp4"),
    ], check=True)
    samples = telemetry["samples"]
    metadata[name] = [
        min(samples, key=lambda row: abs(row["seconds"] - (start + frame / 30)))
        for frame in range(round(duration * 30))
    ]
    print(f"Prepared {name}: {duration}s", flush=True)
metadata["result"] = json.loads((footage / "stage-1.json").read_text())["result"]
(footage / "clips.json").write_text(json.dumps(metadata, indent=2))

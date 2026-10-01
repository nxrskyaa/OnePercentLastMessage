"""Bundle the editable film with its prepared media, without dependencies or raw takes."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = root / "out" / "last-message-video-source.zip"
output.parent.mkdir(exist_ok=True)
files = [
    root / name for name in (
        "README.md", "package.json", "package-lock.json", "tsconfig.json",
        "remotion.config.ts", "eslint.config.mjs", ".prettierrc", ".gitignore",
    ) if (root / name).is_file()
]
for directory in ("src", "tools", "public/brand", "public/sfx"):
    files.extend(p for p in (root / directory).rglob("*") if p.is_file() and "__pycache__" not in p.parts)
files.append(root / "public" / "afterglow-dispatch-v1.mp3")
files.append(root / "public" / "footage" / "clips.json")
for name in ("opening", "departure", "nitro", "rotor", "prism", "solar", "arrival"):
    files.append(root / "public" / "footage" / f"{name}.mp4")
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(files):
        archive.write(path, "launch-video/" + path.relative_to(root).as_posix())
print(f"Bundled {len(files)} files: {output.name} ({output.stat().st_size:,} bytes)")

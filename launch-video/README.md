# Last Message — launch film

A 33.1-second introduction and gameplay film, edited in Remotion. The game and this video project have separate dependency trees; Vercel excludes this folder.

## Preview and export

```bash
cd launch-video
npm install
npm run dev
npm run render
```

`npm run render` exports `out/last-message-launch.mp4`: 1920 × 1080, 30 FPS, H.264 / AAC. The source layout is 1280 × 720 and exported at 1.5 scale. Footage clips are prepared at 1080p from the actual captured renderer; capture resolution can adapt during a run.

Download the source bundle from the [v1.0.0-jam release](https://github.com/nxrskyaa/OnePercentLastMessage/releases/tag/v1.0.0-jam) for the prepared footage. The repo contains editable code, telemetry for the selected cuts and small brand/audio assets; large MP4/WebM recordings are release assets rather than Git objects.

## Story

| Time     | Scene                                               |
| -------- | --------------------------------------------------- |
| 0–3s     | Battery critical, incoming reply and signal handoff |
| 3–8s     | Tidal flight and the guidance line                  |
| 8–12s    | Nitro: speed with a battery cost                    |
| 12–16s   | Thread a moving rotor                               |
| 16–20s   | Prism Archive and the Needle courier                |
| 20–24s   | Solar Relay and the Comet courier                   |
| 24–27s   | Final gate on the receiver approach                 |
| 27–33.1s | Actual run score and invitation to play             |

Opening, Gameplay and Closing are separate Studio compositions. Every clip and sound cue has its own timeline node. Motion uses frame-based interpolation; there are no CSS animation timers.

## Re-record footage

1. At the game root, run `npm run dev`.
2. Open `/capture` locally at 1280 × 720. It is unavailable in production.
3. Record Tidal until it finishes, then Prism and Solar for about 40 seconds each. The page supplies scripted keyboard-style input; the renderer, collisions, resource drain and score remain the production game systems. Capture records the 3D canvas, not the DOM overlay.
4. Download both recording and telemetry, then place them as `public/footage/stage-1.webm` / `stage-1.json` through stage 3.
5. Run `python tools/prepare-footage.py` with FFmpeg installed. Edit the cut times if using another take.

The film's minimal battery/privacy overlay reads matching captured telemetry, rather than invented stats. The Tidal recording delivered in 1:52.56 with 100% privacy and a score of 20,398. The film contains editorial cuts; it is not a single human speedrun.

## Audio

Afterglow Dispatch is the game's original 116 BPM score. This edit starts at its flight groove and fades at the end of a sixteen-bar section. `tools/generate-sfx.py` creates original transition/engine cues; notification, scan, relay and delivery frequency curves come from the game's audio source. Python with NumPy is only needed for regeneration. The supplied WAV/MP3 files are ready to use.

## Checks

```bash
npm run lint
npm run render
```

Rendered contact sheets, a decode check, loudness/peak analysis and a browser playback check accompany the final export. Important title and play-link text stay inside the frame. Do not replace the game footage with stock or generated footage.

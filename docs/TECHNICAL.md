# Development and deployment

## Setup

Requires Node.js 20.9 or newer. No API keys, database or external AI service are required.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To serve a production build:

```bash
npm run build
npm run start
```

## Quality checks

```bash
npm run lint
npm run test:course
node tools/check-crafts.mjs
node tools/check-audio.mjs
npm run format:check
npm run build
```

Course tests share the production tuning, aperture paths and movement helpers. They test reachable routes, delayed control input, low frame rate, battery budgets and failure when a pilot stays idle. Browser QA remains necessary for input, rendering, layouts and sound.

## Architecture

| Location                       | Responsibility                                     |
| ------------------------------ | -------------------------------------------------- |
| `src/app`                      | Next.js App Router, metadata and UI styles         |
| `src/components/game`          | R3F scene, craft, camera, world and effects        |
| `src/components/ui`            | Opening, menu, briefings, HUD and results          |
| `src/game/config.ts`           | Movement, battery, node and camera tuning          |
| `src/game/flightPath.ts`       | Shared authored route and stage variations         |
| `src/game/nodes.ts`            | Seeded nodes, moving apertures and collisions      |
| `src/game/pilot.ts`            | Input priority, release damping and guidance       |
| `src/game/advisor.ts`          | Local DILI recommendations                         |
| `src/store`                    | Zustand phases, sampled HUD, profile and settings  |
| `src/rendering`                | Materials, renderer budget and performance metrics |
| `src/lib/audio.ts`             | Sound cues and soundtrack lifecycle                |
| `public/brand`, `public/audio` | Brand art and original compressed music            |
| `tools`                        | Gameplay/audio checks and soundtrack generator     |
| `launch-video`                 | Separate Remotion project; not a game dependency   |

Frame-by-frame positions and velocities stay in the scene. Zustand receives HUD samples rather than every frame. Collisions use small distance/aperture checks; there is no physics engine. DILI is deterministic local advice and does not call an LLM.

## Rendering

Three.js WebGL provides antialiasing, filmic tone mapping and an adaptive resolution budget. Harbor scenery is batched; small moving elements use instancing. Medium/High have restrained bloom and a 512px water-reflection pass updated every other frame. Low omits those passes. No real-time shadows are used.

Append `?perf=1` to display FPS, frame duration, scene submission CPU time, draw calls, triangles and quality. CPU submission time is not a GPU completion measurement. FPS is device-dependent.

## Vercel

Import the GitHub repository as a Next.js project. Use the repository root, standard install and `npm run build`. `.vercelignore` excludes the video project and docs from deployment upload. The development-only `/capture` route returns 404 in production.

`NEXT_PUBLIC_SITE_URL` optionally sets the canonical preview origin; see `.env.example`. Keep local environment files out of Git. After deployment, verify Vercel's Ready state and open the production alias to check the actual build.

## Soundtrack source

`tools/generate_music.py` renders **Afterglow Dispatch**, a 116 BPM original composition. Regeneration requires Python, NumPy and FFmpeg; normal installs use the committed MP3 and need none of those tools. Web Audio sound effects are generated at runtime. Gesture unlock, mute, hidden tabs and cleanup are covered by `check-audio.mjs`.

## Known limits

- Desktop has the widest view. Touch controls exist, but physical-device/browser coverage is not exhaustive.
- Arbitrary external profile-image hosts may reject cross-origin export; the card falls back to initials.
- Scores and identities are local, not an online leaderboard.
- A dependency emits a deprecated `THREE.Clock` warning; this is separate from runtime app errors.

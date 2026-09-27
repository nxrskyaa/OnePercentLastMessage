# 1% — Last Message: implementation plan

## First playable — complete

1. Scaffold a strict Next.js App Router project with TypeScript, Tailwind, ESLint, and Prettier. Add Three.js, React Three Fiber, Drei, and Zustand. Keep the postprocessing package available for later polish.
2. Build one small 3D network corridor with procedural lines, relay rings, particles, a visible destination beacon, a glowing packet, and a smooth chase camera.
3. Make the keyboard loop playable: automatic forward travel; W/Up accelerates, S/Down slows, A/D steer, Shift boosts, Escape pauses.
4. Add 1.00% battery drain, a timer, destination collision, success/failure, minimal HUD, and immediate retry. Keep all tuning in `src/game/config.ts`.
5. Verify lint and production build, then play through success and failure in a desktop browser and check console/resize behavior.

Verified on September 24, 2026: production build, lint, and formatting pass. Browser playthroughs reached both delivery and signal loss; pause, retry, saved best time, and compact desktop layout were checked. The production scene rendered without browser console errors.

## After the core loop is proven

- Add authored branching routes, tracker/booster/tip nodes, privacy, scan, and route feedback.
- Add twelve mission scenarios, deterministic DILI advice, scoring and saved best results.
- Add restrained audio/visual polish, settings, share text, and social preview.
- Verify input, pause, restart, performance, browser compatibility, and Vercel deployment readiness.

## Design constraints

- No physics engine, external AI dependency, wallet, database, or remote assets.
- Store game phase and HUD samples in Zustand; keep per-frame position and camera data inside the canvas.
- Make the destination and the current battery state readable within the first ten seconds.

## Stage and identity update — September 27, 2026

- Add three selectable stage treatments using the same proven flight mechanics. Each stage changes the sky, channel, landmarks, moving network motifs, and seeded node layout without multiplying draw calls.
- Ask new players for a local display name, optional X username and HTTPS image link. Let them select English or Indonesian before entering the menu; allow profile edits later.
- Include identity and stage on the result screen and exported PNG. Keep a safe initials fallback for images that do not support cross-origin canvas export.
- Validate desktop and compact layouts, gameplay and card export, then run format, lint, typecheck, production build, and release verification.

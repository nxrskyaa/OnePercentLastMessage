# 1% — Last Message: implementation plan

## Lantern and material revision — September 29, 2026

- Reference review: study the compact hot lamp cores, soft amber falloff, cool environmental fill, and readable material edges in Lost Marbles.
- Replace the flat slit fixtures and triangular projection fans with modeled relay lanterns, rounded metal collars, diffuse halos, and surface-aligned light pools.
- Give the architecture curved structural ribs and a restrained material reflection environment. Remove decorative floating primitives that compete with gameplay nodes.
- Test a capped-resolution bloom pass with native Three.js utilities; keep a lightweight fallback for low quality and disabled screen effects. Measure the complete render workload.
- Review actual desktop/mobile gameplay, scan, pause, stage changes, and console output. Run lint/build before pushing and deploying the verified result.

Verification: lint, strict TypeScript compilation, production build, formatting, and diff checks passed. In the local production build, Tidal and Prism samples at 1280 × 720 were 88–92 FPS with Medium quality and bloom enabled; disabling screen effects rendered correctly and raised sampled throughput to 146 FPS. At 390 × 844, Low quality rendered correctly, touch scan entered cooldown, and document width equaled viewport width. Stage changes and pause/resume produced no observed console errors. These are samples on the development machine, not physical-phone or cross-browser performance guarantees.

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

## Ceiling and lighting update — September 28, 2026

- Add folded overhead architecture, illuminated apertures, soft light shafts, and matching pools on the channel surface. Change crown height, tilt, and color by stage.
- Double the fixture stations to eight pairs; retain two moving point lights and batch the visible fixtures. Smooth light movement between stations.
- Deepen the sky palette, reduce flat ambient illumination, and add subtle wall surface detail. Give the archive landmarks an authored bevel silhouette.
- Verified: ESLint and production build pass; desktop gameplay, scan, tracker damage, battery drain, pause/resume, and stage selection work. At 390 × 844, the touch scan works and document width matches the viewport. No console errors observed in the local production session.
- Performance readings in the local in-app browser at 1280 × 720 were approximately 88–104 FPS during sampled Tidal/Solar gameplay on Medium. These are local observations, not a guarantee for other hardware. Physical mobile devices and other browser engines were not tested in this pass.

## Signal harbor world rebuild — September 29, 2026

- Reference observed in-browser: Threejs-Punk has a detailed layered streetscape, bright physical light sources, material contrast, and wet reflections. Apply those principles to an original signal harbor.
- Replace the repeated folded corridor/sails with six asymmetric island stations, glazed receiver towers, three cable crossings, service docks, and distant satellite islands.
- Add a single 512px planar water reflection at half rate for Medium/High. Low uses the same animated water shader without rendering a reflected scene. Keep bloom and quality adaptation.
- Add instanced mooring buoys using damped springs driven by player proximity, boost and scan; tiny overhead service shuttles provide scale. Pause and reduced motion stop simulation.
- Preserve the flight corridor, collisions, stage selection, profiles and result cards. Verify production visuals, interactions and measured render cost before publishing.

### Verification and renderer budget

- Production build, strict TypeScript, ESLint and changed-file formatting pass.
- Observed Tidal, Prism and Solar flight scenes; tested scan, pause/resume, battery depletion, tracker/privacy effects and retry. No browser errors in the observed sessions.
- At 390 x 844, document width stays 390, touch scan changes to cooldown, and Low renders without the reflection pass. Local desktop GPU samples at that viewport: 103-109 FPS; this is not a physical-phone benchmark.
- Initial Prism measurements dipped to 51 FPS. Restricted reflections to the environment layer, removed Medium oversampling (native resolution plus MSAA), and made adaptive scaling respond below 56 FPS. Later desktop samples were 64-70 FPS in the inspected session. Performance varies with hardware and other active GPU work.
- Menu, briefing, profile, tutorial and pause now use demand rendering. Only active gameplay/countdown and end effects render continuously. Fixed Space being swallowed in menu controls.

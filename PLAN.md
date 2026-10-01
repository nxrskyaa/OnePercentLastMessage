# 1% — Last Message: implementation plan

## Launch package — October 1, 2026

- Verify the two official Dlicom announcements, then document submission steps and local-time deadline.
- Replace the long changelog-like README with a clear play link, real screenshots, controls and development instructions. Separate player guide, technical notes, credits and launch checklist; prepare repository metadata and a tagged release.
- Build a separate Remotion project, using the game's existing logos, art and original soundtrack. Record the actual game renderer with scripted control input in a development-only capture page; preserve normal collisions, battery drain and scoring. Keep capture tools unavailable in production.
- Edit a short introduction and gameplay film with deliberate cuts, motion typography, restrained original sound effects and a clear play-link ending. Export an upload-ready MP4, source project and poster; check rendered frames, full video decode, sound levels and text bounds.
- Write one conversational English X paragraph with the working play link and @DlicomApp tag. Publishing the X post and sending its link to Discord remain the user's launch actions.

Verification: game lint, formatting, TypeScript/production build, audio lifecycle, craft budgets and all 108 course simulations pass. The development-only capture route returns 404 in a local production server. Two scripted Tidal recordings deliver through normal gameplay; the film uses the first take's actual telemetry and score, plus Prism/Solar excerpts. The exported 993-frame film is 1080p H.264/AAC at 30 FPS, approximately 33.109 seconds, and fully decodes without errors. Playback reached the end in the in-app browser with audio unmuted and no media error; nine rendered review frames fit their text inside the canvas. Audio is -17.78 LUFS integrated and -4.38 dBTP. Corrected intrinsic SVG rasterization for sharp video logos and compact result spacing after observing clipped awards at 1280 × 720. See docs/QA.md for the limits and asset provenance.

## Flight readability and difficulty repair — October 1, 2026

- Fix unintended mouse steering and reduce coasting after steering/climb keys are released; let braking override boost. Keep automatic course following and explain it explicitly.
- Rebalance cruise speed, battery drain, boost cost and collision penalties so missed pickups and several mistakes are recoverable. Ease early gate offsets, enlarge openings and slow their movement while retaining later rotors and stage variation.
- Add a lightweight 3D flight guide to the next gate/power node, live direction cues and a persistent compact desktop key guide. Put the control diagram in the briefing even for returning players.
- Verify full courses with delayed, imperfect keyboard-style pilots, not only perfect tracking. Check browser controls, guide layout, pause/retry and mobile overlap; run lint/build, push and verify production.

## Soundtrack revision — October 1, 2026

- Replace the repetitive 38-second arpeggio with an original 64-bar, 116 BPM score: warm electric piano, syncopated bass, swung breakbeats and a recurring melodic hook. Arrange an introduction, flight groove, quieter bridge and final refrain.
- Render and master offline; stream one compressed stereo file in the browser. Preserve musical tails across the loop boundary and check loudness, decoded peaks and stereo balance.
- Remove playback-rate changes. Use a smoothly automated music filter and gain for menu, flight, boost and results. Preserve mute, separate volume controls, gesture unlock, pause and resource cleanup; stop audio in hidden tabs.
- Verify actual media progress, pause/resume, mute, sliders, restart and refresh in the production build. Run lint/build and publish the verified asset with a new filename.

Verification: the decoded track is 132.41379 seconds, 1,854,640 bytes, stereo 44.1 kHz; integrated loudness is -16.4 LUFS, range 4.5 LU and true peak -2.4 dBFS. No clipped samples; the loop boundary's sample changes are below ordinary transient slopes, with release tails wrapped rather than faded to silence. Local Chrome playback reached readyState 4 and advanced through a loop. Music-volume zero, mute/unmute, pause, opening settings while paused, resume and restart were observed; restart retained one audio element. The isolated lifecycle harness additionally checks hidden tabs, late play promises, fixed boost tempo, unsupported media-source fallback and teardown. Lint, formatting and production build passed. These checks verify playback behavior and signal levels, not subjective musical preference. Existing slow rendering in the reconnected Chrome session remains outside this audio change; no FPS improvement is claimed.

## Cinematic opening and kinetic game UI — October 1, 2026

- Use the supplied graphic game UI references: bold diagonal menu ribbons, a central game hero, ink silhouettes and sequenced motion. Keep DILI and the original game world as the subjects.
- Animate an approximately six-second real-time opening: visor close-up, ignition, harbor camera sweep, then hero framing. Show an honest loading state while the renderer prepares; support skip, replay and reduced motion.
- Give the menu a capped 30 FPS live 3D presentation, with floating craft and pointer response. Pause background rendering when hidden or when panels are open. Keep gameplay render cost unchanged.
- Animate menu reveals, selected routes, briefing/countdown, HUD events and result rank/score panels using bounded CSS transforms and opacity. Preserve profile, language, accessibility, controls and card export.
- Verify first-load/replay/skip, menu motion, reduced motion, desktop/mobile framing, gameplay handoff, pause/retry/results, console and build before pushing and deploying.

Verification: lint, formatting, strict production build, the three craft geometry checks, and all 36 course simulations pass. Local Chrome checks exercised first boot, returning profile persistence, replay, Escape skip, reduced-motion opening/menu, mission/tutorial/countdown, actual gameplay, scan cooldown, pause/resume, battery failure, results and retry. Desktop 1280 × 720 and portrait 391 × 844 layouts fit without horizontal document overflow. Portrait close-up framing, idle exhaust brightness, result-map contrast and countdown blur were corrected after observing rendered frames. A warmed desktop Low sample was 83 FPS; an earlier portrait sample ranged 55–83 FPS. These are development-machine samples, not physical-phone or cross-browser guarantees. Browser logs contained wallet-extension conflicts and a nonfatal Three.Clock deprecation warning, with no observed app runtime errors. Presentation uses the existing renderer, a capped menu frame timer and cleaned-up timers; battery/collision updates only run in gameplay.

Follow-up release QA: a reconnected browser session sampled 2–3 FPS even on Low; the cause is not established, so sustained performance is not certified. This exposed a camera handoff bug when countdown frames were delayed: the chase camera could ease from the distant menu position. Initialize camera position and target at the craft on the first flight frame, retaining smooth follow thereafter. The live opening was verified with actual captured 3D frames and the production alias served the new styles successfully.

Comparison: the preceding production release (`last-message-36kg3hr0f`) also sampled 2 FPS / Low in the same follow-up browser session. This does not isolate the underlying cause, but the slowdown is reproducible without the new UI. `?perf=1` now includes CPU scene submission timing; it is explicitly not GPU completion timing. Final camera initialization was visually checked at 0.3 seconds of actual gameplay with the world and craft visible.

## Curved skyway and flight UI — October 1, 2026

- Replace the straight world axis with one authored continuous spatial route, shared by world geometry, craft, lighting, navigation and collision coordinates. Preserve lateral/vertical control relative to the route; account for its slope in forward travel.
- Build distinct stage bends, elevated switchbacks and descending approaches. Batch route rails and markings; keep water flat and the existing render budget.
- Replace the opaque menu poster with a flight hangar composition that exposes the real 3D craft and world. Rebuild the live HUD around compact instruments, course navigation and speed. Recompose results independently of the downloadable card.
- Verify route continuity, collision alignment, reachable courses, UI overflow and actual browser frames; run lint/build, push and verify Vercel production.

Verification: lint, formatting and strict production build passed. Course tests check continuous centers/slopes, the elevated crest and receiver endpoints for all three stages; all 36 movement-limited simulations deliver in roughly 125–132 seconds with 0.13–0.21% battery remaining, and idle flight fails. This is simulated reachability, not a complete human playthrough. Chrome production-build QA exercised menu/briefing, actual curved flight, obstacle damage, battery failure, results, retry, touch climb, scan cooldown, touch boost and pause. Desktop menu/results were reviewed at 1280 × 720; 391 × 844 menu/results have no horizontal document overflow. Corrected section culling that previously removed the current architecture before the player had passed it. Sampled rendering after the fix was 55–73 FPS on desktop Low with adaptive resolution and 82–83 FPS at the narrow viewport; physical phones and other engines remain untested. Logs showed extension conflicts and a nonfatal Three.Clock deprecation warning, with no observed app-origin runtime errors. UI and world screenshots are saved locally under `output/last-message-flight-ui` outside the repository.

## Rocket silhouettes and visible nitro — October 1, 2026

- Replace the shared bulb-like packet with three original courier craft: rounded twin-pod Skimmer, faceted delta Needle, and broad three-engine Comet. Keep the DILI message visor and authored material accents.
- Add nozzle-anchored bright exhaust, shock rings, and a bounded pool of peripheral velocity streaks. Effects must remain visible on Low without bloom, freeze on pause, and disappear on failure.
- Keep motion, camera FOV, battery cost and controls intact. Animate nozzle heat, exhaust and boost light directly in the canvas; avoid per-frame React state and extra light sources.
- Check each craft in normal/boost views, keyboard and touch boost, pause/retry, render cost, lint, build and production deployment.

Design intake: original stylized game props, not image reconstruction. The img2threejs intake requires an object reference for likeness gates; the supplied mascot and game UI references establish brand identity but do not define a rocket. No exact reconstruction or completed skill fidelity pipeline is claimed. Quality contract: clearly different silhouettes, continuous fuselage, attached engine sockets, identifiable nozzles, readable DILI visor, and approximately 5k or fewer craft triangles with reusable effect buffers.

Verification: geometry budget/finite-attribute checks pass for Skimmer (2,784 triangles), Needle (2,656), and Comet (3,384), all four material batches. Chrome production-build checks covered all three craft, touch boost, keyboard scan, battery failure/results, pause/resume and stage switching at 1280×720 and 391×844 CSS viewports. Needle nozzle placement was corrected after visual QA on Low. Sampled warmed frames ranged 55–83 FPS; one transition/scan sample fell to 48 FPS. These are local Chrome measurements, not a universal 60 FPS guarantee or physical-phone certification. Lint, formatting, production build and all 36 movement-limited course simulations pass. No additional runtime dependencies or real-time light sources were added.

## Vertical flight and graphic UI — October 1, 2026

- Expand the authored route to 1.8 km with four acts, power pickups, vertical aperture gates and rotating mechanical obstacles. Target a 2-minute skilled run; rebalance battery and scoring.
- Add Q/E climb/dive and matching touch controls. Share collision paths and the simulation clock with obstacle visuals.
- Extend the harbor with lift, turbine and receiver architecture using merged geometry and visibility culling.
- Rebuild menu/logo and result with diagonal plates, ink outlines, halftone texture, Dili art and compact stats. Preserve profiles, language and PNG export.
- Scope best-time records to course length so old short-map times cannot block new 1.8 km records. Preserve profile, best score and run counts.
- Verify reachable routes, desktop/mobile controls, completion, pause/retry, card download, console, lint and production build before pushing and deploying.

Verification: `test:course` passes 36 movement-limited simulations (three stages, twelve seeds), including two-axis gate clearance, rotor contacts, booster pickup, the receiver's 3D radius and idle-run failure. Skilled simulated runs finish in approximately 114 seconds; this is reachability evidence, not a human playtest. Browser QA verified touch climb/dive altitude changes, boost input, scan cooldown, pause/resume, obstacle battery/privacy damage, battery failure, retry, stage selection and a real 1080 × 1350 PNG download. Actual 391px-wide menu/results fit without horizontal document overflow; exported text stays inside the frame. Sampled warmed-up local rendering was approximately 55–83 FPS on Low with adaptive resolution; initial shader warmup was slower. Physical phones and other browser engines were not tested. Browser logs contained extension errors and nonfatal Three.js/shader warnings, with no observed app-origin errors. End animations now stop continuous 3D rendering after 0.6 seconds on failure or 1.8 seconds on delivery; the sky follows the camera across the full course.

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

## Flight repair verification — October 1, 2026

- Verified 108 full-course movement simulations across three stages and twelve seeds: expert pilots, cruise pilots reacting every 0.4 seconds with alternate boosters omitted from guidance, and the same delayed pilots at 30 FPS. The delayed cruise pilots finish with battery remaining; an idle pilot still fails. Added checks for brake priority, keyboard priority and release damping.
- ESLint, strict TypeScript production build and the audio lifecycle regression check pass. Browser checks cover menu, briefing, scan cooldown, pause/resume via button and Escape, battery depletion and retry. At 390 x 844 the climb button changes altitude and release holds it; controls and the direction cue fit the viewport. At 1280 x 720 the desktop key diagram and 3D guide are visible.
- Local in-app browser samples on Low were approximately 160 FPS. These are observations on this desktop, not physical-phone or cross-browser benchmarks. Full successful runs were simulated; no manual full-course success is claimed. The observed browser console has no app errors, with a dependency warning about deprecated THREE.Clock.

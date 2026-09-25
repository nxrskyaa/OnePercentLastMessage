# Rendering audit — 25 September 2026

## Baseline

- Next 16.3.6, React 19.3.0, Three 0.186.1, React Three Fiber 9.8.0.
- The Canvas currently creates a WebGLRenderer through R3F. Camera FOV is 70, far plane 1100, DPR is 1 / 1.3 / 1.6 by quality.
- A legacy `@react-three/postprocessing` EffectComposer adds bloom except on low quality. This cannot be carried into WebGPURenderer.
- No ShaderMaterial, RawShaderMaterial, `onBeforeCompile`, custom render targets, shadow maps, or shadow-casting lights exist. Materials are basic/points/line materials.
- Scene: one network line buffer, one instanced ring mesh (22 high), one instanced satellite mesh (80 high), one ambient point field (240 high), around 14 gameplay nodes, one player, one destination, and a scan mesh.
- Particle count is 240 ambient points plus five discrete player trail meshes; no GPU simulation exists.
- Baseline `npm run lint` and `npm run build` both passed. Live menu at the existing Vercel URL rendered without a blank canvas. A screenshot was inspected on 25 September.

## Cost and compatibility

- Estimated normal-frame draw calls: roughly 45–65 visible objects near the first route, plus the legacy bloom passes. This is a source-based estimate, **not** a renderer measurement. Exact calls, triangles, and FPS were not exposed by the existing app; development telemetry will be added before claiming measured values.
- CPU: five `useFrame` hooks are small; the player loop checks each generated node every frame. Zustand HUD samples are capped to about 12.5 Hz. No per-frame React state write occurs in the world.
- GPU: basic meshes are cheap, but many local point lights and individually drawn node rings can dominate as structure density rises. Transparent rings/particles and bloom cause overdraw. DPR 1.6 can be costly on laptops.
- Migration risks: R3F must receive an asynchronously initialized WebGPURenderer; existing EffectComposer is incompatible; WebGPU shader compilation may delay first frame; WebGL2 fallback must render the same materials and scene. Verify both backend paths in browser before raising density.
- Existing built-in materials need no shader migration. New animated surfaces should use Three TSL/NodeMaterial and be shared by WebGPU and WebGL2 backends.

## Strategy

1. Boot WebGPURenderer through the installed R3F async `gl` factory, retaining graceful WebGL2 fallback and visible error UI.
2. Replace EffectComposer with Three RenderPipeline and a restrained TSL bloom path.
3. Build a reusable structural kit and authored regions with instanced and buffered geometry, preserving the route coordinates and collision logic.
4. Add shared TSL materials, traffic, player/destination detail, and world responses without per-frame React rerenders.
5. Inspect real browser screenshots and telemetry, tune quality and correct regressions before release.

No renderer rewrite or gameplay replacement is planned.

## Performance recovery, 25 September

The baseline above predates the WebGPU visual pass. A follow-up check reproduced the current complaint in the WebGL2 compatibility backend at 1280×720: the Medium preset ran around 41–52 FPS in the local browser, with 181 draw calls. Low reached roughly 65–74 FPS. These are observed development-browser readings on one machine, not device benchmarks.

The expensive path was rendering through the offscreen post pipeline even when bloom was disabled, combined with animated fragment work on every large structural surface, several permanently active landmark lights, a high pixel ratio, and a slow four-second quality check. Relay frames also submitted many small meshes separately.

The recovery pass renders directly when bloom is inactive, reserves animated shader work for the thin signal surfaces, uses one active zone light, merges each relay frame into two meshes, and starts Auto on Low for WebGL2 and narrow screens. Auto samples every 1.5 seconds, reduces resolution quickly, and does not upscale during a run. Manual presets also reduce resolution when needed, and switch to Low after sustained severe slowdown. Base DPR is 0.9 / 1.0 / 1.25 for Low / Medium / High.

After these changes, the same local browser showed WebGL2 Auto/Low around 138 FPS at the start of desktop gameplay and 112–165 FPS in an emulated 360×800 portrait viewport. WebGPU Medium ranged roughly 103–131 FPS during the sampled desktop run. Values vary with scene position and browser focus. Physical Android/iOS hardware remains unverified.

The art correction makes the receiver beacon readable at distance, adds physical cyan/amber branch decks and flowing cable conduits, improves the opening's warm/cool silhouette, and brings the packet closer to camera with a folded seal shape. These use a small number of additional meshes while the relay merge offsets their draw-call cost.

## Mobile correction, 25 September

The first recovery's FPS numbers were from a desktop GPU with a narrow browser viewport. They did not measure a phone GPU. The mobile tier now disables hardware antialiasing, starts at 0.8 internal pixel ratio, can reduce to 55% of that ratio under sustained load, and avoids creating the bloom pipeline entirely. Broad infrastructure and most signal details use standard/basic materials in Low instead of compiling TSL effects for every surface. Gates share frame geometry, merge their marker strips, and omit nonessential lights and meshes in Low. Auto quality no longer raises resolution during a run.

The score was previously two sustained oscillator notes. A short original music loop now plays after the first user gesture, with the existing Web Audio cues preserved. A moving transfer carrier, counter-rotating foundry drums, flowing deck signals, and boost-responsive packet fins add scene motion without a large particle budget. `?perf=1` is available in production to diagnose a specific device; its measurements are still browser estimates, and physical-device performance must be confirmed on the affected hardware.

The receiver now has a three-mesh far silhouette and only renders its full machinery nearby. Landmark zones are culled beyond 330 units and after passing, while relay strips share cached geometry. In the local production browser at 360×800 on the forced WebGL2 Low path, opening scene draw calls fell from about 154 to about 100. The actual phone GPU and browser remain unknown. Mobile always caps runtime quality at Low, even if an older saved setting requests High; the settings panel explains that cap.

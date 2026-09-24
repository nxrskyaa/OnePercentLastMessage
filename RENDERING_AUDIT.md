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

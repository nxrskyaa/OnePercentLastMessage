# Signal Void visual overhaul

The existing game loop, routes, menus, mission flow, settings, and results remain the source of truth. Each phase ends with a playable browser check, lint, and production build.

| Phase             | Work                                                                                                           | Main files                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Renderer       | Async WebGPURenderer in R3F; WebGL2 backend fallback; startup/error state and backend telemetry                | `src/components/game/GameCanvas.tsx`, `src/components/ui/GameApp.tsx`, `src/rendering/capabilities.ts`                                                    |
| 2. Materials/post | Reusable TSL data and energy materials, RenderPipeline bloom, controlled exposure                              | `src/rendering/materials.ts`, `src/components/game/PostProcessing.tsx`, `src/components/game/NetworkWorld.tsx`                                            |
| 3. World          | Four depth layers; authored route structures, distant megastructure, instanced detail, packet highways         | `src/components/game/NetworkWorld.tsx`, new `src/components/game/SignalStructures.tsx`, new `src/components/game/PacketTraffic.tsx`, `src/game/config.ts` |
| 4. Actors         | Layered packet, structural destination hub, differentiated relay and tracker geometry                          | `src/components/game/Player.tsx`, `Destination.tsx`, `NodeManager.tsx`                                                                                    |
| 5. Response       | Scan illumination, boost/critical/hit feedback, success/failure scene response                                 | `ScanPulse.tsx`, `Player.tsx`, `ChaseCamera.tsx`, shared material state                                                                                   |
| 6. Performance/QA | Working quality presets, adaptive resolution, opt-in development telemetry; browser visual and complete-run QA | `QualityMonitor.tsx`, `settingsStore.ts`, `SettingsMenu.tsx`, new telemetry component, docs                                                               |

Acceptance: WebGPU on a supported browser; working WebGL2 fallback; scene with readable foreground, gameplay, megastructure, and distant network; live traffic; no feature regressions; production build clean. Advanced AO, temporal AA, raw WGSL, and compute will be used only if they improve the actual scene and remain stable on fallback.

## Implemented and checked

- Async WebGPURenderer booted on the local browser; forced WebGL2 backend also rendered the same scene.
- Replaced EffectComposer with RenderPipeline/TSL bloom. Removed its unused package.
- Added TSL data/energy materials, shared scan/boost/critical/outcome uniforms, a structural kit, region accents, relay arrays, monumental hub, packet shell, scanner sweeps, and GPU vertex-animated packet traffic.
- Added view-distance culling for gameplay nodes, instanced destination spokes, frame-based auto resolution, and development-only metrics.
- Browser-tested menu, briefing, gameplay HUD, scan, tracker collision, both renderer backends, low quality setting, loss/retry, and a full secure-route delivery with 0.07% battery and 100% privacy. The existing gameplay systems were preserved.

On a local development-browser sample at 1280×720, medium quality showed roughly 70–80 FPS, around 90 draw calls, and about 43k triangles in the menu. These are environment-specific frame samples, not a cross-device benchmark. High quality uses 3,600 traffic streaks; a higher count offered little visible benefit at this viewport. Compute, AO, temporal AA, and motion blur were omitted because the current TSL vertex animation and scene composition provide a better performance/clarity tradeoff.

# Presentation and gameplay upgrade

## Existing baseline

The committed first playable already has a procedural R3F network, packet movement, chase camera, battery drain, destination collision, pause, success/failure, retry, and a local best time. Those systems remain the foundation. The current menu and results are minimal; privacy, scan, mission variation, interactive nodes, audio, and scoring do not yet exist.

## Reuse and changes

| Existing part                         | Decision                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Player.tsx`                          | Keep movement, battery, and destination checks; add node collisions, scan, and event feedback inside the same frame loop. |
| `ChaseCamera.tsx`                     | Keep chase behavior; add slow menu motion and settings-controlled shake/motion.                                           |
| `NetworkWorld.tsx`, `Destination.tsx` | Reuse geometry; add route and node visuals in small components.                                                           |
| `GameCanvas.tsx`                      | Keep one Canvas; coordinate boot readiness and adjustable render quality.                                                 |
| `gameStore.ts`                        | Extend one phase state and run data; preserve working pause/retry semantics.                                              |
| `GameApp.tsx`                         | Split into focused shell, menus, HUD, tutorial, and result components.                                                    |
| `globals.css`                         | Retain the dark cyan visual language and replace the prototype layouts with a consistent game UI.                         |

## Implementation order

1. **Shell:** loading until Canvas is ready, first-visit NXR ident and title reveal, main menu, briefing, countdown, pause, return to menu. No fabricated progress bar.
2. **Onboarding:** first-run guide, how-to-play view, persistence, returning-player skip.
3. **Core depth:** authored network nodes, privacy, scan, route choice, perfect relays, near misses, boosters, tips and combos, short DILI advice. Keep one player loop and distance-based collision.
4. **Settings and sound:** versioned safe storage; synthesized audio with actual volume controls; quality and visual settings that change rendering; fullscreen with browser fallback.
5. **Results and creator identity:** scoring, achievements, bests/history, copy result, About/Credits, provided creator links, metadata and preview art.
6. **Polish and QA:** restrained transitions, critical-battery feedback, responsive desktop layout, keyboard flow, refresh/tab behavior, corrupted storage, lint/build, production browser playthrough.

## Guardrails

- Keep per-frame position and velocity in refs. Sample only HUD values into Zustand.
- Keep menus, briefings, and the player on one Canvas; the simulation runs only in `playing`.
- Every tutorial item, setting, stat, and award must have a real corresponding behavior. Omit any optional item that cannot be made functional.
- Preserve a working build after each major pass.

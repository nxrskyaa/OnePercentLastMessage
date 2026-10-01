# Launch verification — October 1, 2026

## Game checks

| Check                                 | Result                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ESLint                                | Pass                                                                                              |
| Prettier                              | Pass                                                                                              |
| Next.js production build / TypeScript | Pass                                                                                              |
| Course reachability                   | 108 passes: three stages, twelve seeds, expert and delayed pilots, plus 30 Hz runs                |
| Idle flight                           | Battery depletion correctly fails                                                                 |
| Craft geometry                        | Three hulls, four material batches each, 2,656–3,384 triangles                                    |
| Audio lifecycle harness               | Gesture unlock, phases, mute, volume, visibility, late promises, fallback and cleanup pass        |
| Production HTTP                       | `/` responds 200; development-only `/capture` responds 404                                        |
| Compact result screen                 | At 1280 × 720, identity, rank, score, stats and awards fit the result panel after the spacing fix |

Two recorded Tidal demonstrations reached the receiver with normal collisions, battery drain and scoring. The film take finished in 1:52.56, with 0.69% battery, 100% privacy and 20,398 points. The screenshot take finished in 1:52.53 with 20,400 points. Prism and Solar recordings are excerpts.

Earlier gameplay repair QA covered scan, keyboard climb/release, braking, pause/resume, battery failure and retry. The browser run uses scripted input; the reachability tests are simulations. Neither substitutes for human or physical-phone testing.

## Film checks

- 993 video frames at 30 FPS; H.264, 1920 × 1080, YUV 4:2:0. Container duration is approximately 33.109 seconds including audio padding.
- AAC stereo, 48 kHz. Integrated loudness is **−17.78 LUFS**, with **−4.38 dBTP** true peak and 6.6 LU loudness range. The mix has headroom; it has not been limited to maximum loudness.
- Full FFmpeg decode completes without errors.
- The exported MP4 played through to its 33.109-second end in the in-app browser, with audio unmuted, readyState 4 and no media error. Studio reported no composition error or console error.
- Nine exported frames cover the opening, every flight cut and the closing. Logo, message, captions, stats and play URL remain within the frame. The SVG title's intrinsic size was increased for a sharp export without changing its artwork.
- The final approach cut ends before the close camera passes through the receiver sculpture. Delivery is shown through the recorded result statistics and an editorial closing.
- Music is the game's original Afterglow Dispatch score. Original synthesized notification, engine, scan, relay and delivery cues are placed on the edit timeline.

## Limits

Performance depends on the browser, hardware and quality setting. No universal 60 FPS, bug-free or all-browser certification is claimed. Browser console warnings from extensions and the dependency's deprecated Three.Clock are separate from app errors. Profile-image exports may fall back to initials if the remote host blocks cross-origin loading.

The launch video is a cinematic gameplay demonstration with editorial typography and telemetry overlays. It does not show the complete in-game HUD or every mechanic.

## Touch analog update — October 1

- Replaced directional buttons with a radial analog stick; steering and climb/dive are proportional and can be combined with held Nitro, Thrust or Brake.
- Browser drag moved altitude from 0.0 to +1.0; the stick returned to center after release. Pause/resume removed and restored controls.
- Inspected 390 × 844 portrait, 844 × 390 landscape and 820 × 1180 tablet layouts. Measured stick and navigation bounds are separated; actions stay within the viewport.
- Touch layouts also activate with `any-pointer: coarse` for larger touchscreen tablets. Physical-device multitouch was not available in this session.
- Input assertions cover analog diagonals, Nitro with both axes, keyboard priority and clearing on pause. Existing course simulations, lint and production build pass.
- Dragging updates mutable input and the knob directly, without a React render on every pointer movement.

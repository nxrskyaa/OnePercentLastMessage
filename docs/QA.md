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

## Dlicom feedback update — October 2

- Persistent corner Dlicom/DILI dock uses the supplied logo and mascot; desktop and 390-pixel portrait inspected. The dock sits above touch actions.
- Selected Lagoon in the hangar: paint/trim/metal/exhaust changed in the actual 3D craft; refresh retained the selected livery. Four liveries are available in the hangar and Settings.
- A hands-off flight stopped before a moving gate, speed 0. It stayed there as time advanced, with one impact penalty. Analog climb/steer aligned the craft and resumed flight at normal cruise speed. The final stand-off keeps the craft nose in front of the panel.
- Swept collision assertions cover nitro overshoot, side/top panels, release after alignment and rotor perimeter bypass. Simulations now use the same blocking helper as the live player.
- Added two static alignment gates, at -365 and -705, while keeping the first 20 seconds forgiving. 108 expert and delayed-input course simulations pass across all three stages.

## Mobile menu layout repair — October 2

- Replaced the fixed-height overlapping mobile hangar with document-flow sections: craft/mascot, skin controls, then route preview. The route selector and footer follow below.
- Inspected 360 × 740, 390 × 844, 844 × 390 and 820 × 1180. Measured craft, skins, map and stage bounds are vertically separated; document width matches each viewport. Menu scroll makes all controls reachable.
- Selected Prism/Needle and Orchid through the mobile menu. Both selections update, with room for the craft name and mascot.
- Small-phone utility buttons use two columns and at least 44-pixel targets. Desktop composition remains outside this media query.
- Lint and production build pass. These checks use browser viewports, not a physical-phone test.

## October 3 reviewer update

- New relay-frame collision tests use shared polygon dimensions. Contact subtracts 150 points, 0.012% battery and 3% privacy once per crossing. Panel and tracker receipts now expose existing negative points.
- 180 full-course simulations pass: 108 normal/expert/delayed pilots and 72 intermittent-nitro pilots across three stages and twelve seeds, including 30Hz runs. The simulator applies rim damage. Additional 30/60/144Hz checks cover proportional controls and fast input release at cruise, nitro and maximum public-burst speed.
- Audio harness verifies that one motor/air layer is reused, fades on boost release, and respects pause, mute, SFX volume, hidden tabs and shutdown. Autoplay failure remains nonfatal.
- Local browser: a blocked gate remained at 1256m with 85% privacy across subsequent observations, proving the hit did not repeat each frame; analog drag raised altitude from +0.0 to +0.5. New score/resource detail is present in the HUD. At 390 x 844 the document width is 390px; no app console errors were observed.
- Local desktop sample: around 100 FPS, Medium/WebGL2. This is a desktop observation, not a physical-phone benchmark. Manual full-course success and cross-browser audio audition were not performed in this pass.

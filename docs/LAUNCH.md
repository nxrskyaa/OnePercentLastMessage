# Launch and jam submission

**Play:** https://last-message-lac.vercel.app/

**Source:** https://github.com/nxrskyaa/OnePercentLastMessage

## Tonight's launch

1. Open the live link in a fresh browser tab. Check Transmit, the PC key guide, touch controls, Scan, Pause and Retry. Use Low quality if a device struggles.
2. Upload the introduction/gameplay MP4 to X with the paragraph in [X_POST.md](X_POST.md). Keep the game link and **@DlicomApp** mention.
3. Copy the published X post's link into Dlicom's **#game-jam** Discord channel. An X post alone does not complete the submission.
4. Keep the game publicly available for testing. Gather specific feedback and ship fixes before judging closes.

## Official requirements, checked October 1, 2026

The [September 22 announcement](https://x.com/DlicomApp/status/2102405364369039842) requires a new, free browser game made for the jam, a working game link in an X post tagging @DlicomApp, and that post shared in #game-jam. Judging considers playability, originality, execution and Dlicom fit. Social engagement does not determine the score.

The [September 25 FAQ](https://x.com/DlicomApp/status/2103516401679909327) clarifies that games must have started on or after September 22; genre inspiration is permitted, copying others' code or art is not. It also recommends phone testing. Its multiple-entry wording differs from the original announcement; this launch submits only this game, so that difference does not affect the submission.

**Submission / judged build deadline:** October 5, 2026, 23:59 UTC = **October 6, 2026, 06:59 WIB**. Winners are announced October 7. The live version at the deadline is the version judged.

No wallet connection, transaction signing, seed phrases, private keys, payments or paid access are allowed in the game. The app uses optional local player identity, without an account backend. Profile-image links are loaded from the URL the player supplies; a fallback is used if an image cannot be included in an exported card.

## Package contents

- README: project overview, playable link and screenshots.
- [Player guide](PLAYER_GUIDE.md): controls, route reading and survival tips.
- [Technical notes](TECHNICAL.md): architecture, setup, checks and deployment.
- [Credits and asset provenance](CREDITS.md): art, soundtrack and AI assistance.
- [X launch post](X_POST.md): ready to copy.
- [Launch verification](QA.md): checks and their practical limits.
- [Release notes](RELEASE_NOTES.md): downloadable assets and playable link.
- `launch-video/`: editable Remotion source and capture instructions.

## Verification scope

The flight repair passed 108 full-course control simulations across three stages and twelve seeds, including pilots with delayed reactions and missed pickups, plus 30 Hz simulation. Browser checks covered scan, climb/release, pause/resume, depletion and retry. Those are not a guarantee for every phone or browser; report device-specific issues with the browser, quality setting and stage.

The film's footage is recorded from the actual game renderer with scripted input, ordinary collisions, resource drain and scoring. Editorial cuts and typography are added in Remotion; the film is a gameplay demonstration, not an uninterrupted human speedrun.

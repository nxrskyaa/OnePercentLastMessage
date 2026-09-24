# 1% — Last Message

One battery percent. One message left. Fly an encrypted packet through a dark communication network and reach Mom before the signal dies.

Built for the Dlicom AI Game Jam. The current milestone is a playable core loop; the route and risk systems are tracked in [PLAN.md](PLAN.md).

## Gameplay

Press **TRANSMIT** to start. The packet moves forward automatically, but cruise speed alone will not reach the receiver before the 1.00% battery runs out. Accelerate with W/Up; boost reaches higher speed at a steep battery cost. The chase camera follows the packet through a procedural network corridor. Success and signal loss both lead to an immediate retry option.

## Controls

| Key                   | Action                    |
| --------------------- | ------------------------- |
| W / Up                | Accelerate                |
| S / Down              | Brake                     |
| A / D or Left / Right | Steer                     |
| Shift                 | Boost (uses more battery) |
| Escape                | Pause / resume            |

## Technology

Next.js App Router, TypeScript, React, Three.js, React Three Fiber, Zustand, Tailwind CSS, ESLint, and Prettier. Drei and React Three Postprocessing are installed for later polish. The current scene uses procedural geometry and requires no downloaded assets, external AI service, wallet, or database.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000> in a desktop browser.

## Verify and build

```bash
npm run lint
npm run build
npm run start
```

## Deploy

Push the repository to GitHub, then import it into Vercel as a Next.js project. The default `npm install` and `npm run build` commands are sufficient. No environment variables are required for the first playable. `.env.local` is ignored; `.env.example` documents configuration.

## Project structure

| Path                     | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `src/app`                | App Router page, metadata, and styles                  |
| `src/components/game`    | Canvas, packet, chase camera, environment, destination |
| `src/components/ui`      | Menu, HUD, pause, and results                          |
| `src/game/config.ts`     | Movement, camera, battery, and world tuning            |
| `src/store/gameStore.ts` | Run phase and HUD samples                              |
| `src/hooks`              | Keyboard input                                         |

## Presentation assets

Screenshots and a short gameplay clip will be added after the branching route and visual polish milestones.

## Credits

Game design and implementation for the Dlicom AI Game Jam. All visuals in this milestone are procedural.

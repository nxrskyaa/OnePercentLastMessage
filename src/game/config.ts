/** All first-playable tuning lives here. Distances are Three.js world units. */
export const GAME_CONFIG = {
  destination: { z: -640, radius: 13, name: "MOM" },
  battery: {
    start: 1,
    drainPerSecond: 0.0145,
    boostExtraDrainPerSecond: 0.031,
  },
  movement: {
    cruiseSpeed: 8.7,
    accelerateSpeed: 14.5,
    brakeSpeed: 3.8,
    boostSpeed: 23,
    speedResponse: 3.8,
    lateralSpeed: 13,
    lateralResponse: 7,
    lateralLimit: 15,
    bankAmount: 0.18,
  },
  camera: { baseFov: 70, boostFov: 79, followResponse: 3.8, lookAhead: 22 },
  world: { fogDensity: 0.00115, ringCount: 22, particleCount: 240 },
} as const;

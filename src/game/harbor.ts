import type { StageDefinition } from "./stages";

/** Authored environmental beats; the navigable flight corridor remains x = -15..15. */
export const HARBOR = {
  waterY: -16,
  reflectionSize: 512,
  reflectionInterval: 2,
  springStiffness: 18,
  springDamping: 4.8,
  lightStops: Array.from({ length: 16 }, (_, i) => -58 - i * 110),
  districts: [
    { z: -48, x: -56, radius: 29, tower: 38 },
    { z: -210, x: 60, radius: 32, tower: 62 },
    { z: -370, x: -64, radius: 39, tower: 47 },
    { z: -540, x: 72, radius: 45, tower: 82 },
    { z: -740, x: -57, radius: 30, tower: 56 },
    { z: -920, x: 61, radius: 34, tower: 43 },
    { z: -1110, x: -67, radius: 38, tower: 66 },
    { z: -1300, x: 62, radius: 32, tower: 42 },
    { z: -1480, x: -55, radius: 31, tower: 76 },
    { z: -1670, x: 68, radius: 39, tower: 55 },
  ],
} as const;

export function dockHeight(z: number) {
  return Math.sin(z * 0.019) * 2.3 + Math.sin(z * 0.047) * 0.75;
}

export function harborHorizon(stage: StageDefinition) {
  return stage.motif === "sails"
    ? "#3f657b"
    : stage.motif === "prisms"
      ? "#715b87"
      : "#a57878";
}

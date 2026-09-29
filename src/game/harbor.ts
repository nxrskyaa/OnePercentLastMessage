import type { StageDefinition } from "./stages";

/** Authored environmental beats; the navigable flight corridor remains x = -15..15. */
export const HARBOR = {
  waterY: -16,
  reflectionSize: 512,
  reflectionInterval: 2,
  springStiffness: 18,
  springDamping: 4.8,
  lightStops: [-58, -132, -208, -284, -362, -442, -520, -592],
  districts: [
    { z: -48, x: -56, radius: 29, tower: 38 },
    { z: -126, x: 60, radius: 32, tower: 62 },
    { z: -222, x: -64, radius: 39, tower: 47 },
    { z: -320, x: 72, radius: 45, tower: 82 },
    { z: -425, x: -57, radius: 30, tower: 56 },
    { z: -538, x: 61, radius: 34, tower: 43 },
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

/** Presentation never advances battery, course time or collision state. */
export const PRESENTATION = {
  identMs: 2400,
  titleMs: 3600,
  reducedIdentMs: 400,
  reducedTitleMs: 900,
  menuFps: 30,
  previewZ: -70,
} as const;

export const presentationState = {
  introTime: 0,
  phaseTime: 0,
  time: 0,
  pointer: { x: 0, y: 0 },
};

export function easeShot(time: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function introDistance(time: number) {
  return -18 - 52 * easeShot(time, 0.7, 5.2);
}

export function introIgnition(time: number) {
  return easeShot(time, 0.6, 1.4) * (1 - easeShot(time, 3.8, 6));
}

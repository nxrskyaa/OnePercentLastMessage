import { GAME_CONFIG } from "./config";

export const COURSE_ACTS = [
  {
    at: 0,
    name: "THE DEPARTURE",
    nameId: "KEBERANGKATAN",
    mark: "01",
    tip: "Q / E · CLIMB / DIVE",
    tipId: "Q / E · NAIK / TURUN",
  },
  {
    at: 410,
    name: "SKY LOCKS",
    nameId: "KUNCI LANGIT",
    mark: "02",
    tip: "FOLLOW THE BRIGHT APERTURE",
    tipId: "IKUTI CELAH TERANG",
  },
  {
    at: 880,
    name: "THE ENGINE ROOM",
    nameId: "RUANG MESIN",
    mark: "03",
    tip: "READ THE ROTATING BLADES",
    tipId: "BACA PUTARAN BILAH",
  },
  {
    at: 1370,
    name: "LAST APPROACH",
    nameId: "PENDEKATAN TERAKHIR",
    mark: "04",
    tip: "KEEP YOUR SIGNAL ALIVE",
    tipId: "JAGA SINYALMU TETAP HIDUP",
  },
] as const;

export function courseAct(distance: number) {
  const travelled = Math.abs(GAME_CONFIG.destination.z) - distance;
  return COURSE_ACTS.findLast((act) => travelled >= act.at) ?? COURSE_ACTS[0];
}

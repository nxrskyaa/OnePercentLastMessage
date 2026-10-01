export type CraftKind = "skimmer" | "needle" | "comet";
export type CraftSocket = [number, number, number];
export interface CourierCraft {
  kind: CraftKind;
  name: string;
  paint: string;
  trim: string;
  metal: string;
  visor: string;
  exhaust: string;
  engines: CraftSocket[];
  wings: Array<[number, number]>;
  sections: Array<[number, number, number]>;
}

/** Original craft silhouettes; coordinates are local, nose -Z, nozzles +Z. */
export const COURIER_CRAFTS: CourierCraft[] = [
  {
    kind: "skimmer",
    name: "SKIMMER",
    paint: "#e7f1e9",
    trim: "#387a99",
    metal: "#a17750",
    visor: "#14344f",
    exhaust: "#58d6ff",
    engines: [
      [-1.23, -0.25, 1.75],
      [1.23, -0.25, 1.75],
    ],
    wings: [
      [0.52, -1.45],
      [1.05, -1.2],
      [2.4, 0.75],
      [2.1, 1.12],
      [0.8, 0.5],
    ],
    sections: [
      [-2.85, 0.03, 0.03],
      [-2.5, 0.3, 0.26],
      [-1.6, 0.68, 0.46],
      [-0.6, 0.82, 0.55],
      [0.65, 0.68, 0.5],
      [1.25, 0.48, 0.38],
      [1.3, 0, 0],
    ],
  },
  {
    kind: "needle",
    name: "NEEDLE",
    paint: "#d3c5ee",
    trim: "#584585",
    metal: "#9ea8c0",
    visor: "#242346",
    exhaust: "#b9a0ff",
    engines: [
      [-0.91, -0.2, 1.6],
      [0.91, -0.2, 1.6],
    ],
    wings: [
      [0.28, -2.35],
      [0.55, -1.5],
      [2.5, 1.4],
      [0.45, 0.82],
    ],
    sections: [
      [-3.6, 0.015, 0.015],
      [-2.4, 0.25, 0.27],
      [-1.3, 0.56, 0.39],
      [0.1, 0.61, 0.44],
      [1.08, 0.45, 0.37],
      [1.15, 0, 0],
    ],
  },
  {
    kind: "comet",
    name: "COMET",
    paint: "#ffe0b1",
    trim: "#bc594a",
    metal: "#9c7653",
    visor: "#244946",
    exhaust: "#ffa85d",
    engines: [
      [-1.38, -0.15, 1.5],
      [1.38, -0.15, 1.5],
      [0, -0.55, 2.0],
    ],
    wings: [
      [0.42, -1.85],
      [1.8, -0.8],
      [2.55, 0.8],
      [2.32, 1.45],
      [0.6, 0.75],
    ],
    sections: [
      [-2.6, 0.03, 0.03],
      [-2.1, 0.62, 0.33],
      [-1, 1.04, 0.48],
      [0.4, 0.98, 0.5],
      [1.5, 0.63, 0.42],
      [1.6, 0, 0],
    ],
  },
];
export function craftAt(stageIndex: number) {
  return COURIER_CRAFTS[((stageIndex % 3) + 3) % 3];
}

export interface StageDefinition {
  id: string;
  number: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  sky: [string, string, string];
  channel: [string, string, string, string];
  current: [string, string, string];
  relief: [string, string, string];
  accent: string;
  accentSoft: string;
  motif: "sails" | "prisms" | "halos";
}

export const STAGES: readonly StageDefinition[] = [
  {
    id: "tidal-conduit",
    number: "01",
    name: "TIDAL CONDUIT",
    nameId: "KONDUIT PASANG",
    description: "A current carved through the open signal sea.",
    descriptionId: "Arus sinyal yang terukir di samudra data.",
    sky: ["#293b6e", "#4a68a6", "#94a1c7"],
    channel: ["#4d6fb1", "#6885c9", "#384e99", "#5673b5"],
    current: ["#275ba6", "#5cb4d1", "#b6e7e0"],
    relief: ["#3f63ae", "#7b9bd3", "#9c91c8"],
    accent: "#bdeaff",
    accentSoft: "#9f9ad4",
    motif: "sails",
  },
  {
    id: "prism-archive",
    number: "02",
    name: "PRISM ARCHIVE",
    nameId: "ARSIP PRISMA",
    description: "A crystalline vault of stored transmissions.",
    descriptionId: "Ruang kristal tempat pesan lama tersimpan.",
    sky: ["#2e3868", "#7467a9", "#b2a0c7"],
    channel: ["#555497", "#8580c0", "#424a86", "#8f8dc2"],
    current: ["#534f9c", "#927fcd", "#d8c2f1"],
    relief: ["#565aa0", "#aca8e1", "#e1bfde"],
    accent: "#e7d4ff",
    accentSoft: "#d3a9ec",
    motif: "prisms",
  },
  {
    id: "solar-relay",
    number: "03",
    name: "SOLAR RELAY",
    nameId: "RELAI SURYA",
    description: "The last warm channel before the receiver.",
    descriptionId: "Jalur terakhir yang hangat sebelum penerima.",
    sky: ["#263b65", "#7b6c8d", "#d7a991"],
    channel: ["#49629b", "#9a7aa5", "#4d5488", "#ba8e9e"],
    current: ["#355b94", "#a57f9c", "#f3cfac"],
    relief: ["#635f9b", "#caa5b3", "#f2cfac"],
    accent: "#ffe3b2",
    accentSoft: "#eeb8aa",
    motif: "halos",
  },
];

export function stageAt(index: number): StageDefinition {
  return STAGES[((index % STAGES.length) + STAGES.length) % STAGES.length];
}

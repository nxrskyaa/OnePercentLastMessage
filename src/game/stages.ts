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
    sky: ["#13264b", "#294773", "#758eb2"],
    channel: ["#2c4c78", "#42658a", "#253b68", "#54738f"],
    current: ["#20476f", "#3e91aa", "#9ad6d5"],
    relief: ["#29456e", "#6785a4", "#a29ab4"],
    accent: "#a9e9ef",
    accentSoft: "#efb88c",
    motif: "sails",
  },
  {
    id: "prism-archive",
    number: "02",
    name: "PRISM ARCHIVE",
    nameId: "ARSIP PRISMA",
    description: "A crystalline vault of stored transmissions.",
    descriptionId: "Ruang kristal tempat pesan lama tersimpan.",
    sky: ["#211d43", "#4d426d", "#937eaa"],
    channel: ["#423b70", "#66578d", "#343560", "#817197"],
    current: ["#35376d", "#7567a7", "#c9b3db"],
    relief: ["#45406d", "#8c7da8", "#c09ba9"],
    accent: "#e2cbf6",
    accentSoft: "#f0aa95",
    motif: "prisms",
  },
  {
    id: "solar-relay",
    number: "03",
    name: "SOLAR RELAY",
    nameId: "RELAI SURYA",
    description: "The last warm channel before the receiver.",
    descriptionId: "Jalur terakhir yang hangat sebelum penerima.",
    sky: ["#1a2d50", "#5e5979", "#bf9582"],
    channel: ["#3e557d", "#816f8d", "#3a476e", "#ab8588"],
    current: ["#365c7b", "#ab857c", "#f0cbab"],
    relief: ["#485877", "#a38a94", "#dcc1a2"],
    accent: "#ffdfa9",
    accentSoft: "#9cddd5",
    motif: "halos",
  },
];

export function stageAt(index: number): StageDefinition {
  return STAGES[((index % STAGES.length) + STAGES.length) % STAGES.length];
}

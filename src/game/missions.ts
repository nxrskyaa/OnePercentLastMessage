export interface Mission {
  id: string;
  source: string;
  message: string;
  objective: string;
  receiver: string;
}

export const MISSIONS: Mission[] = [
  {
    id: "mom",
    source: "MOM",
    message: "where are you?",
    objective: "Send one last reply.",
    receiver: "MOM",
  },
  {
    id: "nxr",
    source: "NXR LABS",
    message: "production is down",
    objective: "Deliver the deploy key.",
    receiver: "NXR LABS",
  },
  {
    id: "gm",
    source: "DILI ROOM #781",
    message: "gm?",
    objective: "Deliver one final gm.",
    receiver: "DILI ROOM",
  },
  {
    id: "private",
    source: "PRIVATE ROOM",
    message: "they're watching this route",
    objective: "Deliver the warning intact.",
    receiver: "PRIVATE ROOM",
  },
  {
    id: "creator",
    source: "CREATOR ROOM",
    message: "support received",
    objective: "Confirm the tip.",
    receiver: "CREATOR ROOM",
  },
  {
    id: "sister",
    source: "SISTER",
    message: "made it home?",
    objective: "Tell her you're safe.",
    receiver: "SISTER",
  },
  {
    id: "station",
    source: "STATION 04",
    message: "last train leaving",
    objective: "Send your location.",
    receiver: "STATION 04",
  },
  {
    id: "friend",
    source: "OLD FRIEND",
    message: "still awake?",
    objective: "Send the answer you owe.",
    receiver: "OLD FRIEND",
  },
  {
    id: "crew",
    source: "NIGHT CREW",
    message: "door code changed",
    objective: "Deliver the new code.",
    receiver: "NIGHT CREW",
  },
  {
    id: "archive",
    source: "ARCHIVE",
    message: "save this before reset",
    objective: "Preserve the final file.",
    receiver: "ARCHIVE",
  },
  {
    id: "pilot",
    source: "PILOT",
    message: "visibility is gone",
    objective: "Send the landing vector.",
    receiver: "PILOT",
  },
  {
    id: "unknown",
    source: "UNKNOWN",
    message: "please, answer",
    objective: "Get the message through.",
    receiver: "UNKNOWN",
  },
];

const INDONESIAN_MISSIONS: Record<
  string,
  Pick<Mission, "source" | "message" | "objective" | "receiver">
> = {
  mom: {
    source: "IBU",
    message: "kamu di mana?",
    objective: "Kirim satu balasan terakhir.",
    receiver: "IBU",
  },
  nxr: {
    source: "NXR LABS",
    message: "server produksi mati",
    objective: "Kirim kunci deploy.",
    receiver: "NXR LABS",
  },
  gm: {
    source: "DILI ROOM #781",
    message: "gm?",
    objective: "Kirim satu gm terakhir.",
    receiver: "DILI ROOM",
  },
  private: {
    source: "RUANG PRIVAT",
    message: "mereka mengawasi jalur ini",
    objective: "Kirim peringatan tanpa rusak.",
    receiver: "RUANG PRIVAT",
  },
  creator: {
    source: "RUANG KREATOR",
    message: "dukungan diterima",
    objective: "Konfirmasi tip yang masuk.",
    receiver: "RUANG KREATOR",
  },
  sister: {
    source: "KAKAK",
    message: "sudah sampai rumah?",
    objective: "Katakan kamu aman.",
    receiver: "KAKAK",
  },
  station: {
    source: "STASIUN 04",
    message: "kereta terakhir berangkat",
    objective: "Kirim lokasimu.",
    receiver: "STASIUN 04",
  },
  friend: {
    source: "TEMAN LAMA",
    message: "masih bangun?",
    objective: "Kirim jawaban yang tertunda.",
    receiver: "TEMAN LAMA",
  },
  crew: {
    source: "KRU MALAM",
    message: "kode pintu berubah",
    objective: "Kirim kode baru.",
    receiver: "KRU MALAM",
  },
  archive: {
    source: "ARSIP",
    message: "simpan sebelum reset",
    objective: "Selamatkan berkas terakhir.",
    receiver: "ARSIP",
  },
  pilot: {
    source: "PILOT",
    message: "jarak pandang hilang",
    objective: "Kirim vektor pendaratan.",
    receiver: "PILOT",
  },
  unknown: {
    source: "TAK DIKENAL",
    message: "tolong, jawab",
    objective: "Pastikan pesan ini sampai.",
    receiver: "TAK DIKENAL",
  },
};

export function missionAt(index: number, language: "en" | "id"): Mission {
  const mission = MISSIONS[index] ?? MISSIONS[0];
  return language === "id"
    ? { ...mission, ...INDONESIAN_MISSIONS[mission.id] }
    : mission;
}

export function nextMissionIndex(current: number): number {
  if (MISSIONS.length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (MISSIONS.length - 1));
  return (current + offset) % MISSIONS.length;
}

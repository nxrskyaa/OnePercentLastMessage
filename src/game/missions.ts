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

export function nextMissionIndex(current: number): number {
  if (MISSIONS.length < 2) return 0;
  const offset = 1 + Math.floor(Math.random() * (MISSIONS.length - 1));
  return (current + offset) % MISSIONS.length;
}

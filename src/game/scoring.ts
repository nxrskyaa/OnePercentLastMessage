export interface ScoreInput {
  success: boolean;
  elapsed: number;
  battery: number;
  privacy: number;
  eventScore: number;
  trackerHits: number;
  perfectRelays: number;
}

export function finalScore(input: ScoreInput): number {
  const completion = input.success ? 5000 : 0;
  const speed = input.success
    ? Math.max(0, Math.round((75 - input.elapsed) * 80))
    : 0;
  const battery = input.success ? Math.round(input.battery * 3000) : 0;
  const privacy = input.success ? Math.round(input.privacy * 18) : 0;
  const clean = input.success && input.trackerHits === 0 ? 900 : 0;
  const lastSecond = input.success && input.battery <= 0.05 ? 1200 : 0;
  return Math.max(
    0,
    completion +
      speed +
      battery +
      privacy +
      clean +
      lastSecond +
      input.eventScore,
  );
}

export function awardsFor(input: ScoreInput): string[] {
  if (!input.success) return [];
  const awards: string[] = [];
  if (input.privacy >= 90) awards.push("GHOST");
  if (input.trackerHits === 0) awards.push("CLEAN ROUTE");
  if (input.battery <= 0.05) awards.push("LAST SECOND");
  if (input.elapsed < 50) awards.push("FAST PACKET");
  if (input.perfectRelays >= 3) awards.push("PERFECT SIGNAL");
  return awards;
}

export function privacyRank(privacy: number): string {
  if (privacy >= 90) return "GHOST";
  if (privacy >= 75) return "ENCRYPTED";
  if (privacy >= 50) return "EXPOSED";
  if (privacy > 0) return "COMPROMISED";
  return "IDENTITY LEAKED";
}

export type RuntimeQuality = "low" | "medium" | "high";

const PIXEL_BUDGET: Record<RuntimeQuality, number> = {
  low: 520_000,
  medium: 720_000,
  high: 1_050_000,
};

const BASE_DPR: Record<RuntimeQuality, number> = {
  low: 0.8,
  medium: 1,
  high: 1.2,
};

/** Bounds actual GPU pixels before the first frame, including large desktop screens. */
export function budgetedDpr(
  width: number,
  height: number,
  quality: RuntimeQuality,
  adaptiveScale = 1,
): number {
  const pixelRatio = Math.sqrt(
    PIXEL_BUDGET[quality] / Math.max(1, width * height),
  );
  return Math.max(0.3, Math.min(BASE_DPR[quality], pixelRatio) * adaptiveScale);
}

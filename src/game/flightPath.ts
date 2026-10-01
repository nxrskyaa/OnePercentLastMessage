/** Logical z is course progress. Local x/y are pilot offsets from this skyway. */
const stops = [
  [0, 0, 0],
  [95, 5, 2],
  [235, 55, 10],
  [420, -15, 2],
  [650, -85, 24],
  [895, 40, 52],
  [1100, 100, 22],
  [1380, -40, 38],
  [1610, -70, 10],
  [1800, 0, 0],
] as const;
function value(distance: number, column: 1 | 2) {
  const d = Math.max(0, Math.min(1800, distance));
  const i = Math.min(
    stops.length - 2,
    stops.findIndex((p, n) => n > 0 && p[0] >= d) - 1,
  );
  const index = Math.max(0, i),
    a = stops[index],
    b = stops[index + 1];
  const previous = stops[Math.max(0, index - 1)],
    next = stops[Math.min(stops.length - 1, index + 2)];
  const span = b[0] - a[0],
    t = (d - a[0]) / span;
  const m0 =
    index === 0
      ? 0
      : ((b[column] - previous[column]) / (b[0] - previous[0])) * span;
  const m1 =
    index === stops.length - 2
      ? 0
      : ((next[column] - a[column]) / (next[0] - a[0])) * span;
  return (
    (2 * t * t * t - 3 * t * t + 1) * a[column] +
    (t * t * t - 2 * t * t + t) * m0 +
    (-2 * t * t * t + 3 * t * t) * b[column] +
    (t * t * t - t * t) * m1
  );
}
export function flightCenter(z: number, stage = 0) {
  const d = -z,
    x = value(d, 1),
    y = value(d, 2);
  return {
    x: stage % 3 === 1 ? -x * 0.86 : stage % 3 === 2 ? x * 1.16 : x,
    y: y * (stage % 3 === 1 ? 1.16 : stage % 3 === 2 ? 0.8 : 1),
  };
}
export function flightSlope(z: number, stage = 0) {
  const a = flightCenter(z - 0.5, stage),
    b = flightCenter(z + 0.5, stage);
  return { x: b.x - a.x, y: b.y - a.y };
}
export function flightLengthScale(z: number, stage = 0) {
  const slope = flightSlope(z, stage);
  return Math.hypot(1, slope.x, slope.y);
}

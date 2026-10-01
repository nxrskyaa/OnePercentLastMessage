import type { BufferGeometry } from "three";
import { flightCenter } from "@/game/flightPath";

/** Bake the route into batched geometry once. Runtime draw count is unchanged. */
export function bendGeometry(geometry: BufferGeometry, stage: number) {
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const center = flightCenter(positions.getZ(i), stage);
    positions.setXY(
      i,
      positions.getX(i) + center.x,
      positions.getY(i) + center.y,
    );
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

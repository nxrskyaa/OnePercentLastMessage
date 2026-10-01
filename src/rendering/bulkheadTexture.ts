import * as THREE from "three";

/** Tiny authored machine panel atlas; no image downloads or shader loops. */
export function bulkheadTexture() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const seam = y % 21 < 2 || x < 2 || x > 125;
      const bevel = y % 21 === 3;
      const vent =
        x > 88 && x < 111 && y % 21 > 6 && y % 21 < 15 && (x + y) % 5 < 2;
      const fastener = (x < 8 || x > 119) && y % 21 > 6 && y % 21 < 10;
      const stripe = x > 13 && x < 19 && y % 21 > 6 && y % 21 < 16;
      const color = stripe
        ? [206, 176, 119]
        : fastener
          ? [164, 191, 195]
          : seam || vent
            ? [37, 65, 79]
            : bevel
              ? [135, 167, 174]
              : [89, 123, 139];
      pixels.set([...color, 255], (y * size + x) * 4);
    }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

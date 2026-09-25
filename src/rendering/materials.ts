import * as THREE from "three";

/** Shared restrained palette for the fast WebGL scene. */
export function dataSurface(base = "#102434", pulse = "#337e9b") {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(base).multiplyScalar(1.25),
    emissive: pulse,
    emissiveIntensity: 0.22,
    roughness: 0.7,
    metalness: 0.2,
  });
}

export function physicalSurface(base: string, pulse: string, low: boolean) {
  const material = dataSurface(base, pulse);
  material.emissiveIntensity = low ? 0.08 : 0.15;
  return material;
}

export function energySurface(tint = "#7bdff0", speed = 2.5, player = false) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(tint).multiplyScalar(
      player ? 1.14 : 1 + speed * 0.018,
    ),
    toneMapped: false,
  });
}

export function flowSurface(tint: string) {
  return new THREE.MeshBasicMaterial({ color: tint, toneMapped: false });
}

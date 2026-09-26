import * as THREE from "three";

// A thick message capsule, including its folded reply tail. Shared by the
// environment and receiver so the world has one recognizable visual language.
export function createChatGeometry(
  width = 20,
  height = 12,
  depth = 3,
  apertureRadius = 0,
) {
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const radius = Math.min(width, height) * 0.21;
  const tail = Math.min(width, height) * 0.34;
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius - tail * 0.5, bottom);
  shape.lineTo(right + tail * 0.25, bottom - tail);
  shape.lineTo(right - tail * 0.15, bottom + radius * 0.5);
  shape.quadraticCurveTo(right, bottom + radius, right, bottom + radius * 1.3);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  if (apertureRadius > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, apertureRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: depth * 0.1,
    bevelThickness: depth * 0.1,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

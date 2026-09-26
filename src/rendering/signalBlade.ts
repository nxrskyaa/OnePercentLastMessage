import * as THREE from "three";

function bladeBend(x: number, y: number) {
  const across = THREE.MathUtils.clamp((x + 20) / 40, 0, 1);
  return Math.sin(across * Math.PI) * 3.2 + x * 0.11 + Math.sin(y * 0.16) * 0.8;
}

// A beveled, deep interpretation of the Dlicom signal mark used by the
// physical relays and receiver. The reference logo itself remains untouched
// in the UI; this geometry gives the network its own spatial architecture.
export function createSignalBlade() {
  const shape = new THREE.Shape();
  shape.moveTo(-16, -4);
  shape.bezierCurveTo(-20, -5, -22, 1, -18, 8);
  shape.bezierCurveTo(-13, 17, -2, 17, 19, 14);
  shape.bezierCurveTo(9, 11, 3, 6, -1, 2);
  shape.bezierCurveTo(-5, 8, -11, 8, -12, 4);
  shape.bezierCurveTo(-13, 1, -12, -2, -16, -4);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 7,
    bevelEnabled: true,
    bevelThickness: 1.3,
    bevelSize: 1.2,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geometry.translate(0, 0, -3.5);
  const positions = geometry.getAttribute("position");
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setZ(index, positions.getZ(index) + bladeBend(x, y));
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  const colors = new Float32Array(positions.count * 3);
  const root = new THREE.Color("#163654");
  const body = new THREE.Color("#3479a3");
  const tip = new THREE.Color("#b4e7ec");
  const mixed = new THREE.Color();
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const across = THREE.MathUtils.clamp((x + 20) / 40, 0, 1);
    const crest = THREE.MathUtils.clamp((y + 5) / 24, 0, 1);
    mixed.copy(root).lerp(body, across * 0.62 + crest * 0.24);
    mixed.lerp(tip, Math.pow(across, 2.2) * 0.62);
    if (z < 0) mixed.multiplyScalar(0.78);
    colors[index * 3] = mixed.r;
    colors[index * 3 + 1] = mixed.g;
    colors[index * 3 + 2] = mixed.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function createSignalSeam() {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 8, 5 + bladeBend(-18, 8)),
      new THREE.Vector3(-12, 14, 5 + bladeBend(-12, 14)),
      new THREE.Vector3(-1, 17, 5 + bladeBend(-1, 17)),
      new THREE.Vector3(10, 16, 5 + bladeBend(10, 16)),
      new THREE.Vector3(19, 14, 5 + bladeBend(19, 14)),
    ]),
    28,
    0.13,
    4,
    false,
  );
}

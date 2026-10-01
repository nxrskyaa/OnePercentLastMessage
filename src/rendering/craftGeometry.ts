import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createChatGeometry } from "./chatGeometry";
import type { CourierCraft, CraftSocket } from "@/game/crafts";

type Surface = "hull" | "metal" | "glass" | "light";
function fuselage(craft: CourierCraft) {
  const count = craft.kind === "needle" ? 8 : 16;
  const positions: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  craft.sections.forEach(([z, rx, ry], ring) => {
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push(Math.cos(angle) * rx, Math.sin(angle) * ry, z);
      uv.push(i / count, ring / (craft.sections.length - 1));
      if (ring < craft.sections.length - 1 && i < count) {
        const a = ring * (count + 1) + i,
          b = a + 1,
          c = a + count + 1;
        indices.push(a, b, c, b, c + 1, c);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function wing(craft: CourierCraft, side: number) {
  const shape = new THREE.Shape();
  craft.wings.forEach(([x, z], i) =>
    i ? shape.lineTo(x * side, z) : shape.moveTo(x * side, z),
  );
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** Four coherent material batches; no per-panel React objects or texture downloads. */
export function buildCraft(craft: CourierCraft) {
  const parts: Record<Surface, THREE.BufferGeometry[]> = {
    hull: [],
    metal: [],
    glass: [],
    light: [],
  };
  const add = (
    surface: Surface,
    source: THREE.BufferGeometry,
    color: string,
    position: CraftSocket = [0, 0, 0],
    rotation: CraftSocket = [0, 0, 0],
  ) => {
    const geo = source.index ? source.toNonIndexed() : source;
    if (geo !== source) source.dispose();
    geo.rotateX(rotation[0]);
    geo.rotateY(rotation[1]);
    geo.rotateZ(rotation[2]);
    geo.translate(...position);
    const c = new THREE.Color(color),
      p = geo.getAttribute("position"),
      rgb = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const shade =
        surface === "hull"
          ? THREE.MathUtils.lerp(
              0.7,
              1,
              THREE.MathUtils.smoothstep(p.getY(i), -0.6, 0.3),
            )
          : 1;
      rgb.set([c.r * shade, c.g * shade, c.b * shade], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
    parts[surface].push(geo);
  };
  const box = (size: CraftSocket) =>
    new RoundedBoxGeometry(...size, 1, Math.min(...size) * 0.15);
  add("hull", fuselage(craft), craft.paint);
  add(
    "glass",
    new THREE.SphereGeometry(1, 16, 8).scale(
      craft.kind === "comet" ? 0.69 : 0.49,
      0.28,
      craft.kind === "needle" ? 1.2 : 0.86,
    ),
    craft.visor,
    [0, 0.49, -0.8],
  );
  add("light", box([0.08, 0.05, 0.9]), craft.exhaust, [0, 0.52, -1.65]);
  for (const side of [-1, 1]) {
    add("hull", wing(craft, side), craft.trim, [0, -0.12, 0]);
    add(
      "metal",
      box([0.09, 0.12, 1.22]),
      craft.metal,
      [side * 0.67, -0.03, -0.13],
      [0, side * 0.18, 0],
    );
    add("light", box([0.08, 0.08, 0.46]), craft.exhaust, [
      side * 2.15,
      -0.06,
      craft.kind === "needle" ? 1.04 : 0.71,
    ]);
    // Canted tail fins use a continuous swept sheet, connected to the fuselage.
    const fin = new THREE.Shape();
    fin.moveTo(0, 0);
    fin.lineTo(0.35, 0.92);
    fin.lineTo(1.18, 0.32);
    fin.lineTo(1.24, 0);
    fin.closePath();
    const finGeo = new THREE.ExtrudeGeometry(fin, {
      depth: 0.07,
      bevelEnabled: false,
      steps: 1,
    });
    add(
      "hull",
      finGeo,
      craft.paint,
      [side * 0.43, 0.22, 0.25],
      [0, -Math.PI / 2, side * -0.35],
    );
  }
  for (const [x, y, z] of craft.engines) {
    const radius = craft.kind === "comet" && x === 0 ? 0.42 : 0.34;
    add(
      "hull",
      new THREE.CylinderGeometry(radius, radius * 0.65, 1.25, 12),
      craft.paint,
      [x, y, z - 0.7],
      [Math.PI / 2, 0, 0],
    );
    add(
      "metal",
      new THREE.CylinderGeometry(
        radius * 1.05,
        radius * 0.79,
        0.38,
        12,
        1,
        true,
      ),
      craft.metal,
      [x, y, z - 0.16],
      [Math.PI / 2, 0, 0],
    );
    add("metal", new THREE.TorusGeometry(radius, 0.065, 4, 16), craft.metal, [
      x,
      y,
      z,
    ]);
    add("glass", new THREE.CircleGeometry(radius * 0.85, 12), "#111d30", [
      x,
      y,
      z + 0.012,
    ]);
    add(
      "light",
      new THREE.TorusGeometry(radius * 0.71, 0.025, 4, 12),
      craft.exhaust,
      [x, y, z + 0.035],
    );
    for (const offset of [-0.22, 0, 0.22])
      add("metal", box([0.04, 0.08, 0.25]), craft.metal, [
        x + offset,
        y + radius * 0.82,
        z - 0.62,
      ]);
  }
  // DILI's message plate is mounted on the courier, clear of the exhaust sockets.
  const badge = createChatGeometry(0.96, 0.65, 0.16);
  add("hull", badge, "#507ac6", [0, 0.67, 1.1], [-0.12, 0, 0]);
  for (const side of [-1, 1]) {
    add(
      "light",
      new THREE.BoxGeometry(0.13, 0.2, 0.03),
      "#fff3d7",
      [side * 0.22, 0.71, 1.22],
      [0, 0, side * -0.5],
    );
    add(
      "glass",
      new THREE.BoxGeometry(0.058, 0.11, 0.03),
      "#1a2b45",
      [side * 0.22, 0.71, 1.242],
      [0, 0, side * -0.5],
    );
  }
  add(
    "glass",
    new THREE.TorusGeometry(0.08, 0.017, 4, 8, Math.PI),
    "#172b43",
    [0, 0.57, 1.24],
    [0, 0, Math.PI],
  );
  const geometry = Object.fromEntries(
    Object.entries(parts).map(([surface, geos]) => {
      const merged = mergeGeometries(geos)!;
      geos.forEach((g) => g.dispose());
      return [surface, merged];
    }),
  ) as Record<Surface, THREE.BufferGeometry>;
  return geometry;
}

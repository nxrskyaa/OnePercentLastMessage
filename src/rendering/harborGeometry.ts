import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { HARBOR, dockHeight } from "@/game/harbor";
import type { StageDefinition } from "@/game/stages";

type Surface = "stone" | "metal" | "glass" | "light";
type V3 = [number, number, number];

/** Four material batches. Detail is modeled once, not hundreds of React objects. */
export function makeHarbor(stage: StageDefinition, section = 0) {
  const inSection = (z: number) =>
    Math.min(3, Math.floor(Math.abs(z) / 450)) === section;
  const parts: Record<Surface, THREE.BufferGeometry[]> = {
    stone: [],
    metal: [],
    glass: [],
    light: [],
  };
  const porcelain =
    stage.motif === "sails"
      ? "#8cc2c6"
      : stage.motif === "prisms"
        ? "#b0a1cb"
        : "#dab893";
  const colors: Record<Surface, string> = {
    stone: porcelain,
    metal: "#587c82",
    glass: "#224d62",
    light: stage.accentSoft,
  };
  function add(
    surface: Surface,
    geo: THREE.BufferGeometry,
    position: V3,
    color = colors[surface],
    rotation: V3 = [0, 0, 0],
  ) {
    geo.rotateX(rotation[0]);
    geo.rotateY(rotation[1]);
    geo.rotateZ(rotation[2]);
    geo.translate(...position);
    const c = new THREE.Color(color);
    const p = geo.getAttribute("position");
    const rgb = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      // Baked contact darkening keeps the bases grounded without shadow maps.
      const occlusion =
        surface === "light"
          ? 1
          : THREE.MathUtils.lerp(
              0.48,
              1,
              THREE.MathUtils.smoothstep(p.getY(i), -16, 6),
            );
      rgb.set([c.r * occlusion, c.g * occlusion, c.b * occlusion], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3));
    parts[surface].push(geo);
  }
  function box(surface: Surface, size: V3, pos: V3, color?: string) {
    add(
      surface,
      new RoundedBoxGeometry(
        ...size,
        1,
        Math.min(0.65, Math.min(...size) * 0.18),
      ),
      pos,
      color,
    );
  }
  function tube(
    surface: Surface,
    points: V3[],
    radius: number,
    color?: string,
  ) {
    add(
      surface,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        32,
        radius,
        6,
        false,
      ),
      [0, 0, 0],
      color,
    );
  }
  function ring(
    surface: Surface,
    radius: number,
    thickness: number,
    pos: V3,
    color?: string,
  ) {
    add(
      surface,
      new THREE.TorusGeometry(radius, thickness, 6, 32),
      pos,
      color,
      [Math.PI / 2, 0, 0],
    );
  }
  HARBOR.districts.forEach(({ x, z, radius, tower }, i) => {
    if (!inSection(z)) return;
    const h = tower + (stage.motif === "prisms" ? 12 : 0);
    const side = Math.sign(x);
    // Stacked tidal platforms give each station a shore, lip, and submerged foundation.
    add(
      "metal",
      new THREE.CylinderGeometry(radius * 0.88, radius * 0.7, 12, 32),
      [x, -17, z],
    );
    add("stone", new THREE.CylinderGeometry(radius, radius * 0.96, 3.4, 40), [
      x,
      -10.7,
      z,
    ]);
    ring("metal", radius - 0.8, 0.45, [x, -8.9, z]);
    // The tall relay is a hollow lantern pavilion with a glazed middle and copper crown.
    const segments = stage.motif === "prisms" ? 6 : 24;
    add("stone", new THREE.CylinderGeometry(7, 10, h * 0.57, segments), [
      x,
      h * 0.285 - 9,
      z,
    ]);
    add("glass", new THREE.CylinderGeometry(8.5, 7, h * 0.22, segments), [
      x,
      h * 0.68 - 9,
      z,
    ]);
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI) / 4;
      box(
        "metal",
        [0.5, h * 0.25, 0.5],
        [x + Math.cos(a) * 8.2, h * 0.68 - 9, z + Math.sin(a) * 8.2],
      );
    }
    add("stone", new THREE.CylinderGeometry(3, 11, 5, 24), [
      x,
      h * 0.81 - 9,
      z,
    ]);
    add("metal", new THREE.CylinderGeometry(0.25, 0.65, h * 0.2, 8), [
      x,
      h * 0.94 - 9,
      z,
    ]);
    ring("light", 7.2, 0.3, [x, h * 0.59 - 9, z]);
    ring("light", 9.2, 0.24, [x, h * 0.79 - 9, z]);
    // Layered copper eaves and narrow window strips break up the large blank shell.
    for (const level of [0.2, 0.42]) {
      add(
        "metal",
        new THREE.CylinderGeometry(9.7, 10, 0.55, segments),
        [x, h * level - 9, z],
        "#b6956f",
      );
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        add(
          "glass",
          new THREE.BoxGeometry(0.65, 5, 0.3),
          [x + Math.sin(a) * 8.7, h * level - 12, z + Math.cos(a) * 8.7],
          undefined,
          [0, a, 0],
        );
      }
    }
    if (stage.motif === "halos") {
      // Solar relay dishes face the flight channel, each with an actual concave shell.
      add(
        "metal",
        new THREE.SphereGeometry(10, 24, 12, 0, Math.PI * 2, 0, 0.85),
        [x, h * 0.8 - 3, z],
        "#d4b98c",
        [Math.PI / 2, side * 0.35, 0],
      );
      add(
        "light",
        new THREE.SphereGeometry(0.7, 8, 6),
        [x, h * 0.8 - 3, z + 8],
        stage.accent,
      );
    } else if (stage.motif === "prisms") {
      for (const sideX of [-1, 1])
        box(
          "metal",
          [1.1, h * 0.75, 3],
          [x + sideX * 11, h * 0.375 - 9, z],
          "#ad95b9",
        );
    } else {
      // A pair of water intake pipes descends from the station into the estuary.
      for (const dz of [-6, 6])
        tube(
          "metal",
          [
            [x - side * 8, -3, z + dz],
            [x - side * 16, -4, z + dz],
            [x - side * 20, -12, z + dz],
            [x - side * 20, -18, z + dz],
          ],
          0.85,
          "#b6956f",
        );
    }
    add("light", new THREE.SphereGeometry(0.85, 10, 6), [x, h * 1.04 - 9, z]);
    // Portholes and inset seams are sized to be visible at flight speed.
    for (let j = 0; j < 4; j++) {
      const a = (j * Math.PI) / 2;
      add(
        "glass",
        new THREE.CircleGeometry(1.9, 16),
        [x + Math.sin(a) * 8.4, h * 0.35 - 9, z + Math.cos(a) * 8.4],
        undefined,
        [0, a, 0],
      );
      add(
        "metal",
        new THREE.TorusGeometry(1.9, 0.25, 5, 16),
        [x + Math.sin(a) * 8.45, h * 0.35 - 9, z + Math.cos(a) * 8.45],
        undefined,
        [0, a, 0],
      );
    }
    // Small archive houses, exterior ribs, docks, mooring bollards.
    for (let j = 0; j < 3; j++) {
      const bx = x + side * (j - 1) * 8,
        bz = z + 15 + (j % 2) * 3;
      box("metal", [7, 9, 10], [bx, -4.5, bz]);
      box("stone", [8, 1.2, 11], [bx, 0.5, bz]);
      box(
        "light",
        [4, 0.7, 0.25],
        [bx, -1.6, bz + 5.1],
        j % 2 ? stage.accent : stage.accentSoft,
      );
      for (let k = 0; k < 3; k++)
        box("stone", [0.45, 6, 0.45], [bx - 2 + k * 2, -4.5, bz + 5.2]);
    }
    box(
      "stone",
      [Math.abs(x) - 28, 2, 10],
      [(side * (Math.abs(x) + 28)) / 2, -11, z - 10],
    );
    for (const dz of [-14, -6]) {
      box(
        "metal",
        [Math.abs(x) - 28, 0.5, 0.4],
        [(side * (Math.abs(x) + 28)) / 2, -9.7, z + dz],
      );
    }
    // One tall asymmetric gantry per district, overhanging only outside the flight path.
    tube(
      "metal",
      [
        [x + side * 16, -9, z - 12],
        [x + side * 16, 18, z - 12],
        [x - side * 10, 23, z - 12],
        [side * 22, 18, z - 12],
      ],
      0.6,
    );
    tube(
      "light",
      [
        [x + side * 16, -9.6, z - 12],
        [x + side * 16, 17.4, z - 12],
        [x - side * 10, 22.4, z - 12],
        [side * 22, 17.4, z - 12],
      ],
      0.16,
      stage.accent,
    );
    box("metal", [0.18, 17, 0.18], [side * 22, 8.5, z - 12]);
    add("stone", new THREE.CapsuleGeometry(1.7, 3, 4, 10), [
      side * 22,
      -1,
      z - 12,
    ]);
    ring("light", 1.75, 0.18, [side * 22, -0.3, z - 12], stage.accent);
    // Distant satellite islands: depth without a wall sealing the horizon.
    const farX = -side * (100 + (i % 3) * 23);
    add("metal", new THREE.CylinderGeometry(17, 9, 9, 20), [farX, -17, z - 34]);
    for (let j = 0; j < 3; j++) {
      const height = 18 + j * 11;
      box(
        "stone",
        [7, height, 9],
        [farX + (j - 1) * 9, -12 + height / 2, z - 34],
      );
      box(
        "light",
        [4, 0.6, 0.3],
        [farX + (j - 1) * 9, -10 + height, z - 29.3],
        stage.accent,
      );
    }
  });
  // Three memorable crossings separated by long open views of the water.
  [-180, -560, -940, -1400, -1700].filter(inSection).forEach((z, index) => {
    const height = index === 1 ? 51 : 29;
    for (const dz of [-3, 3]) {
      tube(
        "stone",
        [
          [-82, -13, z + dz],
          [-58, 24, z + dz],
          [-10, height, z + dz],
          [42, height - 5, z + dz],
          [83, -13, z + dz],
        ],
        1.3,
      );
      tube(
        "metal",
        [
          [-82, -13, z + dz],
          [-58, 20, z + dz],
          [-10, height - 4, z + dz],
          [42, height - 9, z + dz],
          [83, -13, z + dz],
        ],
        0.4,
      );
    }
    const arch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-82, -13, z),
      new THREE.Vector3(-58, 24, z),
      new THREE.Vector3(-10, height, z),
      new THREE.Vector3(42, height - 5, z),
      new THREE.Vector3(83, -13, z),
    ]);
    for (let j = 0; j < 13; j++) {
      const point = arch.getPoint(0.14 + j * 0.059);
      box("metal", [0.45, 0.5, 6], [point.x, point.y, z]);
      box("light", [1.7, 0.16, 5], [point.x, point.y - 0.34, z], stage.accent);
    }
  });
  // Purposeful service conduit follows the player corridor, disappearing underwater.
  for (const side of [-1, 1]) {
    const pts: V3[] = [];
    for (let j = 0; j <= 18; j++)
      pts.push([
        side * (24 + Math.sin(j * 0.9) * 2),
        -12.5,
        -section * 450 + 15 - j * 26,
      ]);
    tube("metal", pts, 0.75);
    tube(
      "light",
      pts.map(([x, y, z]) => [x, y + 0.6, z]),
      0.11,
      stage.accent,
    );
    HARBOR.lightStops.forEach((z) => {
      if (!inSection(z)) return;
      add("stone", new THREE.CylinderGeometry(6, 4, 4, 20), [
        side * 31,
        dockHeight(z) - 15,
        z,
      ]);
    });
  }
  // Each act has its own architectural silhouette, still in the same four batches.
  if (section === 1) {
    for (const z of [-455, -570, -685]) {
      for (const side of [-1, 1]) {
        box("metal", [3, 52, 7], [side * 24, 9, z], "#b49c75");
        box("glass", [4.5, 17, 8], [side * 24, 20, z]);
        box("light", [0.3, 46, 0.4], [side * 22.3, 9, z + 3.6], stage.accent);
      }
      box("stone", [52, 3, 8], [0, 36, z]);
      box("light", [43, 0.2, 1.4], [0, 34.4, z], stage.accentSoft);
    }
  }
  if (section === 2) {
    for (const z of [-1005, -1240]) {
      for (const side of [-1, 1]) {
        add(
          "metal",
          new THREE.TorusGeometry(21, 2, 8, 32),
          [side * 43, 17, z],
          "#b49b75",
          [0, side * 0.4, 0],
        );
        box("stone", [11, 29, 15], [side * 43, -2, z]);
        for (let k = 0; k < 6; k++)
          box(
            "light",
            [6, 0.4, 0.4],
            [side * 43, k * 3, z + 8],
            stage.accentSoft,
          );
      }
    }
  }
  if (section === 3) {
    for (let i = 0; i < 5; i++) {
      const z = -1480 - i * 57;
      for (const side of [-1, 1]) {
        box("stone", [3.5, 47 + i * 4, 4], [side * (32 - i), 7 + i * 2, z]);
        tube(
          "metal",
          [
            [side * 30, 30, z],
            [side * 21, 43, z],
            [0, 49 + i * 2, z],
          ],
          0.7,
          "#b49b75",
        );
        tube(
          "light",
          [
            [side * 30, 29, z],
            [side * 21, 42, z],
            [0, 48 + i * 2, z],
          ],
          0.12,
          stage.accent,
        );
      }
    }
  }
  return Object.fromEntries(
    Object.entries(parts).map(([name, geometries]) => {
      const normalized = geometries.map((g) =>
        g.index ? g.toNonIndexed() : g,
      );
      const merged = mergeGeometries(normalized)!;
      normalized.forEach((g) => g.dispose());
      geometries.forEach((g) => g.dispose());
      merged.computeBoundingSphere();
      return [name, merged];
    }),
  ) as Record<Surface, THREE.BufferGeometry>;
}

"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settingsStore";

type World = {
  deck: THREE.BufferGeometry;
  towers: THREE.BufferGeometry;
  lines: THREE.BufferGeometry;
  dust: THREE.BufferGeometry;
  sky: THREE.SphereGeometry;
};

const STEEL = new THREE.Color("#24475a");
const BLUE = new THREE.Color("#62b9cc");
const PALE = new THREE.Color("#b5eef0");
const GOLD = new THREE.Color("#bd865b");

function makeWorld(low: boolean): World {
  const deck: number[] = [];
  const deckColors: number[] = [];
  const towers: number[] = [];
  const towerColors: number[] = [];
  const lines: number[] = [];
  const lineColors: number[] = [];
  const dust: number[] = [];
  const triangle = (
    v: number[],
    c: number[],
    a: number[],
    b: number[],
    d: number[],
    color: THREE.Color,
  ) => {
    v.push(...a, ...b, ...d);
    for (let i = 0; i < 3; i++) c.push(color.r, color.g, color.b);
  };
  const quad = (
    v: number[],
    c: number[],
    a: number[],
    b: number[],
    d: number[],
    e: number[],
    color: THREE.Color,
  ) => {
    triangle(v, c, a, b, d, color);
    triangle(v, c, a, d, e, color);
  };
  const line = (a: number[], b: number[], color: THREE.Color) => {
    lines.push(...a, ...b);
    for (let i = 0; i < 2; i++) lineColors.push(color.r, color.g, color.b);
  };
  const beam = (
    a: number[],
    b: number[],
    width: number,
    depth: number,
    color: THREE.Color,
  ) => {
    const axis = new THREE.Vector3(b[0] - a[0], b[1] - a[1], 0);
    const across = new THREE.Vector3(-axis.y, axis.x, 0)
      .normalize()
      .multiplyScalar(width / 2);
    const p = (v: number[], s: number, z: number) => [
      v[0] + across.x * s,
      v[1] + across.y * s,
      v[2] + (z * depth) / 2,
    ];
    quad(
      towers,
      towerColors,
      p(a, -1, 1),
      p(b, -1, 1),
      p(b, 1, 1),
      p(a, 1, 1),
      color.clone().multiplyScalar(1.3),
    );
    quad(
      towers,
      towerColors,
      p(a, 1, 1),
      p(b, 1, 1),
      p(b, 1, -1),
      p(a, 1, -1),
      color.clone().multiplyScalar(0.68),
    );
    quad(
      towers,
      towerColors,
      p(a, -1, -1),
      p(a, -1, 1),
      p(a, 1, 1),
      p(a, 1, -1),
      color.clone().multiplyScalar(0.76),
    );
  };

  // Separated optical conductors leave open space beneath the player.
  for (let i = 0; i < 69; i++) {
    const z = 31 - i * 10;
    const next = z - 10;
    for (let lane = -3; lane <= 3; lane++) {
      const x = (p: number) =>
        lane * 6.4 + Math.sin(p * 0.017 + lane * 0.52) * 1.8;
      const y = (p: number) =>
        -13.8 - Math.abs(lane) * 1.8 + Math.sin(p * 0.031 + lane) * 0.8;
      const width = lane === 0 ? 0.65 : 0.95;
      quad(
        deck,
        deckColors,
        [x(z) - width, y(z), z],
        [x(next) - width, y(next), next],
        [x(next) + width, y(next), next],
        [x(z) + width, y(z), z],
        STEEL.clone().lerp(BLUE, lane === 0 ? 0.72 : 0.24),
      );
      line(
        [x(z), y(z) + 0.08, z],
        [x(next), y(next) + 0.08, next],
        lane === 0 ? PALE : BLUE.clone().multiplyScalar(0.7),
      );
      if (lane < 3 && i % 5 === 0)
        line(
          [x(z), y(z), z],
          [x(z) + 6.4, y(z) - 1.7, z - 3],
          BLUE.clone().multiplyScalar(0.43),
        );
    }
  }

  // These split crowns are deliberately asymmetric, like broken antennae.
  [-145, -348, -548].forEach((z, index) => {
    const height = [53, 70, 59][index];
    const lean = [9, 13, 7][index];
    const base = 26 + (index % 2) * 3;
    for (const side of [-1, 1]) {
      const sideHeight = height * (side === (index % 2 ? 1 : -1) ? 1.12 : 0.69);
      const bottom = [side * base, -20, z];
      const shoulder = [side * (base + lean), sideHeight * 0.42, z - 3];
      const crown = [side * (base - 4), sideHeight, z - 9];
      const inner = [
        side * (sideHeight > height ? 13 : 23),
        sideHeight + 5,
        z - 12,
      ];
      beam(bottom, shoulder, 7.5, 8, STEEL.clone().lerp(BLUE, 0.18));
      beam(shoulder, crown, 5.5, 7, STEEL.clone().lerp(BLUE, 0.32));
      beam(
        crown,
        inner,
        3.4,
        5,
        index % 2
          ? STEEL.clone().lerp(GOLD, 0.3)
          : STEEL.clone().lerp(BLUE, 0.52),
      );
      line(
        [side * (base - 2), -16, z + 4],
        [side * (base + lean - 2), sideHeight * 0.42, z + 1],
        index % 2 ? GOLD : BLUE,
      );
      line(
        [side * (base + lean - 2), sideHeight * 0.42, z + 1],
        [side * (base - 6), sideHeight, z - 5],
        PALE.clone().multiplyScalar(0.72),
      );
      for (let rib = 0; rib < 4; rib++) {
        const y = 3 + rib * 9;
        const x = side * (base + (lean * y) / sideHeight);
        beam(
          [x - side * 5, y, z + 2],
          [x + side * 6, y + 1.5, z + 2],
          0.8,
          1.2,
          BLUE.clone().multiplyScalar(0.57),
        );
      }
    }
  });

  // Physical message capsules float between relay stacks. A folded tail and
  // recessed signal strokes make them identifiable from a distance and side view.
  const message = (
    x: number,
    y: number,
    z: number,
    scale: number,
    angle: number,
    color: THREE.Color,
  ) => {
    const shape = [
      [-12, -7],
      [6, -7],
      [11, -11],
      [10, -5],
      [12, -3],
      [12, 7],
      [-12, 7],
    ] as const;
    const transform = (u: number, v: number, front: boolean) => {
      const depth = front ? 2.8 : -2.8;
      return [
        x + Math.cos(angle) * u * scale - Math.sin(angle) * depth,
        y + v * scale,
        z + Math.sin(angle) * u * scale + Math.cos(angle) * depth,
      ];
    };
    const point = (coordinates: readonly [number, number], front: boolean) =>
      transform(coordinates[0], coordinates[1], front);
    for (let i = 1; i < shape.length - 1; i++) {
      triangle(
        towers,
        towerColors,
        point(shape[0], true),
        point(shape[i], true),
        point(shape[i + 1], true),
        color.clone().multiplyScalar(1.45),
      );
      triangle(
        towers,
        towerColors,
        point(shape[0], false),
        point(shape[i + 1], false),
        point(shape[i], false),
        color.clone().multiplyScalar(0.65),
      );
    }
    for (let i = 0; i < shape.length; i++) {
      const a = shape[i],
        b = shape[(i + 1) % shape.length];
      quad(
        towers,
        towerColors,
        point(a, true),
        point(b, true),
        point(b, false),
        point(a, false),
        color.clone().multiplyScalar(0.85),
      );
      line(point(a, true), point(b, true), BLUE.clone().multiplyScalar(0.8));
    }
    for (let row = 0; row < 3; row++) {
      const v = 3 - row * 3.2;
      line(
        transform(-7, v, true),
        transform(row === 2 ? 3 : 7, v, true),
        PALE.clone().multiplyScalar(row === 0 ? 0.8 : 0.52),
      );
    }
    line(
      [x, y - 8 * scale, z],
      [x * 0.94, -20, z - 8],
      color.clone().multiplyScalar(0.5),
    );
  };
  [
    [-1, -72, 18, 1.1],
    [1, -185, 26, 1.42],
    [-1, -276, 11, 0.9],
    [1, -392, 19, 1.13],
    [-1, -493, 25, 1.34],
    [1, -588, 13, 1.02],
  ].forEach(([side, z, y, scale], index) => {
    message(
      side * (48 + (index % 2) * 9),
      y,
      z,
      scale,
      side * 0.3,
      index % 3 === 1
        ? STEEL.clone().lerp(GOLD, 0.28)
        : STEEL.clone().lerp(BLUE, 0.35),
    );
  });

  // Staggered pylons sit outside the flight area and create strong motion parallax.
  const count = low ? 50 : 88;
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? 1 : -1;
    const z = 18 - i * (low ? 14.1 : 8.15);
    const n = Math.sin(i * 12.973) * 43758.5453;
    const random = n - Math.floor(n);
    const x = side * (35 + random * 44);
    const height = 14 + ((i * 17) % 36);
    const back = z - 2.5 - random * 5;
    const tone = STEEL.clone().lerp(
      i % 9 === 0 ? GOLD : BLUE,
      0.11 + random * 0.22,
    );
    beam(
      [x, -25, z],
      [x + side * (4 + random * 5), height, back],
      2.5 + random * 4,
      4 + random * 6,
      tone,
    );
    if (i % 3 === 0)
      line(
        [x, -10, z + 3],
        [x + side * (4 + random * 5), height, back + 3],
        i % 9 === 0 ? GOLD : BLUE,
      );
    if (i % 7 === 0)
      beam(
        [x + side * (4 + random * 5), height, back],
        [x - side * 9, height + 4, back - 3],
        1.8,
        2.5,
        tone.clone().multiplyScalar(1.25),
      );
  }
  // The data plane under the route remains open; it supplies depth without a tunnel.
  for (let lane = -6; lane <= 6; lane++) {
    if (lane === 0) continue;
    for (let i = 0; i < 42; i++) {
      const z = 26 - i * 16;
      const x = (p: number) => lane * 12 + Math.sin(p * 0.018 + lane) * 5;
      const y = (p: number) => -23 + Math.sin(p * 0.026 + lane * 0.8) * 5;
      line(
        [x(z), y(z), z],
        [x(z - 16), y(z - 16), z - 16],
        BLUE.clone().multiplyScalar(0.36),
      );
    }
  }
  for (let i = 0; i < (low ? 100 : 220); i++)
    dust.push(
      (i % 2 ? 1 : -1) * (25 + ((i * 37.7) % 105)),
      -7 + ((i * 19.73) % 77),
      25 - ((i * 53.71) % 720),
    );
  const buffer = (v: number[], c?: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    if (c) g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    return g;
  };
  const deckGeometry = buffer(deck, deckColors);
  const towerGeometry = buffer(towers, towerColors);
  deckGeometry.computeVertexNormals();
  towerGeometry.computeVertexNormals();
  const sky = new THREE.SphereGeometry(850, 24, 14);
  const skyColors: number[] = [];
  const pos = sky.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 850;
    const x = pos.getX(i) / 850;
    const haze = Math.exp(-Math.pow((y + 0.06) * 4.3, 2));
    const color = new THREE.Color("#020b15").lerp(
      new THREE.Color(x < 0 ? "#244c66" : "#15536b"),
      haze * 0.83,
    );
    skyColors.push(color.r, color.g, color.b);
  }
  sky.setAttribute("color", new THREE.Float32BufferAttribute(skyColors, 3));
  return {
    deck: deckGeometry,
    towers: towerGeometry,
    lines: buffer(lines, lineColors),
    dust: buffer(dust),
    sky,
  };
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const world = useMemo(() => makeWorld(low), [low]);
  useEffect(
    () => () => Object.values(world).forEach((g) => g.dispose()),
    [world],
  );
  return (
    <>
      <mesh geometry={world.sky} position={[0, 0, -320]} renderOrder={-10}>
        <meshBasicMaterial
          vertexColors
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={world.deck}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          metalness={0.42}
          roughness={0.55}
          emissive="#0a2c3c"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh geometry={world.towers}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          metalness={0.58}
          roughness={0.4}
          emissive="#102c40"
          emissiveIntensity={0.34}
        />
      </mesh>
      <lineSegments geometry={world.lines}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.83}
          toneMapped={false}
        />
      </lineSegments>
      <points geometry={world.dust}>
        <pointsMaterial
          color="#bce9f0"
          size={0.58}
          transparent
          opacity={0.54}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

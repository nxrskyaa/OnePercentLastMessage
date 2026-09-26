"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settingsStore";

// Folded signal sheets give each stretch of the transmission its own silhouette.
function makeWorld(low: boolean) {
  const facets: number[] = [];
  const colors: number[] = [];
  const seams: number[] = [];
  const current: number[] = [];
  const echoes: number[] = [];
  const glints: number[] = [];
  const palette = ["#244868", "#315c7b", "#335875", "#4d5076"];
  const triangle = (
    a: number[],
    b: number[],
    c: number[],
    color: THREE.Color,
  ) => {
    facets.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
  };
  const line = (target: number[], a: number[], b: number[]) =>
    target.push(...a, ...b);

  const landmarks = [
    [-1, -30, -155, 37, 28],
    [1, -108, -266, 59, 43],
    [-1, -226, -367, 64, 47],
    [1, -337, -483, 51, 36],
    [-1, -447, -578, 54, 39],
    [1, -528, -655, 58, 42],
  ] as const;
  landmarks.forEach(([side, front, back, height, reach], i) => {
    const baseX = 27 + (i % 2) * 4;
    const point = (t: number, u: number) => {
      const arch = Math.pow(Math.sin(Math.PI * t), 0.7);
      const billow = Math.sin(Math.PI * t * 2 + i * 0.65) * 3.5;
      return [
        side * (baseX + u * reach * arch + billow * u),
        -17 + u * height * arch + Math.sin(t * Math.PI * 3) * u * 2,
        front + (back - front) * t - u * (6 + (i % 3)),
      ];
    };
    for (let t = 0; t < 8; t++) {
      for (let u = 0; u < 3; u++) {
        const a = point(t / 8, u / 3);
        const b = point((t + 1) / 8, u / 3);
        const c = point((t + 1) / 8, (u + 1) / 3);
        const d = point(t / 8, (u + 1) / 3);
        const shade = new THREE.Color(
          palette[i % palette.length],
        ).multiplyScalar(0.55 + u * 0.23 + (t % 2) * 0.045);
        triangle(a, b, c, shade);
        triangle(a, c, d, shade);
      }
      line(seams, point(t / 8, 1), point((t + 1) / 8, 1));
      for (const layer of [0.35, 0.68])
        line(seams, point(t / 8, layer), point((t + 1) / 8, layer));
      if (t % 2 === 0) line(seams, point(t / 8, 0.35), point(t / 8, 0.68));
    }
  });

  // The player's route flows over a dark current, broken by message-like ripples.
  for (let step = 0; step < 54; step++) {
    const z = 28 - step * 12.5;
    const width = 25 + Math.sin(step * 0.24) * 3;
    const a = [-width, -19.2, z];
    const b = [width, -19.2, z];
    const c = [width, -19.2, z - 12.5];
    const d = [-width, -19.2, z - 12.5];
    const shade = new THREE.Color("#091d30");
    triangle(a, b, c, shade);
    triangle(a, c, d, shade);
    if (step % 4 === 0)
      line(current, [-width * 0.7, -19, z], [width * 0.7, -19, z]);
  }
  // Broken conversation echoes make the space feel like a message network.
  [
    [-1, -176, 11, 0],
    [1, -324, 18, 1],
    [-1, -494, 6, 2],
  ].forEach(([side, z, y, index]) => {
    const x = side * (46 + index * 3);
    const a = [x - 10, y + 6, z];
    const b = [x + 10, y + 6, z];
    const c = [x + 10, y - 5, z];
    const d = [x - 3, y - 5, z];
    const tail = [x - 8, y - 10, z];
    const e = [x - 9, y - 5, z];
    line(echoes, a, b);
    line(echoes, b, c);
    line(echoes, c, d);
    line(echoes, d, tail);
    line(echoes, tail, e);
    line(echoes, e, a);
    for (let row = 0; row < 3; row++)
      line(
        echoes,
        [x - 6, y + 3 - row * 2.5, z],
        [x + 3 + ((row + index) % 3) * 2, y + 3 - row * 2.5, z],
      );
  });

  // A broad, sparse current suggests a giant connected data plane below flight.
  for (let lane = -8; lane <= 8; lane++) {
    if (lane === 0) continue;
    const x = lane * 6.5;
    for (let step = 0; step < 56; step++) {
      const z = 28 - step * 12.4;
      const wave = (p: number) => -19 + Math.sin(p * 0.026 + lane * 0.64) * 1.6;
      const bend = (p: number) =>
        x + Math.sin(p * 0.014 + lane * 0.4) * (Math.abs(lane) + 1);
      line(
        current,
        [bend(z), wave(z), z],
        [bend(z - 12.4), wave(z - 12.4), z - 12.4],
      );
    }
  }
  for (let i = 0; i < (low ? 120 : 240); i++) {
    const a = Math.sin(i * 127.13 + 4.7) * 43758.5453;
    const fraction = a - Math.floor(a);
    glints.push(
      (i % 2 ? 1 : -1) * (25 + fraction * 100),
      -8 + ((i * 19.73) % 75),
      30 - ((i * 53.71) % 720),
    );
  }
  const geometry = (positions: number[]) => {
    const result = new THREE.BufferGeometry();
    result.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return result;
  };
  const sheets = geometry(facets);
  sheets.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  sheets.computeVertexNormals();
  const sky = new THREE.SphereGeometry(880, 28, 16);
  const skyColors: number[] = [];
  const vertices = sky.getAttribute("position");
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i) / 880;
    const y = vertices.getY(i) / 880;
    const horizon = Math.exp(-Math.pow((y + 0.05) * 4.4, 2));
    const tint = new THREE.Color("#091a2a").lerp(
      new THREE.Color(x < -0.2 ? "#273b59" : "#1d536e"),
      horizon * 0.78,
    );
    skyColors.push(tint.r, tint.g, tint.b);
  }
  sky.setAttribute("color", new THREE.Float32BufferAttribute(skyColors, 3));
  return {
    sheets,
    seams: geometry(seams),
    current: geometry(current),
    echoes: geometry(echoes),
    stars: geometry(glints),
    sky,
  };
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const world = useMemo(() => makeWorld(low), [low]);
  const dili = useTexture("/brand/dili-blue-cutout.png");
  const guide = useRef<THREE.Group>(null);
  useFrame(({ clock, camera }) => {
    if (guide.current) {
      guide.current.position.y = 9 + Math.sin(clock.elapsedTime * 1.25) * 0.75;
      const ahead = camera.position.z + 116;
      guide.current.visible = ahead > 55 && ahead < 200;
    }
  });
  useEffect(
    () => () => Object.values(world).forEach((item) => item.dispose()),
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
      <mesh geometry={world.sheets}>
        <meshBasicMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.88}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <lineSegments geometry={world.seams}>
        <lineBasicMaterial
          color="#8fd7f2"
          transparent
          opacity={0.68}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={world.current}>
        <lineBasicMaterial
          color="#428eb4"
          transparent
          opacity={0.37}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={world.echoes}>
        <lineBasicMaterial
          color="#90bce1"
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <points geometry={world.stars}>
        <pointsMaterial
          color="#d7ecfa"
          size={0.55}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <group ref={guide} position={[-32, 9, -116]} rotation={[0, 0.18, 0]}>
        <mesh>
          <planeGeometry args={[6.5, 8]} />
          <meshBasicMaterial
            map={dili}
            transparent
            alphaTest={0.08}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -5.5, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.65, 24]} />
          <meshBasicMaterial
            color="#72d6ec"
            transparent
            opacity={0.64}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}

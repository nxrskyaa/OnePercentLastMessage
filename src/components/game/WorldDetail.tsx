"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { channelHeight, LIGHT_STOPS } from "@/components/game/NetworkStage";
import { GAME_CONFIG } from "@/game/config";
import { stageAt, type StageDefinition } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";

function makeWallPanels(stage: StageDefinition) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const base = new THREE.Color(stage.channel[2]);
  const relief = new THREE.Color(stage.channel[1]);
  const lamp = new THREE.Color(stage.accentSoft);
  const point = (side: number, t: number, z: number) => {
    const fold = Math.sin(((35 - z) / 10) * 0.71 + 36) * 1.7;
    return [
      side * (36 + 9 * t + fold - 1.15),
      -3 + 22 * t + channelHeight(z),
      z,
    ] as const;
  };

  for (const side of [-1, 1]) {
    for (let section = 0; section < 60; section++) {
      for (let row = 0; row < 3; row++) {
        const t0 = 0.08 + row * 0.29 + ((section * 7 + row) % 3) * 0.008;
        const t1 = t0 + 0.205 + ((section + row) % 3) * 0.013;
        const zFront = 20 - section * 11 + (row % 2) * 4.2;
        const zBack = zFront - 7.2 - ((section * 5 + row * 3) % 4) * 0.5;
        const points = [
          point(side, t0, zFront),
          point(side, t1, zFront - 0.8),
          point(side, t1, zBack),
          point(side, t0, zBack + 0.8),
        ];
        const shade = base
          .clone()
          .lerp(relief, 0.06 + ((section * 17 + row * 11) % 13) / 90);
        const proximity = LIGHT_STOPS.reduce(
          (best, stop) => Math.min(best, Math.abs(zFront - stop)),
          1000,
        );
        shade.lerp(lamp, Math.max(0, 1 - proximity / 25) * 0.2);
        const start = positions.length / 3;
        for (const vertex of points) {
          positions.push(...vertex);
          colors.push(shade.r, shade.g, shade.b);
        }
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeWellPools() {
  const parts: THREE.BufferGeometry[] = [];
  for (const stop of GAME_CONFIG.world.wellStops) {
    const plane = new THREE.PlaneGeometry(42, 47, 10, 12);
    plane.rotateX(-Math.PI / 2);
    plane.translate(0, 0, stop);
    const position = plane.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      position.setY(
        i,
        -20.65 + channelHeight(z) + Math.sin(x * 0.18 + z * 0.035) * 0.35,
      );
    }
    position.needsUpdate = true;
    parts.push(plane);
  }
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Well reflections could not be generated");
  return merged;
}

function makePoolTexture() {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - size / 2) / (size / 2);
      const v = (y + 0.5 - size / 2) / (size / 2);
      const distance = u * u + v * v;
      const index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
      pixels[index + 3] = Math.round(255 * Math.max(0, 1 - distance) ** 3);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

export function WorldDetail() {
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const panels = useMemo(() => makeWallPanels(stage), [stage]);
  const pools = useMemo(() => makeWellPools(), []);
  const texture = useMemo(() => makePoolTexture(), []);
  useEffect(() => () => panels.dispose(), [panels]);
  useEffect(() => () => pools.dispose(), [pools]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <>
      <mesh geometry={panels} frustumCulled={false}>
        <meshStandardMaterial
          vertexColors
          roughness={0.64}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={pools} frustumCulled={false} renderOrder={3}>
        <meshBasicMaterial
          color={stage.accent}
          map={texture}
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

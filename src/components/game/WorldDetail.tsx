"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { channelHeight } from "@/components/game/NetworkStage";
import { GAME_CONFIG } from "@/game/config";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";

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
  const pools = useMemo(() => makeWellPools(), []);
  const texture = useMemo(() => makePoolTexture(), []);
  useEffect(() => () => pools.dispose(), [pools]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <>
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

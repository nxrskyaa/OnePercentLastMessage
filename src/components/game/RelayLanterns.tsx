"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { channelHeight, LIGHT_STOPS } from "./NetworkStage";
import { stageAt } from "@/game/stages";
import { makeSoftLightTexture } from "@/rendering/lightTextures";
import { useGameStore } from "@/store/gameStore";

function makeLanterns() {
  const metal: THREE.BufferGeometry[] = [];
  const porcelain: THREE.BufferGeometry[] = [];
  const cores: THREE.BufferGeometry[] = [];
  const glows: THREE.BufferGeometry[] = [];
  for (const z of LIGHT_STOPS) {
    const h = channelHeight(z);
    for (const side of [-1, 1]) {
      const x = side * 31;
      const add = (
        bucket: THREE.BufferGeometry[],
        geometry: THREE.BufferGeometry,
        y: number,
      ) => {
        geometry.translate(x, h + y, z);
        bucket.push(geometry);
      };
      // The stepped foot, stem, and protective collars make the light a physical object.
      add(metal, new THREE.CylinderGeometry(2.3, 3, 1.6, 12), -13);
      add(porcelain, new THREE.CylinderGeometry(1.1, 1.7, 7.5, 12), -8.5);
      add(metal, new THREE.CylinderGeometry(2.3, 1.6, 1.2, 16), -4.2);
      add(porcelain, new THREE.CylinderGeometry(1.7, 1.9, 0.65, 16), -3.5);
      add(cores, new THREE.CapsuleGeometry(1.35, 3.6, 4, 12), -0.8);
      for (const y of [-3.2, 1.6]) {
        const collar = new THREE.TorusGeometry(1.85, 0.24, 6, 20);
        collar.rotateX(Math.PI / 2);
        add(metal, collar, y);
      }
      add(metal, new THREE.CylinderGeometry(1.35, 2.15, 1.25, 16), 2.1);
      add(porcelain, new THREE.SphereGeometry(0.7, 10, 6), 3);
      for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const guard = new THREE.CylinderGeometry(0.12, 0.12, 5, 5);
        guard.translate(
          x + Math.cos(angle) * 1.8,
          h - 0.8,
          z + Math.sin(angle) * 1.8,
        );
        metal.push(guard);
      }
      const halo = new THREE.PlaneGeometry(20, 23);
      halo.translate(x, h - 0.8, z + 2);
      glows.push(halo);
    }
  }
  const merge = (parts: THREE.BufferGeometry[]) => {
    const normalized = parts.map((part) =>
      part.index ? part.toNonIndexed() : part,
    );
    const result = mergeGeometries(normalized);
    normalized.forEach((part, index) => {
      if (part !== parts[index]) part.dispose();
    });
    parts.forEach((part) => part.dispose());
    if (!result) throw new Error("Lantern geometry could not be assembled");
    return result;
  };
  return {
    metal: merge(metal),
    porcelain: merge(porcelain),
    cores: merge(cores),
    glows: merge(glows),
  };
}

export function RelayLanterns() {
  const stage = stageAt(useGameStore((state) => state.stageIndex));
  const geometry = useMemo(() => makeLanterns(), []);
  const texture = useMemo(() => makeSoftLightTexture(), []);
  const hot = useMemo(
    () => new THREE.Color(stage.accentSoft).multiplyScalar(3.2),
    [stage],
  );
  useEffect(
    () => () => Object.values(geometry).forEach((part) => part.dispose()),
    [geometry],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <>
      <mesh geometry={geometry.metal}>
        <meshStandardMaterial
          color="#786750"
          roughness={0.3}
          metalness={0.72}
        />
      </mesh>
      <mesh geometry={geometry.porcelain}>
        <meshStandardMaterial
          color={stage.relief[2]}
          roughness={0.34}
          metalness={0.15}
        />
      </mesh>
      <mesh geometry={geometry.cores}>
        <meshBasicMaterial color={hot} toneMapped={false} />
      </mesh>
      <mesh geometry={geometry.glows}>
        <meshBasicMaterial
          color={stage.accentSoft}
          map={texture}
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

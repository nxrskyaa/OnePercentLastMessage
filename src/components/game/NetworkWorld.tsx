"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { useSettingsStore } from "@/store/settingsStore";

function random(index: number): number {
  const value = Math.sin(index * 127.1 + 18.7) * 43758.5453;
  return value - Math.floor(value);
}

export function NetworkWorld() {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const ringCount =
    quality === "low"
      ? 12
      : quality === "medium"
        ? 18
        : GAME_CONFIG.world.ringCount;
  const particleCount =
    quality === "low"
      ? 80
      : quality === "medium"
        ? 160
        : GAME_CONFIG.world.particleCount;
  const satelliteCount =
    quality === "low" ? 40 : quality === "medium" ? 60 : 80;
  const rings = useRef<THREE.InstancedMesh>(null);
  const satellites = useRef<THREE.InstancedMesh>(null);
  const linePositions = useMemo(() => {
    const vertices: number[] = [];
    const segment = (
      a: [number, number, number],
      b: [number, number, number],
    ) => {
      vertices.push(...a, ...b);
    };

    for (const x of [-16, -8, 0, 8, 16]) {
      segment([x, -3.2, 30], [x, -3.2, GAME_CONFIG.destination.z - 22]);
    }
    for (let z = 12; z >= GAME_CONFIG.destination.z - 20; z -= 24) {
      segment([-16, -3.2, z], [16, -3.2, z]);
      segment([-16, -3.2, z], [-22, 2, z - 12]);
      segment([16, -3.2, z], [22, 2, z - 12]);
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 33; i++) {
        const z = 15 - i * 21;
        const y = 2 + random(i * 7 + side) * 11;
        const nextY = 2 + random((i + 1) * 7 + side) * 11;
        segment([side * 22, y, z], [side * 22, nextY, z - 21]);
        segment(
          [side * 22, y, z],
          [side * (30 + random(i + 40) * 12), y + 7, z - 11],
        );
      }
    }
    return new Float32Array(vertices);
  }, []);

  const particlePositions = useMemo(() => {
    const result = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      result[i * 3] = (random(i + 61) - 0.5) * 110;
      result[i * 3 + 1] = (random(i + 293) - 0.5) * 80;
      result[i * 3 + 2] = 25 - random(i + 677) * 740;
    }
    return result;
  }, [particleCount]);

  useLayoutEffect(() => {
    const helper = new THREE.Object3D();
    if (rings.current) {
      for (let i = 0; i < ringCount; i++) {
        helper.position.set(0, 0, -55 - i * 29);
        helper.scale.setScalar(0.78 + random(i + 100) * 0.32);
        helper.rotation.z = random(i + 200) * 0.12;
        helper.updateMatrix();
        rings.current.setMatrixAt(i, helper.matrix);
        rings.current.setColorAt(
          i,
          new THREE.Color(i % 4 === 0 ? "#2b91bd" : "#154465"),
        );
      }
      rings.current.instanceMatrix.needsUpdate = true;
      if (rings.current.instanceColor)
        rings.current.instanceColor.needsUpdate = true;
    }
    if (satellites.current) {
      for (let i = 0; i < satelliteCount; i++) {
        helper.position.set(
          (i % 2 === 0 ? -1 : 1) * (22 + random(i + 93) * 18),
          -2 + random(i + 38) * 20,
          18 - i * 8.5,
        );
        helper.scale.setScalar(0.26 + random(i + 505) * 0.32);
        helper.updateMatrix();
        satellites.current.setMatrixAt(i, helper.matrix);
      }
      satellites.current.instanceMatrix.needsUpdate = true;
    }
  }, [ringCount, satelliteCount]);

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#246989"
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </lineSegments>
      <instancedMesh ref={rings} args={[undefined, undefined, ringCount]}>
        <torusGeometry args={[19, 0.075, 4, 72]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.33}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={satellites}
        args={[undefined, undefined, satelliteCount]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#4eb8d9" transparent opacity={0.58} />
      </instancedMesh>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#8deaff"
          size={0.2}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </>
  );
}

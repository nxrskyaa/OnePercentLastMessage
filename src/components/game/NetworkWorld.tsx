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
  const particleCount =
    quality === "low"
      ? 80
      : quality === "medium"
        ? 160
        : GAME_CONFIG.world.particleCount;
  const satelliteCount =
    quality === "low" ? 18 : quality === "medium" ? 28 : 42;
  const satellites = useRef<THREE.InstancedMesh>(null);
  const highways = useMemo(
    () =>
      [-1, 1].flatMap((side) =>
        [0, 1].map((lane) => {
          const base = lane === 0 ? 46 : 64;
          const y = lane === 0 ? 12 : 21;
          const points = Array.from({ length: 13 }, (_, i) => {
            const z = 30 - i * 60;
            return new THREE.Vector3(
              side * (base + Math.sin(z * 0.013) * 8),
              y,
              z,
            );
          });
          return {
            body: new THREE.CatmullRomCurve3(points),
            glow: new THREE.CatmullRomCurve3(
              points.map((point) =>
                point.clone().add(new THREE.Vector3(0, 1.55, 0)),
              ),
            ),
          };
        }),
      ),
    [],
  );
  const linePositions = useMemo(() => {
    const vertices: number[] = [];
    const segment = (
      a: [number, number, number],
      b: [number, number, number],
    ) => {
      vertices.push(...a, ...b);
    };

    for (const side of [-1, 1]) {
      for (let i = 0; i < 13; i++) {
        const z = -20 - i * 50;
        segment([side * 20, -8.5, z], [side * 20, -8.5, z - 24]);
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
    if (satellites.current) {
      for (let i = 0; i < satelliteCount; i++) {
        helper.position.set(
          (i % 2 === 0 ? -1 : 1) * (48 + random(i + 93) * 20),
          -2 + random(i + 38) * 20,
          18 - i * 17,
        );
        helper.scale.setScalar(0.26 + random(i + 505) * 0.32);
        helper.updateMatrix();
        satellites.current.setMatrixAt(i, helper.matrix);
      }
      satellites.current.instanceMatrix.needsUpdate = true;
    }
  }, [satelliteCount]);

  return (
    <>
      {highways.map((highway, index) => (
        <group key={index}>
          <mesh>
            <tubeGeometry args={[highway.body, 80, 1.6, 6, false]} />
            <meshStandardMaterial
              color="#273943"
              metalness={0.45}
              roughness={0.72}
            />
          </mesh>
          <mesh>
            <tubeGeometry args={[highway.glow, 80, 0.08, 4, false]} />
            <meshBasicMaterial color="#468aa5" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#32738e"
          transparent
          opacity={0.23}
          depthWrite={false}
        />
      </lineSegments>
      <instancedMesh
        ref={satellites}
        args={[undefined, undefined, satelliteCount]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#4eb8d9" transparent opacity={0.32} />
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
          opacity={0.28}
          sizeAttenuation
        />
      </points>
    </>
  );
}

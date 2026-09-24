"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { dataSurface, energySurface } from "@/rendering/materials";
import { useSettingsStore } from "@/store/settingsStore";

type Beam = { a: THREE.Vector3; b: THREE.Vector3; width: number };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildStructures(step: number) {
  const hull: Beam[] = [];
  const energy: Beam[] = [];
  const distant: Beam[] = [];
  const secure: Beam[] = [];
  const publicRoute: Beam[] = [];
  const surveillance: Beam[] = [];
  const end = GAME_CONFIG.destination.z + 35;
  for (let z = -24; z > end; z -= step) {
    const region = -z < 200 ? 0 : -z < 390 ? 1 : -z < 515 ? 2 : 3;
    const span = region === 3 ? 28 : 21;
    const height = region === 3 ? 24 : 17;
    for (const side of [-1, 1]) {
      const x = side * span;
      hull.push({
        a: V(x, -7, z),
        b: V(x, height, z),
        width: region === 3 ? 1.5 : 1,
      });
      hull.push({
        a: V(x, height, z),
        b: V(side * 7, height + 4, z),
        width: 0.8,
      });
      hull.push({
        a: V(x, -7, z),
        b: V(side * (span + 7), -11, z - 7),
        width: 0.65,
      });
      energy.push({
        a: V(x - side * 0.65, -5, z),
        b: V(x - side * 0.65, height - 1, z),
        width: 0.08,
      });
      energy.push({
        a: V(side * 7, height + 4, z),
        b: V(0, height + 4, z),
        width: 0.09,
      });
      if (region === 1) {
        energy.push({
          a: V(side * 10, -6, z),
          b: V(side * 10, -6, z - step + 3),
          width: 0.1,
        });
      }
      const towerX = side * (65 + (-z % 4) * 4);
      distant.push({
        a: V(towerX, -26, z),
        b: V(towerX, 85 + region * 8, z),
        width: 3,
      });
      distant.push({
        a: V(towerX, 36, z),
        b: V(towerX - side * 12, 53, z - step / 3),
        width: 0.9,
      });
    }
    hull.push({ a: V(-7, height + 4, z), b: V(7, height + 4, z), width: 0.65 });
    hull.push({ a: V(-span, -7, z), b: V(span, -7, z), width: 0.7 });
  }
  // A few huge remote backbones remain silhouettes beyond the active route.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const x = side * (115 + i * 31);
      distant.push({
        a: V(x, -90, -80 - i * 53),
        b: V(x, 125 + i * 7, -80 - i * 53),
        width: 5 + i * 0.5,
      });
      distant.push({
        a: V(x, 48, -80 - i * 53),
        b: V(side * 42, 32, -160 - i * 53),
        width: 1,
      });
    }
  }
  for (const side of [-1, 1]) {
    hull.push({
      a: V(side * 23, -6, 34),
      b: V(side * 23, -6, end),
      width: 1.2,
    });
    energy.push({
      a: V(side * 22.4, -5.4, 34),
      b: V(side * 22.4, -5.4, end),
      width: 0.1,
    });
    for (let z = -205; z > -395; z -= 23) {
      const target = side < 0 ? secure : publicRoute;
      target.push({
        a: V(side * 12, -5.9, z),
        b: V(side * 12, -5.9, z - 18),
        width: 0.13,
      });
      target.push({
        a: V(side * 18, 12, z),
        b: V(side * 18, 15, z - 3),
        width: 0.18,
      });
    }
  }
  for (let z = -410; z > -540; z -= 22) {
    for (const side of [-1, 1]) {
      surveillance.push({
        a: V(side * 18, 9, z),
        b: V(side * 18, 16, z),
        width: 0.13,
      });
    }
  }
  return { hull, energy, distant, secure, publicRoute, surveillance };
}

function BeamBatch({
  beams,
  material,
}: {
  beams: Beam[];
  material: THREE.Material;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    const direction = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    beams.forEach((beam, index) => {
      direction.subVectors(beam.b, beam.a);
      helper.position.copy(beam.a).addScaledVector(direction, 0.5);
      helper.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      helper.scale.set(beam.width, direction.length(), beam.width);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [beams]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, beams.length]}
      material={material}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function RelayArrays({ quality }: { quality: "low" | "medium" | "high" }) {
  const frame = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.InstancedMesh>(null);
  const count = quality === "low" ? 12 : quality === "medium" ? 18 : 24;
  const materials = useMemo(
    () => ({
      frame: dataSurface("#1a313d", "#327590"),
      light: energySurface("#408daf", 1.7),
    }),
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );
  useLayoutEffect(() => {
    const helper = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -50 - Math.floor(i / 2) * 55;
      helper.position.set(side * (38 + (i % 3) * 6), 14 + (i % 4) * 3, z);
      helper.rotation.set(0.15, side * 0.35, i * 0.17);
      helper.scale.setScalar(0.75 + (i % 3) * 0.17);
      helper.updateMatrix();
      frame.current?.setMatrixAt(i, helper.matrix);
      light.current?.setMatrixAt(i, helper.matrix);
    }
    for (const mesh of [frame.current, light.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [count]);
  return (
    <>
      <instancedMesh
        ref={frame}
        args={[undefined, undefined, count]}
        material={materials.frame}
      >
        <torusGeometry args={[9, 0.75, 6, 48]} />
      </instancedMesh>
      <instancedMesh
        ref={light}
        args={[undefined, undefined, count]}
        material={materials.light}
      >
        <torusGeometry args={[7.6, 0.12, 4, 48]} />
      </instancedMesh>
    </>
  );
}

export function SignalStructures() {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const beams = useMemo(
    () =>
      buildStructures(quality === "low" ? 58 : quality === "medium" ? 43 : 32),
    [quality],
  );
  const materials = useMemo(
    () => ({
      hull: dataSurface("#1a3441", "#3989aa"),
      distant: dataSurface("#0b1723", "#17425b"),
      energy: energySurface("#2b91b5", 1.3),
      secure: energySurface("#2e86ae", 1.6),
      publicRoute: energySurface("#b88c5a", 3.8),
      surveillance: energySurface("#9e4d53", 3.2),
    }),
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );
  return (
    <>
      <BeamBatch beams={beams.hull} material={materials.hull} />
      <BeamBatch beams={beams.energy} material={materials.energy} />
      <BeamBatch beams={beams.distant} material={materials.distant} />
      <BeamBatch beams={beams.secure} material={materials.secure} />
      <BeamBatch beams={beams.publicRoute} material={materials.publicRoute} />
      <BeamBatch beams={beams.surveillance} material={materials.surveillance} />
      <RelayArrays quality={quality} />
    </>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function StageMotion() {
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const reduced = useSettingsStore((state) => state.reducedMotion);
  const count = low ? 12 : 24;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const time = reduced ? 0 : clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? -1 : 1;
      const section = Math.floor(i / 2);
      const z = -((section * (low ? 57 : 31) + time * 5) % 700);
      dummy.position.set(
        side * (stage.motif === "halos" ? 29 : 27 + (i % 3) * 3),
        1 + Math.sin(i * 1.71 + time * 0.8) * 2.2,
        z,
      );
      dummy.rotation.set(
        stage.motif === "halos" ? 0.35 : Math.sin(time * 0.28 + i) * 0.12,
        i * 0.7 + time * (stage.motif === "prisms" ? 0.35 : 0.13),
        Math.sin(time * 0.42 + i * 0.8) * 0.24,
      );
      const size = stage.motif === "halos" ? 0.85 : 0.75 + (i % 4) * 0.12;
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      {stage.motif === "sails" && <tetrahedronGeometry args={[3, 0]} />}
      {stage.motif === "prisms" && <octahedronGeometry args={[4, 0]} />}
      {stage.motif === "halos" && <torusGeometry args={[5.6, 0.22, 4, 18]} />}
      <meshStandardMaterial
        color={stage.accent}
        emissive={stage.accentSoft}
        emissiveIntensity={0.15}
        metalness={0.1}
        roughness={0.35}
        transparent
        opacity={0.8}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

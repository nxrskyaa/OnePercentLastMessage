"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { channelHeight } from "@/components/game/NetworkStage";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function StageMotion() {
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const reduced = useSettingsStore((state) => state.reducedMotion);
  const markCount = low ? 24 : 42;
  const routeMarks = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const time = reduced ? 0 : clock.elapsedTime;
    if (!routeMarks.current) return;
    for (let i = 0; i < markCount; i++) {
      const z = -((i * 17 + time * 10) % 680);
      const side = i % 2 ? -1 : 1;
      dummy.position.set(
        side * (5 + (i % 3) * 2.5),
        -20.55 + channelHeight(z),
        z,
      );
      dummy.rotation.set(0, side * (stage.motif === "prisms" ? 0.72 : 0.4), 0);
      dummy.scale.set(0.55 + (i % 4) * 0.15, 1, 1);
      dummy.updateMatrix();
      routeMarks.current.setMatrixAt(i, dummy.matrix);
    }
    routeMarks.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={routeMarks}
        args={[undefined, undefined, markCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[2.5, 0.07, 0.22]} />
        <meshBasicMaterial
          color={stage.accent}
          transparent
          opacity={0.78}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

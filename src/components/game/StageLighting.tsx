"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { channelHeight, LIGHT_STOPS } from "@/components/game/NetworkStage";
import { stageAt } from "@/game/stages";
import { GAME_CONFIG } from "@/game/config";
import { signalState } from "@/rendering/signalState";
import { useGameStore } from "@/store/gameStore";

export function StageLighting({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const left = useRef<THREE.PointLight>(null);
  const right = useRef<THREE.PointLight>(null);
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);

  useFrame((_, delta) => {
    const z = playerRef.current?.position.z ?? 0;
    let nearest = LIGHT_STOPS[0];
    for (const stop of LIGHT_STOPS) {
      if (Math.abs(z - stop) < Math.abs(z - nearest)) nearest = stop;
    }
    const distance = Math.abs(z - nearest);
    const strength = THREE.MathUtils.smoothstep(86 - distance, 0, 72);
    const height = channelHeight(nearest);
    const target =
      strength *
      GAME_CONFIG.world.fixtureLightIntensity *
      (stage.motif === "halos" ? 0.62 : stage.motif === "prisms" ? 0.72 : 1) *
      (1 + signalState.boost.value * 0.3);
    if (left.current) {
      left.current.position.set(
        -29,
        THREE.MathUtils.damp(left.current.position.y, height - 5, 2.4, delta),
        THREE.MathUtils.damp(left.current.position.z, nearest, 2.4, delta),
      );
      left.current.intensity = THREE.MathUtils.damp(
        left.current.intensity,
        target,
        4.5,
        delta,
      );
    }
    if (right.current) {
      right.current.position.set(
        29,
        THREE.MathUtils.damp(right.current.position.y, height - 5, 2.4, delta),
        THREE.MathUtils.damp(right.current.position.z, nearest, 2.4, delta),
      );
      right.current.intensity = THREE.MathUtils.damp(
        right.current.intensity,
        target,
        4.5,
        delta,
      );
    }
  });

  return (
    <>
      <pointLight
        ref={left}
        position={[-29, channelHeight(LIGHT_STOPS[0]) - 5, LIGHT_STOPS[0]]}
        color={stage.accentSoft}
        intensity={0}
        distance={GAME_CONFIG.world.fixtureLightDistance}
        decay={2}
      />
      <pointLight
        ref={right}
        position={[29, channelHeight(LIGHT_STOPS[0]) - 5, LIGHT_STOPS[0]]}
        color={stage.accentSoft}
        intensity={0}
        distance={GAME_CONFIG.world.fixtureLightDistance}
        decay={2}
      />
    </>
  );
}

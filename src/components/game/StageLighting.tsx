"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { dockHeight as channelHeight, HARBOR } from "@/game/harbor";
const LIGHT_STOPS: readonly number[] = HARBOR.lightStops;
import { stageAt } from "@/game/stages";
import { GAME_CONFIG } from "@/game/config";
import { signalState } from "@/rendering/signalState";
import { useGameStore } from "@/store/gameStore";
import { flightCenter } from "@/game/flightPath";

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
    // Fade before switching fixtures; a light must stay attached to its lantern.
    const strength = Math.exp(-Math.pow(distance / 25, 4));
    const height = channelHeight(nearest);
    const center = flightCenter(nearest, stageIndex);
    const target =
      strength *
      GAME_CONFIG.world.fixtureLightIntensity *
      (stage.motif === "halos" ? 0.62 : stage.motif === "prisms" ? 0.72 : 1) *
      (1 + signalState.boost.value * 0.3);
    if (left.current) {
      left.current.position.set(
        center.x - 31,
        center.y + height - 0.8,
        nearest,
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
        center.x + 31,
        center.y + height - 0.8,
        nearest,
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
        onUpdate={(object) => object.layers.enable(1)}
        ref={left}
        position={[-29, channelHeight(LIGHT_STOPS[0]) - 5, LIGHT_STOPS[0]]}
        color={stage.accentSoft}
        intensity={0}
        distance={GAME_CONFIG.world.fixtureLightDistance}
        decay={2}
      />
      <pointLight
        onUpdate={(object) => object.layers.enable(1)}
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

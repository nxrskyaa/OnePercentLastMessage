"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { signalState } from "@/rendering/signalState";
import { useSettingsStore } from "@/store/settingsStore";

export function ScanPulse({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const age = useRef(1);
  const lastPulse = useRef(0);
  const wave = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, frameDelta) => {
    const state = useGameStore.getState();
    const pulse = state.scanPulse;
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      age.current = 0;
      if (playerRef.current)
        signalState.scanOrigin.value.copy(playerRef.current.position);
    }
    if (!playerRef.current) return;
    if (state.phase === "playing")
      age.current = Math.min(1, age.current + Math.min(frameDelta, 0.05) * 2.2);
    signalState.scanRadius.value = age.current * 96;
    const active = state.phase === "playing" || state.phase === "paused";
    signalState.scanStrength.value =
      active && age.current < 1 ? 1 - age.current : 0;
    if (wave.current && ring.current) {
      wave.current.visible = signalState.scanStrength.value > 0;
      wave.current.position.copy(signalState.scanOrigin.value);
      const reduced = useSettingsStore.getState().reducedMotion;
      ring.current.scale.setScalar(1 + age.current * (reduced ? 10 : 55));
      (ring.current.material as THREE.MeshBasicMaterial).opacity =
        signalState.scanStrength.value * (reduced ? 0.12 : 0.45);
    }
    const phase = state.phase;
    signalState.success.value = THREE.MathUtils.damp(
      signalState.success.value,
      phase === "success" ? 1 : 0,
      2.8,
      frameDelta,
    );
    signalState.failure.value = THREE.MathUtils.damp(
      signalState.failure.value,
      phase === "failed" ? 1 : 0,
      2.8,
      frameDelta,
    );
  });
  return (
    <group ref={wave} visible={false} name="scan-wave">
      <mesh ref={ring} rotation={[-0.35, 0, 0]}>
        <torusGeometry args={[1, 0.014, 4, 48]} />
        <meshBasicMaterial
          color="#b2f5ec"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

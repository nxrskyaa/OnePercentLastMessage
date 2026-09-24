"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { signalState } from "@/rendering/signalState";

export function ScanPulse({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const age = useRef(1);
  const lastPulse = useRef(0);
  useFrame((_, frameDelta) => {
    const pulse = useGameStore.getState().scanPulse;
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      age.current = 0;
    }
    if (!mesh.current || !playerRef.current) return;
    age.current = Math.min(1, age.current + Math.min(frameDelta, 0.05) * 1.6);
    mesh.current.position.copy(playerRef.current.position);
    signalState.scanOrigin.value.copy(playerRef.current.position);
    signalState.scanRadius.value = age.current * 96;
    signalState.scanStrength.value = age.current < 1 ? 1 - age.current : 0;
    const phase = useGameStore.getState().phase;
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
    mesh.current.scale.setScalar(1 + age.current * 35);
    const material = mesh.current.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - age.current) * 0.28;
    mesh.current.visible = age.current < 1;
  });
  return (
    <mesh ref={mesh} visible={false}>
      <torusGeometry args={[1, 0.013, 4, 64]} />
      <meshBasicMaterial
        color="#70cce3"
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

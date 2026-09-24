"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { useGameStore } from "@/store/gameStore";

export function ChaseCamera({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const lookTarget = useRef(
    new THREE.Vector3(0, 0, -GAME_CONFIG.camera.lookAhead),
  );
  const desired = useRef(new THREE.Vector3());

  useFrame(({ camera }, frameDelta) => {
    const player = playerRef.current;
    if (!player || !(camera instanceof THREE.PerspectiveCamera)) return;
    const delta = Math.min(frameDelta, 0.05);
    desired.current.set(
      player.position.x * 0.72,
      player.position.y + 5,
      player.position.z + 13,
    );
    camera.position.lerp(
      desired.current,
      1 - Math.exp(-GAME_CONFIG.camera.followResponse * delta),
    );
    desired.current.set(
      player.position.x * 0.82,
      player.position.y + 0.3,
      player.position.z - GAME_CONFIG.camera.lookAhead,
    );
    lookTarget.current.lerp(desired.current, 1 - Math.exp(-4.5 * delta));
    camera.lookAt(lookTarget.current);
    const fov = useGameStore.getState().boosting
      ? GAME_CONFIG.camera.boostFov
      : GAME_CONFIG.camera.baseFov;
    const nextFov = THREE.MathUtils.damp(camera.fov, fov, 3.4, delta);
    if (Math.abs(camera.fov - nextFov) > 0.01) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function ChaseCamera({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const lookTarget = useRef(
    new THREE.Vector3(0, 0, -GAME_CONFIG.camera.lookAhead),
  );
  const desired = useRef(new THREE.Vector3());
  const lastDamage = useRef(0);
  const shake = useRef(0);

  useFrame(({ camera, clock }, frameDelta) => {
    const player = playerRef.current;
    if (!player || !(camera instanceof THREE.PerspectiveCamera)) return;
    const delta = Math.min(frameDelta, 0.05);
    const state = useGameStore.getState();
    const settings = useSettingsStore.getState();
    const menu = !["playing", "paused", "success", "failed"].includes(
      state.phase,
    );
    const orbit =
      menu && !settings.reducedMotion
        ? Math.sin(clock.elapsedTime * 0.17) * 2.4
        : 0;
    desired.current.set(
      player.position.x * 0.72 + orbit,
      player.position.y + (menu ? 5.8 : 5),
      player.position.z + (menu ? 16 : 13),
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
    if (state.damagePulse !== lastDamage.current) {
      lastDamage.current = state.damagePulse;
      if (settings.cameraShake && !settings.reducedMotion) shake.current = 1;
    }
    shake.current = Math.max(0, shake.current - delta * 3.8);
    camera.position.x +=
      Math.sin(clock.elapsedTime * 84) * shake.current * 0.14;
    camera.position.y += Math.cos(clock.elapsedTime * 71) * shake.current * 0.1;
    camera.lookAt(lookTarget.current);
    const fov = state.boosting
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

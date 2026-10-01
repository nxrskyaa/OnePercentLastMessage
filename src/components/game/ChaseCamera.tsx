"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { flightCenter } from "@/game/flightPath";
import { presentationState, easeShot } from "@/game/presentation";

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
    const intro = state.phase === "ident" || state.phase === "title";
    const menu = !["playing", "paused", "success", "failed"].includes(
      state.phase,
    );
    const menuOffset = camera.aspect < 1 ? -3 : -8;
    if (intro && !settings.reducedMotion) {
      const time = presentationState.introTime;
      const wide = easeShot(time, 1.1, 3.8),
        hero = easeShot(time, 4.3, 6);
      camera.position.set(
        player.position.x +
          THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(
              camera.aspect < 1 ? 0.2 : 1.3,
              camera.aspect < 1 ? 10 : 26,
              wide,
            ),
            menuOffset,
            hero,
          ),
        player.position.y +
          THREE.MathUtils.lerp(THREE.MathUtils.lerp(1.4, 16, wide), 5, hero),
        player.position.z +
          THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(camera.aspect < 1 ? 8.5 : 4.6, 28, wide),
            17,
            hero,
          ),
      );
      lookTarget.current.set(
        player.position.x + menuOffset * hero,
        player.position.y + 0.5,
        player.position.z - 7 * wide * (1 - hero),
      );
      camera.lookAt(lookTarget.current);
      camera.fov = THREE.MathUtils.lerp(52, GAME_CONFIG.camera.baseFov, wide);
      camera.updateProjectionMatrix();
      return;
    }
    const launch =
      state.phase === "countdown"
        ? easeShot(presentationState.phaseTime, 0, 1.8)
        : 0;
    const orbit =
      menu && !settings.reducedMotion
        ? Math.sin(presentationState.time * 0.3) * 0.55 * (1 - launch)
        : 0;
    const center = flightCenter(player.position.z, state.stageIndex);
    const back = flightCenter(
      player.position.z + (menu ? 17 : 11),
      state.stageIndex,
    );
    const ahead = flightCenter(
      player.position.z - (menu ? 7 : GAME_CONFIG.camera.lookAhead),
      state.stageIndex,
    );
    const localX = player.position.x - center.x;
    const localY = player.position.y - center.y;
    desired.current.set(
      back.x + localX * 0.72 + (menu ? menuOffset * (1 - launch) : 0) + orbit,
      back.y + localY + (menu ? 5 : 4.6),
      player.position.z + (menu ? 17 - launch * 6 : 11),
    );
    if (menu) camera.position.copy(desired.current);
    else
      camera.position.lerp(
        desired.current,
        1 - Math.exp(-GAME_CONFIG.camera.followResponse * delta),
      );
    desired.current.set(
      (menu ? center.x + menuOffset * (1 - launch) : ahead.x) + localX * 0.82,
      (menu ? center.y : ahead.y) + localY + 0.3,
      player.position.z -
        (menu
          ? GAME_CONFIG.camera.lookAhead * launch
          : GAME_CONFIG.camera.lookAhead),
    );
    if (menu) lookTarget.current.copy(desired.current);
    else lookTarget.current.lerp(desired.current, 1 - Math.exp(-4.5 * delta));
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

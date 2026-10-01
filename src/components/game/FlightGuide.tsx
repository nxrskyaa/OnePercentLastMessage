"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { flightCenter } from "@/game/flightPath";
import { pilotTarget } from "@/game/pilot";
import type { GameNode } from "@/game/nodes";
import { signalState } from "@/rendering/signalState";
import { useGameStore } from "@/store/gameStore";

/** Three draw calls, fixed buffers: a route line, seven breadcrumbs and an aim marker. */
export function FlightGuide({
  nodes,
  playerRef,
}: {
  nodes: GameNode[];
  playerRef: RefObject<THREE.Group | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  const marker = useRef<THREE.Mesh>(null);
  const dots = useRef<THREE.InstancedMesh>(null);
  const resources = useMemo(() => {
    const points = new Float32Array(GAME_CONFIG.guidance.points * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(points, 3).setUsage(THREE.DynamicDrawUsage),
    );
    const material = new THREE.LineBasicMaterial({
      color: "#b5fff0",
      transparent: true,
      opacity: 0.62,
      toneMapped: false,
    });
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;
    return { points, geometry, material, line, matrix: new THREE.Matrix4() };
  }, []);
  useEffect(
    () => () => {
      resources.geometry.dispose();
      resources.material.dispose();
    },
    [resources],
  );

  useFrame(() => {
    const player = playerRef.current;
    const line = lineRef.current;
    if (!player || !group.current || !line) return;
    const state = useGameStore.getState();
    group.current.visible =
      state.phase === "playing" || state.phase === "paused";
    if (!group.current.visible) return;
    const target = pilotTarget(
      nodes,
      player.position.z,
      signalState.flightTime,
    );
    const targetZ = target?.node.z ?? GAME_CONFIG.destination.z;
    const distance = player.position.z - targetZ;
    const reach = Math.min(distance, GAME_CONFIG.guidance.visibleAhead);
    const start = flightCenter(player.position.z, state.stageIndex);
    const localX = player.position.x - start.x;
    const localY = player.position.y - start.y;
    const count = GAME_CONFIG.guidance.points;
    for (let i = 0; i < count; i++) {
      const travel = (Math.max(0.1, reach) * i) / (count - 1);
      const z = player.position.z - travel;
      const t = Math.min(1, travel / Math.max(1, distance));
      const ease = t * t * (3 - 2 * t);
      const center = flightCenter(z, state.stageIndex);
      const x = center.x + THREE.MathUtils.lerp(localX, target?.x ?? 0, ease);
      const y =
        center.y + THREE.MathUtils.lerp(localY - 0.7, target?.y ?? 0, ease);
      line.geometry.attributes.position.setXYZ(i, x, y, z);
      if (i > 0 && i % 5 === 0 && dots.current) {
        resources.matrix.makeTranslation(x, y, z);
        dots.current.setMatrixAt(i / 5 - 1, resources.matrix);
      }
    }
    line.geometry.attributes.position.needsUpdate = true;
    if (dots.current) dots.current.instanceMatrix.needsUpdate = true;
    if (marker.current) {
      marker.current.visible = distance <= GAME_CONFIG.guidance.visibleAhead;
      const center = flightCenter(targetZ, state.stageIndex);
      marker.current.position.set(
        center.x + (target?.x ?? 0),
        center.y + (target?.y ?? 0),
        targetZ + 1.5,
      );
    }
  });
  return (
    <group ref={group} visible={false}>
      <primitive ref={lineRef} object={resources.line} />
      <instancedMesh
        ref={dots}
        args={[undefined, undefined, 7]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color="#b5fff0" toneMapped={false} />
      </instancedMesh>
      <mesh ref={marker} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.95, 1.2, 4]} />
        <meshBasicMaterial
          color="#b5fff0"
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

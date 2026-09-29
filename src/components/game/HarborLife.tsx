"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HARBOR } from "@/game/harbor";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { signalState } from "@/rendering/signalState";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const COUNT = 32;
function buoyGeometry() {
  const hull = new THREE.CylinderGeometry(1.35, 2.1, 1.8, 12);
  const mast = new THREE.CylinderGeometry(0.14, 0.26, 5, 8).translate(0, 3, 0);
  const shade = new THREE.ConeGeometry(1.1, 1.1, 12).translate(0, 6.1, 0);
  const result = mergeGeometries([hull, mast, shade]);
  [hull, mast, shade].forEach((g) => g.dispose());
  return result!;
}

/** Damped spring buoys respond to the packet wake and scan; no rigid body engine. */
export function HarborLife({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const stage = stageAt(useGameStore((s) => s.stageIndex));
  const hulls = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const shuttles = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => buoyGeometry(), []);
  const simulationRef = useRef({
    object: new THREE.Object3D(),
    angle: new Float32Array(COUNT),
    velocity: new Float32Array(COUNT),
    time: 0,
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    const simulation = simulationRef.current;
    const reduced = useSettingsStore.getState().reducedMotion;
    const active = useGameStore.getState().phase === "playing";
    const dt = active && !reduced ? Math.min(delta, 0.033) : 0;
    simulation.time += dt;
    const t = simulation.time,
      object = simulation.object;
    for (let i = 0; i < COUNT; i++) {
      const side = i % 2 ? -1 : 1,
        x = side * (19 + (i % 3) * 2.7),
        z = 20 - Math.floor(i / 2) * 43;
      const playerZ = playerRef.current?.position.z ?? 0;
      const playerX = playerRef.current?.position.x ?? 0;
      const proximity =
        Math.exp(-Math.pow((z - playerZ) / 10, 2)) *
        (1 - Math.min(1, Math.abs(x - playerX) / 45));
      const radius = Math.hypot(
        x - signalState.scanOrigin.value.x,
        z - signalState.scanOrigin.value.z,
      );
      const scan =
        Math.exp(-Math.pow((radius - signalState.scanRadius.value) / 5, 2)) *
        signalState.scanStrength.value;
      const target =
        Math.sin(t * 0.8 + i) * 0.04 +
        side *
          (proximity * (0.36 + signalState.boost.value * 0.2) + scan * 0.24);
      simulation.velocity[i] +=
        ((target - simulation.angle[i]) * HARBOR.springStiffness -
          simulation.velocity[i] * HARBOR.springDamping) *
        dt;
      simulation.angle[i] += simulation.velocity[i] * dt;
      object.position.set(
        x,
        HARBOR.waterY + 1 + Math.sin(t * 0.9 + i) * 0.18,
        z,
      );
      object.rotation.set(
        Math.sin(t * 0.6 + i) * 0.035,
        0,
        simulation.angle[i],
      );
      object.scale.set(1, 1, 1);
      object.updateMatrix();
      hulls.current?.setMatrixAt(i, object.matrix);
      object.translateY(5.3);
      object.scale.set(0.48, 0.8, 0.48);
      object.updateMatrix();
      bulbs.current?.setMatrixAt(i, object.matrix);
    }
    for (let i = 0; i < 8; i++) {
      const z = -75 - i * 76,
        direction = i % 2 ? 1 : -1;
      object.position.set(
        Math.sin(t * 0.13 + i * 2) * 70,
        27 + (i % 3) * 12,
        z,
      );
      object.rotation.set(0, 0, Math.cos(t * 0.13 + i * 2) * -0.12 * direction);
      object.scale.set(2.8, 1, 1.2);
      object.updateMatrix();
      shuttles.current?.setMatrixAt(i, object.matrix);
    }
    for (const mesh of [hulls.current, bulbs.current, shuttles.current])
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        onUpdate={(object) => object.layers.enable(1)}
        ref={hulls}
        args={[geometry, undefined, COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial color="#699193" roughness={0.3} metalness={0.6} />
      </instancedMesh>
      <instancedMesh
        onUpdate={(object) => object.layers.enable(1)}
        ref={bulbs}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 10, 6]} />
        <meshBasicMaterial
          color={new THREE.Color(stage.accentSoft).multiplyScalar(2.5)}
        />
      </instancedMesh>
      <instancedMesh
        onUpdate={(object) => object.layers.enable(1)}
        ref={shuttles}
        args={[undefined, undefined, 8]}
        frustumCulled={false}
      >
        <capsuleGeometry args={[0.65, 2.5, 3, 8]} />
        <meshStandardMaterial
          color={stage.accent}
          emissive={stage.accent}
          emissiveIntensity={0.5}
          roughness={0.22}
          metalness={0.6}
        />
      </instancedMesh>
    </>
  );
}

"use client";
import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

/** Event-only waves and metal sparks; zero draw calls while idle. */
export function FlightFeedback({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const group = useRef<THREE.Group>(null),
    wave = useRef<THREE.Mesh>(null),
    sparks = useRef<THREE.InstancedMesh>(null);
  const motion = useRef({
    last: 0,
    age: 1,
    damage: false,
    object: new THREE.Object3D(),
  });
  useFrame((_, delta) => {
    const state = useGameStore.getState(),
      m = motion.current;
    if (
      !group.current ||
      !wave.current ||
      !sparks.current ||
      !playerRef.current
    )
      return;
    const active = state.phase === "playing" || state.phase === "paused";
    if (
      state.feedback &&
      state.feedback.id !== m.last &&
      state.phase === "playing"
    ) {
      m.last = state.feedback.id;
      m.age = 0;
      m.damage = state.feedback.tone === "red";
      group.current.position.copy(playerRef.current.position);
      const color = m.damage
        ? "#ff946f"
        : state.feedback.tone === "gold"
          ? "#ffe6a6"
          : "#adf4ee";
      (wave.current.material as THREE.MeshBasicMaterial).color.set(color);
      (sparks.current.material as THREE.MeshBasicMaterial).color.set(color);
    }
    if (state.phase === "playing")
      m.age = Math.min(1, m.age + Math.min(delta, 0.05) * 1.8);
    group.current.visible = active && m.age < 1;
    if (!group.current.visible) return;
    const reduced = useSettingsStore.getState().reducedMotion;
    wave.current.scale.setScalar(1 + m.age * (reduced ? 2 : m.damage ? 5 : 11));
    (wave.current.material as THREE.MeshBasicMaterial).opacity =
      (1 - m.age) * 0.5;
    sparks.current.visible = m.damage && !reduced;
    (sparks.current.material as THREE.MeshBasicMaterial).opacity = 1 - m.age;
    for (let i = 0; i < 12; i++) {
      const angle = i * 2.39996,
        radius = 0.7 + m.age * (3 + (i % 4));
      m.object.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius - m.age * m.age * 2,
        m.age * 2 + (i % 3) * 0.18,
      );
      m.object.rotation.set(0, 0, angle);
      m.object.scale.set(1, 1 - m.age * 0.7, 1);
      m.object.updateMatrix();
      sparks.current.setMatrixAt(i, m.object.matrix);
    }
    sparks.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={group} visible={false}>
      <mesh ref={wave}>
        <torusGeometry args={[0.8, 0.025, 4, 32]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <instancedMesh
        ref={sparks}
        args={[undefined, undefined, 12]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.055, 0.48, 0.03]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

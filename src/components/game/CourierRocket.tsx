"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CourierCraft } from "@/game/crafts";
import { buildCraft } from "@/rendering/craftGeometry";
import { signalState } from "@/rendering/signalState";
import { NitroDrive } from "./NitroDrive";
import { useSettingsStore } from "@/store/settingsStore";
import { useGameStore } from "@/store/gameStore";

export function CourierRocket({ craft }: { craft: CourierCraft }) {
  const phase = useGameStore((s) => s.phase);
  const geometry = useMemo(() => buildCraft(craft), [craft]);
  const materials = useMemo(
    () => ({
      hull: new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        metalness: 0.16,
        roughness: 0.34,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      }),
      metal: new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.72,
        roughness: 0.32,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        metalness: 0.48,
        roughness: 0.15,
        clearcoat: 1,
      }),
      light: new THREE.MeshBasicMaterial({
        vertexColors: true,
        toneMapped: false,
      }),
      ink: new THREE.MeshBasicMaterial({
        color: "#102637",
        side: THREE.BackSide,
      }),
    }),
    [],
  );
  const heat = useRef<THREE.Mesh>(null);
  const vanes = useRef<Array<THREE.Group | null>>([]);
  useEffect(
    () => () => Object.values(geometry).forEach((g) => g.dispose()),
    [geometry],
  );
  useEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials],
  );
  useFrame((_, dt) => {
    const active = useGameStore.getState().phase === "playing";
    const reduced = useSettingsStore.getState().reducedMotion;
    const hit = active ? signalState.damage : 0;
    materials.hull.emissive.setRGB(hit * 0.24, hit * 0.025, hit * 0.01);
    vanes.current.forEach((vane, index) => {
      if (!vane) return;
      const side = index % 2 === 0 ? -1 : 1;
      vane.rotation.x = THREE.MathUtils.damp(
        vane.rotation.x,
        reduced
          ? 0
          : active
            ? signalState.lift * 0.32 + signalState.boost.value * 0.16
            : 0.05,
        14,
        Math.min(dt, 0.05),
      );
      vane.rotation.z = THREE.MathUtils.damp(
        vane.rotation.z,
        reduced || !active ? 0 : signalState.steer * side * 0.22,
        14,
        Math.min(dt, 0.05),
      );
    });
    if (heat.current) {
      const material = heat.current.material as THREE.MeshBasicMaterial;
      material.color.setScalar(1.1 + signalState.boost.value * 1.2);
    }
  });
  return (
    <group name={`courier-${craft.kind}`} dispose={null}>
      <group
        visible={["ident", "title", "menu", "briefing", "countdown"].includes(
          phase,
        )}
        scale={1.035}
      >
        <mesh geometry={geometry.hull} material={materials.ink} />
        <mesh geometry={geometry.metal} material={materials.ink} />
        <mesh geometry={geometry.glass} material={materials.ink} />
      </group>
      <mesh geometry={geometry.hull} material={materials.hull} />
      <mesh geometry={geometry.metal} material={materials.metal} />
      <mesh geometry={geometry.glass} material={materials.glass} />
      <mesh ref={heat} geometry={geometry.light} material={materials.light} />
      {craft.engines.map(([x, y, z], index) => (
        <group
          key={index}
          position={[x, y + 0.32, z - 0.5]}
          ref={(vane) => {
            vanes.current[index] = vane;
          }}
        >
          <mesh position={[0, 0, 0.25]}>
            <boxGeometry args={[0.48, 0.045, 0.55]} />
            <meshStandardMaterial
              color={craft.trim}
              metalness={0.45}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
      <NitroDrive craft={craft} />
    </group>
  );
}

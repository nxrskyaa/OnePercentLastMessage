"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CourierCraft } from "@/game/crafts";
import { buildCraft } from "@/rendering/craftGeometry";
import { signalState } from "@/rendering/signalState";
import { NitroDrive } from "./NitroDrive";

export function CourierRocket({ craft }: { craft: CourierCraft }) {
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
    }),
    [],
  );
  const heat = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => Object.values(geometry).forEach((g) => g.dispose()),
    [geometry],
  );
  useEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials],
  );
  useFrame(() => {
    if (heat.current) {
      const material = heat.current.material as THREE.MeshBasicMaterial;
      material.color.setScalar(1.1 + signalState.boost.value * 1.2);
    }
  });
  return (
    <group name={`courier-${craft.kind}`} dispose={null}>
      <mesh geometry={geometry.hull} material={materials.hull} />
      <mesh geometry={geometry.metal} material={materials.metal} />
      <mesh geometry={geometry.glass} material={materials.glass} />
      <mesh ref={heat} geometry={geometry.light} material={materials.light} />
      <NitroDrive craft={craft} />
    </group>
  );
}

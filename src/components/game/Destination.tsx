"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { createChatGeometry } from "@/rendering/chatGeometry";

export function Destination() {
  const geometry = useMemo(
    () => ({
      aperture: createChatGeometry(124, 88, 14, 30),
      inner: createChatGeometry(91, 65, 5, 25),
      satellite: createChatGeometry(31, 19, 4),
    }),
    [],
  );
  const core = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => Object.values(geometry).forEach((item) => item.dispose()),
    [geometry],
  );
  useFrame(({ clock }, delta) => {
    if (core.current) {
      core.current.rotation.z += Math.min(delta, 0.05) * 0.18;
      core.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.14;
    }
    if (pulse.current)
      pulse.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.2) * 0.08,
      );
  });
  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      <mesh
        geometry={geometry.aperture}
        position={[0, 0, -18]}
        rotation={[0, -0.1, -0.04]}
      >
        <meshPhysicalMaterial
          color="#327cae"
          metalness={0.2}
          roughness={0.28}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          emissive="#126a9b"
          emissiveIntensity={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        geometry={geometry.inner}
        position={[0, 0, -5]}
        rotation={[0, 0.09, 0.04]}
      >
        <meshPhysicalMaterial
          color="#68c6dd"
          metalness={0.18}
          roughness={0.23}
          clearcoat={0.95}
          clearcoatRoughness={0.12}
          emissive="#4ab9d3"
          emissiveIntensity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        geometry={geometry.satellite}
        position={[-82, 39, -45]}
        rotation={[0.12, -0.38, -0.23]}
      >
        <meshPhysicalMaterial
          color="#78649f"
          metalness={0.2}
          roughness={0.28}
          clearcoat={0.8}
          emissive="#463e85"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh
        geometry={geometry.satellite}
        position={[82, -31, -39]}
        rotation={[-0.1, 0.49, 0.3]}
        scale={0.9}
      >
        <meshPhysicalMaterial
          color="#bb9062"
          metalness={0.2}
          roughness={0.28}
          clearcoat={0.8}
          emissive="#8e5731"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0, -28]}>
        <circleGeometry args={[22, 48]} />
        <meshBasicMaterial
          color="#137da4"
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={core}>
        <mesh position={[0, 0, -13]} rotation={[0, 0, Math.PI / 4]}>
          <icosahedronGeometry args={[14, 1]} />
          <meshPhysicalMaterial
            color="#4ea8d1"
            metalness={0.15}
            roughness={0.16}
            clearcoat={1}
            emissive="#4fb9e6"
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
        <mesh ref={pulse} position={[0, 0, 7]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[4.5, 0]} />
          <meshBasicMaterial color="#e8ffff" toneMapped={false} />
        </mesh>
      </group>
      <pointLight color="#8fe9f7" intensity={42} distance={150} decay={2} />
    </group>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";

export function Destination() {
  const rings = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (rings.current) rings.current.rotation.z += Math.min(delta, 0.05) * 0.12;
    if (core.current)
      core.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.5) * 0.07,
      );
  });

  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[5.5, 2]} />
        <meshBasicMaterial color="#d6ffff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.2, 24, 16]} />
        <meshBasicMaterial
          color="#2aaed0"
          wireframe
          transparent
          opacity={0.36}
        />
      </mesh>
      <group ref={rings}>
        {[11, 14, 18].map((radius, index) => (
          <mesh key={radius} rotation={[0, 0, index * 0.4]}>
            <torusGeometry args={[radius, index === 0 ? 0.27 : 0.1, 6, 96]} />
            <meshBasicMaterial
              color={index === 0 ? "#9cf8ff" : "#48b4dd"}
              transparent
              opacity={index === 0 ? 0.95 : 0.55}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 45, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 90, 8]} />
        <meshBasicMaterial
          color="#64e3f1"
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#a3f8ff" intensity={65} distance={90} decay={2} />
    </group>
  );
}

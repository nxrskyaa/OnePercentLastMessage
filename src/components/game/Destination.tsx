"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { stageAt } from "@/game/stages";
import { createSignalBlade } from "@/rendering/signalBlade";
import { useGameStore } from "@/store/gameStore";

export function Destination() {
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const blade = useMemo(() => createSignalBlade(), []);
  const heart = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  useEffect(() => () => blade.dispose(), [blade]);
  useFrame(({ clock }, delta) => {
    if (heart.current) {
      heart.current.rotation.y += Math.min(delta, 0.05) * 0.22;
      heart.current.rotation.z = Math.sin(clock.elapsedTime * 0.37) * 0.055;
    }
    if (beacon.current)
      beacon.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.1) * 0.085,
      );
  });

  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      {/* A monumental receiver: layered, beveled signal blades wrap a live core. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            geometry={blade}
            position={[0, side * 10, -35]}
            rotation={[side * 0.12, side * -0.18, side < 0 ? Math.PI : 0]}
            scale={[2.7, 2.7, 1.45]}
          >
            <meshPhysicalMaterial
              color={stage.channel[0]}
              vertexColors
              metalness={0.35}
              roughness={0.29}
              clearcoat={0.95}
              emissive={stage.accentSoft}
              emissiveIntensity={0.26}
            />
          </mesh>
          <mesh
            geometry={blade}
            position={[0, side * 7, -12]}
            rotation={[side * 0.08, side * -0.09, side < 0 ? Math.PI : 0]}
            scale={[1.86, 1.86, 1.05]}
          >
            <meshPhysicalMaterial
              color={stage.channel[1]}
              vertexColors
              metalness={0.15}
              roughness={0.24}
              clearcoat={1}
              emissive={stage.accentSoft}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}
      <group ref={heart}>
        <mesh position={[0, 0, -13]} rotation={[0.2, 0.2, Math.PI / 4]}>
          <octahedronGeometry args={[18, 0]} />
          <meshPhysicalMaterial
            color={stage.current[0]}
            metalness={0.55}
            roughness={0.18}
            clearcoat={1}
          />
        </mesh>
        <mesh ref={beacon} position={[0, 0, 5]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[8, 0]} />
          <meshBasicMaterial color={stage.accent} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

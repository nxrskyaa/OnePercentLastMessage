"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { dataSurface, energySurface } from "@/rendering/materials";

export function Destination() {
  const rotor = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const materials = useMemo(
    () => ({
      hull: dataSurface("#202f39", "#37687b"),
      inset: dataSurface("#101d27", "#26485b"),
      core: energySurface("#e1ffff", 2.8),
      conduit: energySurface("#55acc9", 1.2),
    }),
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );
  useFrame(({ clock }, delta) => {
    if (rotor.current) rotor.current.rotation.z += Math.min(delta, 0.05) * 0.17;
    if (core.current)
      core.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.5) * 0.08,
      );
  });
  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      {/* Tall split monoliths give the receiver a recognizable outline at range. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 51, 8, -8]} material={materials.hull}>
            <boxGeometry args={[14, 138, 20]} />
          </mesh>
          <mesh position={[side * 51, 8, 3]} material={materials.inset}>
            <boxGeometry args={[9, 110, 1.2]} />
          </mesh>
          <mesh position={[side * 51, 59, 4]} material={materials.conduit}>
            <boxGeometry args={[1.3, 9, 0.35]} />
          </mesh>
          <mesh position={[side * 47, 12, 4.8]} material={materials.conduit}>
            <boxGeometry args={[0.55, 67, 0.3]} />
          </mesh>
          <mesh
            position={[side * 36, 52, -7]}
            rotation={[0, 0, side * 0.39]}
            material={materials.hull}
          >
            <boxGeometry args={[6, 58, 12]} />
          </mesh>
          <mesh
            position={[side * 31, -44, -7]}
            rotation={[0, 0, -side * 0.48]}
            material={materials.hull}
          >
            <boxGeometry args={[7, 65, 13]} />
          </mesh>
          <mesh position={[side * 61, -28, 10]} material={materials.hull}>
            <boxGeometry args={[11, 5, 51]} />
          </mesh>
          <mesh position={[side * 61, -24.8, 11]} material={materials.conduit}>
            <boxGeometry args={[0.5, 0.2, 49]} />
          </mesh>
          <mesh position={[side * 24, 21, -6]} material={materials.hull}>
            <boxGeometry args={[8, 7, 13]} />
          </mesh>
          <mesh position={[side * 22.4, 21, 1]} material={materials.conduit}>
            <boxGeometry args={[0.4, 3, 0.25]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 77, -11]} material={materials.hull}>
        <boxGeometry args={[116, 10, 16]} />
      </mesh>
      <mesh position={[0, 83, -10]} material={materials.inset}>
        <boxGeometry args={[68, 3, 10]} />
      </mesh>
      <mesh position={[0, 105, -11]} material={materials.hull}>
        <cylinderGeometry args={[0.8, 2.2, 48, 6]} />
      </mesh>
      <mesh position={[0, 131, -10]} material={materials.conduit}>
        <octahedronGeometry args={[3.2, 0]} />
      </mesh>
      <mesh position={[0, -69, -10]} material={materials.hull}>
        <boxGeometry args={[112, 10, 18]} />
      </mesh>
      <mesh position={[0, -74.2, -9]} material={materials.conduit}>
        <boxGeometry args={[60, 0.4, 11]} />
      </mesh>
      {/* Only the receiver's moving machinery uses true circles. */}
      <group ref={rotor}>
        <mesh material={materials.hull}>
          <torusGeometry args={[27, 3.1, 8, 64]} />
        </mesh>
        <mesh material={materials.conduit} position={[0, 0, 1]}>
          <torusGeometry args={[22, 0.32, 6, 64]} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <mesh position={[0, 29, 0]} material={materials.hull}>
              <boxGeometry args={[7, 14, 7]} />
            </mesh>
            <mesh position={[0, 33, 4]} material={materials.conduit}>
              <boxGeometry args={[0.6, 4, 0.3]} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh material={materials.inset}>
        <cylinderGeometry args={[15, 15, 8, 8]} />
      </mesh>
      <mesh material={materials.hull} rotation={[Math.PI / 2, 0, Math.PI / 8]}>
        <cylinderGeometry args={[13, 13, 8, 8]} />
      </mesh>
      <mesh ref={core} position={[0, 0, 7]} material={materials.core}>
        <icosahedronGeometry args={[9, 1]} />
      </mesh>
      <pointLight color="#b3f1ff" intensity={110} distance={125} decay={2} />
    </group>
  );
}

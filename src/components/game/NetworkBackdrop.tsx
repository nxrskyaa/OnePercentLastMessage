"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// A distant, camera-locked matte provides the authored color and depth cues;
// the playable route, collisions and moving landmarks remain real 3D meshes.
export function NetworkBackdrop() {
  const texture = useTexture("/brand/network-atlas.webp");
  const plane = useRef<THREE.Mesh>(null);
  const forward = useRef(new THREE.Vector3());
  useFrame(({ camera }) => {
    if (!plane.current) return;
    camera.getWorldDirection(forward.current);
    plane.current.position
      .copy(camera.position)
      .addScaledVector(forward.current, 900);
    plane.current.quaternion.copy(camera.quaternion);
  });
  return (
    <mesh ref={plane} renderOrder={-20} frustumCulled={false}>
      <planeGeometry args={[2700, 1520]} />
      <meshBasicMaterial
        map={texture}
        color="#bccbdf"
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

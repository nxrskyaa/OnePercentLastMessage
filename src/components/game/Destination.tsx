"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { dataSurface, energySurface } from "@/rendering/materials";

function SpokeBatch({
  y,
  width,
  height,
  material,
}: {
  y: number;
  width: number;
  height: number;
  material: THREE.Material;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    for (let index = 0; index < 12; index++) {
      const angle = (index * Math.PI) / 6;
      helper.position.set(-Math.sin(angle) * y, Math.cos(angle) * y, 0);
      helper.rotation.set(0, 0, angle);
      helper.updateMatrix();
      mesh.current.setMatrixAt(index, helper.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [y]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, 12]}
      material={material}
    >
      <boxGeometry args={[width, height, width * 1.4]} />
    </instancedMesh>
  );
}

export function Destination() {
  const rings = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const materials = useMemo(
    () => ({
      frame: dataSurface("#172f3c", "#52a6bf"),
      inner: energySurface("#dcffff", 2.8),
      beacon: energySurface("#63d7ef", 1.15),
    }),
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );

  useFrame(({ clock }, delta) => {
    if (rings.current) rings.current.rotation.z += Math.min(delta, 0.05) * 0.12;
    if (core.current)
      core.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.5) * 0.07,
      );
  });

  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      <mesh ref={core} material={materials.inner}>
        <icosahedronGeometry args={[5.4, 2]} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[8.5, 2]} />
        <meshBasicMaterial
          color="#54c4dd"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[12.5, 1]} />
        <meshBasicMaterial
          color="#32677e"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      <group ref={rings}>
        {[17, 25, 34, 42].map((radius, index) => (
          <mesh
            key={radius}
            rotation={[0, index % 2 ? 0.2 : 0, index * 0.24]}
            material={index === 0 ? materials.inner : materials.frame}
          >
            <torusGeometry args={[radius, index === 0 ? 0.32 : 0.65, 6, 96]} />
          </mesh>
        ))}
        <SpokeBatch y={30} width={1.5} height={22} material={materials.frame} />
        <SpokeBatch
          y={43}
          width={0.18}
          height={3.5}
          material={materials.beacon}
        />
        <SpokeBatch
          y={19}
          width={0.19}
          height={4.5}
          material={materials.inner}
        />
      </group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 52, 0, 0]} material={materials.frame}>
            <boxGeometry args={[5, 110, 8]} />
          </mesh>
          <mesh position={[side * 52, 58, 0]} material={materials.beacon}>
            <boxGeometry args={[0.7, 6, 1]} />
          </mesh>
          <mesh
            position={[side * 29, -34, -5]}
            material={materials.frame}
            rotation={[0, 0, side * 0.45]}
          >
            <boxGeometry args={[3, 49, 6]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 67, -8]} material={materials.beacon}>
        <cylinderGeometry args={[0.25, 1.4, 136, 8]} />
      </mesh>
      <pointLight color="#92edff" intensity={90} distance={115} decay={2} />
    </group>
  );
}

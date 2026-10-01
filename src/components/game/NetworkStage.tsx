"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HarborSky } from "./HarborSky";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { makeHarbor } from "@/rendering/harborGeometry";
function HarborSection({
  index,
  playerRef,
}: {
  index: number;
  playerRef: RefObject<THREE.Group | null>;
}) {
  const stage = stageAt(useGameStore((s) => s.stageIndex));
  const world = useMemo(() => makeHarbor(stage, index), [stage, index]);
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const z = playerRef.current?.position.z ?? 0;
    if (group.current)
      group.current.visible =
        -index * 450 < z + 160 && -(index + 1) * 450 > z - 700;
  });

  useEffect(
    () => () => {
      Object.values(world).forEach((g) => g.dispose());
    },
    [world],
  );
  return (
    <group ref={group}>
      <mesh
        onUpdate={(object) => object.layers.enable(1)}
        geometry={world.stone}
      >
        <meshStandardMaterial vertexColors roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh
        onUpdate={(object) => object.layers.enable(1)}
        geometry={world.metal}
      >
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.64} />
      </mesh>
      <mesh
        onUpdate={(object) => object.layers.enable(1)}
        geometry={world.glass}
      >
        <meshPhysicalMaterial
          vertexColors
          roughness={0.12}
          metalness={0.38}
          clearcoat={1}
        />
      </mesh>
      <mesh
        onUpdate={(object) => object.layers.enable(1)}
        geometry={world.light}
      >
        <meshBasicMaterial vertexColors color={[2.2, 2.2, 2.2]} />
      </mesh>
    </group>
  );
}

export function NetworkStage({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  return (
    <>
      <HarborSky />
      {[0, 1, 2, 3].map((index) => (
        <HarborSection key={index} index={index} playerRef={playerRef} />
      ))}
    </>
  );
}

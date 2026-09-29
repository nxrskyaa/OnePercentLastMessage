"use client";

import { useEffect, useMemo } from "react";
import { HarborSky } from "./HarborSky";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { makeHarbor } from "@/rendering/harborGeometry";
export function NetworkStage() {
  const stage = stageAt(useGameStore((s) => s.stageIndex));
  const world = useMemo(() => makeHarbor(stage), [stage]);

  useEffect(
    () => () => {
      Object.values(world).forEach((g) => g.dispose());
    },
    [world],
  );
  return (
    <>
      <HarborSky />
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
    </>
  );
}

"use client";

/* eslint-disable react-hooks/immutability -- R3F owns a mutable Three.js scene; this effect installs and restores an engine resource. */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";

/** A tiny, prefiltered studio environment gives curved metal a readable highlight. */
export function MaterialLighting() {
  const { gl, scene } = useThree();
  const stage = stageAt(useGameStore((state) => state.stageIndex));
  useEffect(() => {
    const room = new THREE.Scene();
    room.background = new THREE.Color(stage.sky[1]).multiplyScalar(0.42);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.MeshBasicMaterial[] = [];
    const card = (
      color: string,
      power: number,
      position: [number, number, number],
      scale: [number, number],
    ) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(power),
        side: THREE.DoubleSide,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(scale[0], scale[1], 1);
      mesh.lookAt(0, 0, 0);
      room.add(mesh);
    };
    card("#d3e6f5", 2, [-6, 8, 3], [5, 9]);
    card(stage.accentSoft, 3.5, [8, 1, -2], [2, 7]);
    card(stage.accent, 1.5, [0, 5, -8], [7, 2]);
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0.08, 0.1, 40, { size: 64 });
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.22;
    pmrem.dispose();
    geometry.dispose();
    materials.forEach((material) => material.dispose());
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      target.dispose();
    };
  }, [gl, scene, stage]);
  return null;
}

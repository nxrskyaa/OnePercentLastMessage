"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { flowSurface } from "@/rendering/materials";

const STATIONS = [30, -70, -170, -270, -370, -470, -590, -670];

function cable(side: number, inset = 0, yOffset = 0) {
  return new THREE.CatmullRomCurve3(
    STATIONS.map(
      (z, index) =>
        new THREE.Vector3(
          side * (31 + Math.sin(index * 1.5 + side) * 6 - inset),
          14 + Math.sin(index * 1.35 + side) * 6 + yOffset,
          z,
        ),
    ),
  );
}

export function SignalLoom() {
  const geometry = useMemo(
    () => ({
      leftJacket: new THREE.TubeGeometry(cable(-1), 96, 0.95, 5, false),
      rightJacket: new THREE.TubeGeometry(cable(1), 96, 0.95, 5, false),
      leftSignal: new THREE.TubeGeometry(
        cable(-1, 0.82, 0.2),
        96,
        0.16,
        4,
        false,
      ),
      rightSignal: new THREE.TubeGeometry(
        cable(1, 0.82, 0.2),
        96,
        0.16,
        4,
        false,
      ),
      leftReturn: new THREE.TubeGeometry(
        cable(-1, 0.25, -0.82),
        96,
        0.1,
        4,
        false,
      ),
    }),
    [],
  );
  const materials = useMemo(
    () => ({
      jacket: new THREE.MeshStandardMaterial({
        color: "#243944",
        metalness: 0.62,
        roughness: 0.52,
      }),
      signal: flowSurface("#74dce9"),
      return: flowSurface("#d6a17a"),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geometry).forEach((item) => item.dispose());
      Object.values(materials).forEach((item) => item.dispose());
    },
    [geometry, materials],
  );
  return (
    <>
      <mesh geometry={geometry.leftJacket} material={materials.jacket} />
      <mesh geometry={geometry.rightJacket} material={materials.jacket} />
      <mesh geometry={geometry.leftSignal} material={materials.signal} />
      <mesh geometry={geometry.rightSignal} material={materials.signal} />
      <mesh geometry={geometry.leftReturn} material={materials.return} />
    </>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settingsStore";

type Monument = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  light: string;
};

const MONUMENTS: Monument[] = [
  {
    position: [-75, 15, -184],
    rotation: [0.06, 0.7, -0.17],
    scale: 1.55,
    color: "#3b86bf",
    light: "#a7e9f4",
  },
  {
    position: [92, 19, -406],
    rotation: [-0.08, -0.75, 0.21],
    scale: 1.7,
    color: "#aa7ac4",
    light: "#f3c7f2",
  },
  {
    position: [-70, 17, -575],
    rotation: [0.05, 0.7, -0.11],
    scale: 1.4,
    color: "#b18a54",
    light: "#ffe1a1",
  },
];

function wingShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-22, -2);
  shape.bezierCurveTo(-29, 3, -27, 13, -13, 17);
  shape.bezierCurveTo(-1, 21, 11, 18, 31, 20);
  shape.bezierCurveTo(18, 15, 11, 10, 4, 3);
  shape.bezierCurveTo(0, 9, -4, 12, -10, 9);
  shape.bezierCurveTo(-14, 7, -12, 1, -22, -2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 5,
    bevelEnabled: true,
    bevelSize: 1.15,
    bevelThickness: 1.15,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -2.5);
  geometry.computeVertexNormals();
  return geometry;
}

export function SignalMonuments() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const wing = useMemo(() => wingShape(), []);
  const seam = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-21, 0, 3.6),
          new THREE.Vector3(-22, 9, 3.6),
          new THREE.Vector3(-10, 16, 3.6),
          new THREE.Vector3(4, 19, 3.6),
          new THREE.Vector3(18, 20, 3.6),
          new THREE.Vector3(30, 20, 3.6),
        ]),
        32,
        0.24,
        4,
        false,
      ),
    [],
  );
  useEffect(
    () => () => {
      wing.dispose();
      seam.dispose();
    },
    [wing, seam],
  );
  return (
    <>
      {(low ? MONUMENTS.slice(0, 2) : MONUMENTS).map((monument, index) => (
        <group
          key={index}
          position={monument.position}
          rotation={monument.rotation}
          scale={monument.scale}
        >
          <mesh geometry={wing} position={[0, 5, 0]}>
            <meshPhysicalMaterial
              color={monument.color}
              metalness={0.18}
              roughness={0.22}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive={monument.color}
              emissiveIntensity={0.42}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh geometry={seam} position={[0, 5, 0]}>
            <meshBasicMaterial
              color={monument.light}
              transparent
              opacity={0.72}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh
            geometry={wing}
            position={[0, -5, 0]}
            rotation={[0, 0, Math.PI]}
          >
            <meshPhysicalMaterial
              color={monument.color}
              metalness={0.18}
              roughness={0.22}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive={monument.color}
              emissiveIntensity={0.42}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            geometry={seam}
            position={[0, -5, 0]}
            rotation={[0, 0, Math.PI]}
          >
            <meshBasicMaterial
              color={monument.light}
              transparent
              opacity={0.72}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[8.8, 8.8, 6]} />
            <meshStandardMaterial
              color="#102747"
              metalness={0.42}
              roughness={0.28}
              emissive={monument.light}
              emissiveIntensity={0.34}
            />
          </mesh>
          <mesh position={[0, 0, 3.2]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[3.9, 3.9, 0.28]} />
            <meshBasicMaterial color={monument.light} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

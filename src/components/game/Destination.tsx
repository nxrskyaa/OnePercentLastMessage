"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";

function polygon(points: Array<[number, number]>, depth: number) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.computeVertexNormals();
  return geometry;
}

function receiverGeometry() {
  // Four split wings hold the receiving aperture. It reads as an arrival
  // point from the beginning of the run without another circular gate.
  const wings = [
    polygon(
      [
        [-54, -47],
        [-29, -16],
        [-21, 11],
        [-27, 45],
        [-41, 67],
        [-70, 38],
        [-51, 23],
      ],
      13,
    ),
    polygon(
      [
        [54, -47],
        [29, -16],
        [21, 11],
        [27, 45],
        [41, 67],
        [70, 38],
        [51, 23],
      ],
      13,
    ),
    polygon(
      [
        [-22, 54],
        [-9, 27],
        [0, 20],
        [9, 27],
        [22, 54],
        [0, 82],
      ],
      10,
    ),
    polygon(
      [
        [-22, -54],
        [-9, -27],
        [0, -20],
        [9, -27],
        [22, -54],
        [0, -82],
      ],
      10,
    ),
  ];
  const insets = [
    polygon(
      [
        [-48, -29],
        [-30, -6],
        [-24, 12],
        [-32, 39],
        [-47, 44],
        [-37, 12],
      ],
      0.3,
    ),
    polygon(
      [
        [48, -29],
        [30, -6],
        [24, 12],
        [32, 39],
        [47, 44],
        [37, 12],
      ],
      0.3,
    ),
  ];
  const lines = new THREE.BufferGeometry();
  lines.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -78, 0, 0, -30, 0, 0, 78, 0, 0, 30, 0, 0, 0, 100, 0, 0, 26, 0, 0, -100,
        0, 0, -26, 0, -33, -22, 6, -24, 11, 6, 33, -22, 6, 24, 11, 6,
      ],
      3,
    ),
  );
  return { wings, insets, lines };
}

export function Destination() {
  const geometry = useMemo(() => receiverGeometry(), []);
  const core = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => {
      geometry.wings.forEach((item) => item.dispose());
      geometry.insets.forEach((item) => item.dispose());
      geometry.lines.dispose();
    },
    [geometry],
  );
  useFrame(({ clock }, delta) => {
    if (core.current) core.current.rotation.z += Math.min(delta, 0.05) * 0.16;
    if (pulse.current)
      pulse.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2.3) * 0.08,
      );
  });
  return (
    <group position={[0, 0, GAME_CONFIG.destination.z]}>
      <mesh position={[0, 0, -58]} rotation={[0.25, -0.15, 0.45]}>
        <torusGeometry args={[76, 2, 5, 72, Math.PI * 1.38]} />
        <meshStandardMaterial
          color="#3b8ca8"
          emissive="#51b8d0"
          emissiveIntensity={0.9}
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, -35]} rotation={[-0.23, 0.22, Math.PI * 1.1]}>
        <torusGeometry args={[58, 1.2, 4, 62, Math.PI * 1.28]} />
        <meshBasicMaterial color="#91e8ed" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -62]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[38, 0]} />
        <meshStandardMaterial
          color="#124462"
          emissive="#0b5d80"
          emissiveIntensity={1.15}
          metalness={0.48}
          roughness={0.38}
          flatShading
        />
      </mesh>
      <group position={[0, 0, -8]}>
        {geometry.wings.map((wing, index) => (
          <mesh key={index} geometry={wing}>
            <meshStandardMaterial
              color={index < 2 ? "#31566a" : "#376c7f"}
              emissive="#0c354b"
              emissiveIntensity={0.55}
              metalness={0.67}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {geometry.insets.map((inset, index) => (
          <mesh key={index} geometry={inset} position={[0, 0, 13.2]}>
            <meshBasicMaterial
              color="#407e9a"
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        <lineSegments geometry={geometry.lines} position={[0, 0, 15]}>
          <lineBasicMaterial
            color="#a1e9ff"
            transparent
            opacity={0.84}
            toneMapped={false}
          />
        </lineSegments>
      </group>
      <group ref={core}>
        {[0, 1, 2, 3].map((index) => (
          <mesh
            key={index}
            rotation={[0, 0, (index * Math.PI) / 2]}
            position={[0, 0, 1]}
          >
            <boxGeometry args={[1.2, 46, 1]} />
            <meshBasicMaterial color="#91dff1" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={pulse} position={[0, 0, 7]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[16, 0]} />
        <meshBasicMaterial color="#e8fcff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 16]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[23, 1.4, 4, 4]} />
        <meshBasicMaterial color="#c7ffff" toneMapped={false} />
      </mesh>
      <pointLight color="#8cdfff" intensity={50} distance={125} decay={2} />
    </group>
  );
}

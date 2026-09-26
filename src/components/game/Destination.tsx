"use client";

import { useTexture } from "@react-three/drei";
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
      4,
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
      4,
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
      3,
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
      3,
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
  const mark = useTexture("/brand/dlicom-mark-reference.jpg");
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
      <mesh position={[0, 0, -74]}>
        <sphereGeometry args={[74, 24, 16]} />
        <meshStandardMaterial
          color="#0a2840"
          emissive="#0a314b"
          emissiveIntensity={0.85}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, 0, -58]} rotation={[0, 0, 0.48]}>
        <torusGeometry args={[79, 1.5, 4, 80, Math.PI * 1.22]} />
        <meshBasicMaterial
          color="#6cbedc"
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>
      <group position={[0, 0, -8]}>
        {geometry.wings.map((wing, index) => (
          <mesh key={index} geometry={wing}>
            <meshStandardMaterial
              color={index < 2 ? "#17364d" : "#22516b"}
              metalness={0.6}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {geometry.insets.map((inset, index) => (
          <mesh key={index} geometry={inset} position={[0, 0, 4.2]}>
            <meshBasicMaterial
              color="#407e9a"
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        <lineSegments geometry={geometry.lines} position={[0, 0, 6]}>
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
      <mesh position={[0, 0, 24]}>
        <planeGeometry args={[19, 19]} />
        <meshBasicMaterial
          map={mark}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#8cdfff" intensity={50} distance={125} decay={2} />
    </group>
  );
}

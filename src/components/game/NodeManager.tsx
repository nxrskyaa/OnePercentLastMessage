"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { GameNode } from "@/game/nodes";
import { energySurface } from "@/rendering/materials";
import { useGameStore } from "@/store/gameStore";
import type { RefObject } from "react";

function TrackerScanner() {
  const sweep = useRef<THREE.Group>(null);
  const lastScan = useRef(0);
  const reveal = useRef(0);
  useFrame(({ clock }, delta) => {
    if (!sweep.current) return;
    sweep.current.rotation.z = clock.elapsedTime * 1.55;
    const scanPulse = useGameStore.getState().scanPulse;
    if (scanPulse !== lastScan.current) {
      lastScan.current = scanPulse;
      reveal.current = 1;
    }
    reveal.current = Math.max(0, reveal.current - delta * 0.42);
    sweep.current.scale.setScalar(1 + reveal.current * 0.22);
  });
  return (
    <group ref={sweep}>
      <mesh rotation={[0, 0, -Math.PI / 6]}>
        <ringGeometry args={[0.5, 3.2, 32, 1, 0, Math.PI / 3]} />
        <meshBasicMaterial
          color="#e77b6b"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.055, 3.4, 0.07]} />
        <meshBasicMaterial color="#ffaaa0" toneMapped={false} />
      </mesh>
    </group>
  );
}

function NodeVisual({ node }: { node: GameNode }) {
  const color =
    node.type === "tracker"
      ? "#fd6c78"
      : node.type === "tip"
        ? "#f3d289"
        : node.type === "public"
          ? "#e6b67c"
          : "#82eaf2";
  const energy = useMemo(
    () => energySurface(color, node.type === "tracker" ? 4.2 : 2.3),
    [color, node.type],
  );
  useEffect(() => () => energy.dispose(), [energy]);
  if (node.type === "tip")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh rotation={[0.35, 0.6, 0]}>
          <octahedronGeometry args={[1.35, 0]} />
          <primitive object={energy} attach="material" />
        </mesh>
        <pointLight color={color} intensity={5} distance={15} />
      </group>
    );
  if (node.type === "tracker")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh>
          <torusGeometry args={[3.85, 0.45, 6, 48]} />
          <meshStandardMaterial
            color="#2b3039"
            metalness={0.55}
            roughness={0.62}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[3.2, 0.22, 5, 40]} />
          <primitive object={energy} attach="material" />
        </mesh>
        <mesh rotation={[0.4, 0.2, 0.35]}>
          <torusGeometry args={[2.2, 0.1, 4, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.62}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.7, 10, 8]} />
          <meshBasicMaterial color="#ffb1aa" transparent opacity={0.65} />
        </mesh>
        <TrackerScanner />
        <pointLight color={color} intensity={5} distance={18} />
      </group>
    );
  if (node.type === "booster")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh>
          <torusGeometry args={[4.3, 0.46, 6, 48]} />
          <meshStandardMaterial
            color="#193b49"
            metalness={0.45}
            roughness={0.66}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[3.7, 0.3, 6, 40]} />
          <primitive object={energy} attach="material" />
        </mesh>
        <mesh>
          <torusGeometry args={[2.7, 0.1, 4, 36]} />
          <meshBasicMaterial color="#59bde0" transparent opacity={0.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.9, 10, 8]} />
          <meshBasicMaterial color="#d2ffff" toneMapped={false} />
        </mesh>
        <pointLight color="#7de9f3" intensity={8} distance={24} />
      </group>
    );
  const radius = node.type === "relay" ? 5 : 6.5;
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh>
        <torusGeometry args={[radius + 0.72, 0.38, 6, 48]} />
        <meshStandardMaterial
          color={node.type === "public" ? "#3c302d" : "#1a313a"}
          metalness={0.5}
          roughness={0.66}
        />
      </mesh>
      <mesh>
        <torusGeometry
          args={[radius, node.type === "relay" ? 0.14 : 0.26, 5, 48]}
        />
        <primitive object={energy} attach="material" />
      </mesh>
      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          rotation={[0, 0, (index * Math.PI) / 2]}
          position={[0, 0, -0.3]}
        >
          <boxGeometry args={[0.28, radius * 0.8, 0.34]} />
          <meshStandardMaterial
            color={node.type === "public" ? "#5d4938" : "#28404d"}
            metalness={0.44}
            roughness={0.7}
          />
        </mesh>
      ))}
      <mesh rotation={[0, 0, 0.32]}>
        <torusGeometry args={[radius + 0.7, 0.04, 3, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function NodeManager({
  nodes,
  playerRef,
}: {
  nodes: GameNode[];
  playerRef: RefObject<THREE.Group | null>;
}) {
  const groups = useRef<Array<THREE.Group | null>>([]);
  useFrame(() => {
    const playerZ = playerRef.current?.position.z ?? 0;
    nodes.forEach((node, index) => {
      const group = groups.current[index];
      if (!group) return;
      const ahead = playerZ - node.z;
      group.visible = ahead > -32 && ahead < 230;
    });
  });
  return (
    <>
      {nodes.map((node, index) => (
        <group
          key={node.id}
          ref={(group) => {
            groups.current[index] = group;
          }}
        >
          <NodeVisual node={node} />
        </group>
      ))}
    </>
  );
}

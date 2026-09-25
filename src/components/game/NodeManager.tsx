"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { GameNode } from "@/game/nodes";
import { energySurface } from "@/rendering/materials";
import { useGameStore } from "@/store/gameStore";

const hull = new THREE.MeshStandardMaterial({
  color: "#44545d",
  metalness: 0.55,
  roughness: 0.61,
});
const dark = new THREE.MeshStandardMaterial({
  color: "#26343e",
  metalness: 0.46,
  roughness: 0.77,
});

function PolygonFrame({
  radius,
  sides = 6,
  color,
}: {
  radius: number;
  sides?: number;
  color: string;
}) {
  const length = 2 * radius * Math.sin(Math.PI / sides) * 0.92;
  return (
    <group>
      {Array.from({ length: sides }, (_, i) => {
        const angle = (i * Math.PI * 2) / sides + Math.PI / sides;
        return (
          <group
            key={i}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <mesh material={hull}>
              <boxGeometry args={[length, 0.62, 1.35]} />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0, 0.4, -0.12]}>
                <boxGeometry args={[length * 0.46, 0.08, 0.1]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function TrackerScanner() {
  const sweep = useRef<THREE.Group>(null);
  const lastScan = useRef(0);
  const reveal = useRef(0);
  useFrame(({ clock }, delta) => {
    if (!sweep.current) return;
    sweep.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.5;
    const scanPulse = useGameStore.getState().scanPulse;
    if (scanPulse !== lastScan.current) {
      lastScan.current = scanPulse;
      reveal.current = 1;
    }
    reveal.current = Math.max(0, reveal.current - delta * 1.4);
    sweep.current.scale.setScalar(1 + reveal.current * 0.12);
  });
  return (
    <group ref={sweep}>
      <mesh position={[0, 0, 0.38]}>
        <boxGeometry args={[0.12, 5.1, 0.07]} />
        <meshBasicMaterial color="#ff9282" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.45]}>
        <torusGeometry args={[2.7, 0.065, 4, 8]} />
        <meshBasicMaterial color="#e56d61" toneMapped={false} />
      </mesh>
    </group>
  );
}

function NodeVisual({ node }: { node: GameNode }) {
  const color =
    node.type === "tracker"
      ? "#ed7466"
      : node.type === "public"
        ? "#d7a25a"
        : node.type === "tip"
          ? "#f3d289"
          : node.type === "booster"
            ? "#b8faff"
            : "#76d3e5";
  const energy = useMemo(
    () => energySurface(color, node.type === "booster" ? 4.2 : 2),
    [color, node.type],
  );
  useEffect(() => () => energy.dispose(), [energy]);
  if (node.type === "tip")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh rotation={[0.35, 0.6, 0]} material={energy}>
          <octahedronGeometry args={[1.1, 0]} />
        </mesh>
        <pointLight color={color} intensity={4} distance={12} />
      </group>
    );
  if (node.type === "tracker")
    return (
      <group position={[node.x, 0, node.z]}>
        <PolygonFrame radius={3.65} sides={8} color={color} />
        <mesh position={[0, 4.15, 0]} material={dark}>
          <boxGeometry args={[3.5, 0.65, 1.8]} />
        </mesh>
        <mesh position={[0, 4.17, 1.02]} material={energy}>
          <boxGeometry args={[1.2, 0.16, 0.08]} />
        </mesh>
        <TrackerScanner />
        <pointLight color="#f06e60" intensity={6} distance={17} />
      </group>
    );
  const radius =
    node.type === "booster" ? 4.35 : node.type === "relay" ? 5.2 : 6;
  return (
    <group position={[node.x, 0, node.z]}>
      <PolygonFrame
        radius={radius}
        sides={node.type === "booster" ? 8 : 6}
        color={color}
      />
      <mesh position={[0, radius - 0.72, 0.58]} material={energy}>
        <boxGeometry args={[radius * 0.7, 0.12, 0.12]} />
      </mesh>
      <mesh position={[0, -radius + 0.72, 0.58]} material={energy}>
        <boxGeometry args={[radius * 0.7, 0.12, 0.12]} />
      </mesh>
      {node.type === "booster" && (
        <>
          <mesh material={energy}>
            <octahedronGeometry args={[0.82, 0]} />
          </mesh>
          <pointLight color={color} intensity={9} distance={22} />
        </>
      )}
      <mesh position={[0, -radius - 1.7, 0]} material={hull}>
        <boxGeometry args={[2.8, 3.4, 2.2]} />
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
      // Devices leave the scene as the player crosses them, before the chase
      // camera reaches their plane. No field can clip through the near plane.
      group.visible = ahead > -1.5 && ahead < 230;
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

"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { GameNode } from "@/game/nodes";
import { energySurface } from "@/rendering/materials";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

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

const frameCache = new Map<
  string,
  { hullGeometry: THREE.BufferGeometry; signalGeometry: THREE.BufferGeometry }
>();

function frameGeometry(radius: number, sides: number) {
  const key = `${radius}:${sides}`;
  const cached = frameCache.get(key);
  if (cached) return cached;
  const length = 2 * radius * Math.sin(Math.PI / sides) * 0.92;
  const frame: THREE.BufferGeometry[] = [];
  const strips: THREE.BufferGeometry[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides + Math.PI / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const rotation = angle + Math.PI / 2;
    const bar = new THREE.BoxGeometry(length, 0.62, 1.35);
    bar.rotateZ(rotation);
    bar.translate(x, y, 0);
    frame.push(bar);
    const rear = bar.clone();
    rear.translate(0, 0, -3.4);
    frame.push(rear);
    if (i % 2 === 0) {
      const brace = new THREE.BoxGeometry(0.72, 0.72, 3.6);
      brace.translate(x, y, -1.7);
      frame.push(brace);
    }
    if (i % 2 === 0) {
      const inset = new THREE.BoxGeometry(length * 0.46, 0.08, 0.1);
      inset.translate(0, 0.4, -0.12);
      inset.rotateZ(rotation);
      inset.translate(x, y, 0);
      strips.push(inset);
    }
  }
  for (const y of [radius - 0.72, -radius + 0.72]) {
    const marker = new THREE.BoxGeometry(radius * 0.7, 0.12, 0.12);
    marker.translate(0, y, 0.58);
    strips.push(marker);
  }
  const geometry = {
    hullGeometry: mergeGeometries(frame),
    signalGeometry: mergeGeometries(strips),
  };
  frame.forEach((item) => item.dispose());
  strips.forEach((item) => item.dispose());
  frameCache.set(key, geometry);
  return geometry;
}

function PolygonFrame({
  radius,
  sides = 6,
  energy,
}: {
  radius: number;
  sides?: number;
  energy: THREE.Material;
}) {
  const geometry = frameGeometry(radius, sides);
  return (
    <group>
      <mesh geometry={geometry.hullGeometry} material={hull} />
      <mesh geometry={geometry.signalGeometry} material={energy} />
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

function NodeVisual({ node, low }: { node: GameNode; low: boolean }) {
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
    () =>
      low
        ? new THREE.MeshBasicMaterial({ color, toneMapped: false })
        : energySurface(color, node.type === "booster" ? 4.2 : 2),
    [color, low, node.type],
  );
  useEffect(() => () => energy.dispose(), [energy]);
  if (node.type === "tip")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh rotation={[0.35, 0.6, 0]} material={energy}>
          <octahedronGeometry args={[1.1, 0]} />
        </mesh>
        {!low && <pointLight color={color} intensity={4} distance={12} />}
      </group>
    );
  if (node.type === "tracker")
    return (
      <group position={[node.x, 0, node.z]}>
        <PolygonFrame radius={3.65} sides={8} energy={energy} />
        {!low && (
          <mesh position={[0, 4.15, 0]} material={dark}>
            <boxGeometry args={[3.5, 0.65, 1.8]} />
          </mesh>
        )}
        <TrackerScanner />
        {!low && <pointLight color="#f06e60" intensity={6} distance={17} />}
      </group>
    );
  const radius =
    node.type === "booster" ? 4.35 : node.type === "relay" ? 5.2 : 6;
  return (
    <group position={[node.x, 0, node.z]}>
      <PolygonFrame
        radius={radius}
        sides={node.type === "booster" ? 8 : 6}
        energy={energy}
      />
      {node.type === "booster" && (
        <>
          <mesh material={energy}>
            <octahedronGeometry args={[0.82, 0]} />
          </mesh>
          {!low && <pointLight color={color} intensity={9} distance={22} />}
        </>
      )}
      {!low && (
        <mesh position={[0, -radius - 1.7, 0]} material={hull}>
          <boxGeometry args={[2.8, 3.4, 2.2]} />
        </mesh>
      )}
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
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
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
          <NodeVisual node={node} low={low} />
        </group>
      ))}
    </>
  );
}

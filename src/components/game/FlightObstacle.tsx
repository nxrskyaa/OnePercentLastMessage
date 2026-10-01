"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { aperture, rotorAngle, type GameNode } from "@/game/nodes";
import { GAME_CONFIG } from "@/game/config";
import { signalState } from "@/rendering/signalState";
import { bulkheadTexture } from "@/rendering/bulkheadTexture";

const casework = new THREE.MeshStandardMaterial({
  color: "#b7cfde",
  map: bulkheadTexture(),
  emissive: "#476275",
  emissiveIntensity: 0.22,
  metalness: 0.3,
  roughness: 0.42,
});
const edges = new THREE.MeshBasicMaterial({
  color: "#d4ffe6",
  toneMapped: false,
});
const warning = new THREE.MeshBasicMaterial({
  color: "#ff8c63",
  toneMapped: false,
});
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const blade = new THREE.BoxGeometry(
  30,
  GAME_CONFIG.obstacles.rotorHalfWidth * 2,
  1.4,
);

/** Four solid sliding panels surround an honest two-axis opening. */
function ApertureGate({ node }: { node: GameNode }) {
  const panels = useRef<Array<THREE.Mesh | null>>([]);
  const rim = useRef<THREE.Group>(null);
  const halfHeight = node.height ?? 3.5;
  useFrame(() => {
    const { x, y } = aperture(node, signalState.flightTime);
    const left = x - node.radius,
      right = x + node.radius;
    const bottom = y - halfHeight,
      top = y + halfHeight;
    const dimensions = [
      [(-19 + left) / 2, 2.5, left + 19, 25],
      [(19 + right) / 2, 2.5, 19 - right, 25],
      [x, (-10 + bottom) / 2, node.radius * 2, bottom + 10],
      [x, (15 + top) / 2, node.radius * 2, 15 - top],
    ];
    dimensions.forEach(([px, py, width, height], index) => {
      const mesh = panels.current[index];
      if (mesh) {
        mesh.position.set(px, py, 0);
        mesh.scale.set(width, Math.max(0.01, height), 2);
      }
    });
    rim.current?.position.set(x, y, 1.15);
  });
  return (
    <group position={[0, 0, node.z]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            panels.current[i] = mesh;
          }}
          geometry={unitBox}
          material={casework}
        />
      ))}
      <group ref={rim}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh
              position={[side * node.radius, 0, 0]}
              geometry={unitBox}
              material={edges}
              scale={[0.2, halfHeight * 2, 0.18]}
            />
            <mesh
              position={[0, side * halfHeight, 0]}
              geometry={unitBox}
              material={edges}
              scale={[node.radius * 2, 0.2, 0.18]}
            />
            <mesh
              position={[side * (node.radius + 1), 0, 0]}
              geometry={unitBox}
              material={warning}
              scale={[0.25, 2.7, 0.2]}
              rotation={[0, 0, -0.35]}
            />
          </group>
        ))}
        <mesh
          position={[0, halfHeight + 1, 0]}
          rotation={[0, 0, Math.PI / 4]}
          material={edges}
        >
          <boxGeometry args={[0.7, 0.7, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}

function RotorGate({ node }: { node: GameNode }) {
  const rotor = useRef<THREE.Group>(null);
  useFrame(() => {
    if (rotor.current)
      rotor.current.rotation.z = rotorAngle(node, signalState.flightTime);
  });
  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh material={casework}>
        <torusGeometry args={[16, 0.85, 6, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.8]} material={edges}>
        <torusGeometry args={[16.1, 0.12, 4, 32]} />
      </mesh>
      <group ref={rotor}>
        {[0, Math.PI / 2].map((angle) => (
          <group rotation={[0, 0, angle]} key={angle}>
            <mesh geometry={blade} material={casework} />
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[
                  0,
                  side * GAME_CONFIG.obstacles.rotorHalfWidth,
                  0.85,
                ]}
                geometry={unitBox}
                material={warning}
                scale={[30, 0.12, 0.15]}
              />
            ))}
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={warning}>
          <cylinderGeometry args={[2, 2, 2.1, 12]} />
        </mesh>
      </group>
    </group>
  );
}

export function FlightObstacle({ node }: { node: GameNode }) {
  return node.type === "rotor" ? (
    <RotorGate node={node} />
  ) : (
    <ApertureGate node={node} />
  );
}

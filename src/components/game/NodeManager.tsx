"use client";

import type { GameNode } from "@/game/nodes";

function NodeVisual({ node }: { node: GameNode }) {
  const color =
    node.type === "tracker"
      ? "#fd6c78"
      : node.type === "tip"
        ? "#f3d289"
        : node.type === "public"
          ? "#e6b67c"
          : "#82eaf2";
  if (node.type === "tip")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh rotation={[0.35, 0.6, 0]}>
          <octahedronGeometry args={[1.35, 0]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <pointLight color={color} intensity={5} distance={15} />
      </group>
    );
  if (node.type === "tracker")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh>
          <torusGeometry args={[3.2, 0.22, 5, 40]} />
          <meshBasicMaterial color={color} toneMapped={false} />
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
        <pointLight color={color} intensity={7} distance={22} />
      </group>
    );
  if (node.type === "booster")
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh>
          <torusGeometry args={[3.7, 0.3, 6, 40]} />
          <meshBasicMaterial color="#b8ffff" toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.7, 0.1, 4, 36]} />
          <meshBasicMaterial color="#59bde0" transparent opacity={0.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.9, 10, 8]} />
          <meshBasicMaterial color="#d2ffff" toneMapped={false} />
        </mesh>
        <pointLight color="#7de9f3" intensity={10} distance={28} />
      </group>
    );
  const radius = node.type === "relay" ? 5 : 6.5;
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh>
        <torusGeometry
          args={[radius, node.type === "relay" ? 0.14 : 0.26, 5, 48]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, 0, 0.32]}>
        <torusGeometry args={[radius + 0.7, 0.04, 3, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {(node.type === "safe" || node.type === "public") && (
        <pointLight color={color} intensity={7} distance={30} />
      )}
    </group>
  );
}

export function NodeManager({ nodes }: { nodes: GameNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <NodeVisual key={node.id} node={node} />
      ))}
    </>
  );
}

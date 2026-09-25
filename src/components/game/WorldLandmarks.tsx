"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { dataSurface, energySurface } from "@/rendering/materials";

function createSpire() {
  const shape = new THREE.Shape();
  shape.moveTo(-8, -35);
  shape.lineTo(8, -35);
  shape.lineTo(8, 12);
  shape.lineTo(4, 22);
  shape.lineTo(4, 43);
  shape.lineTo(1, 51);
  shape.lineTo(-3, 43);
  shape.lineTo(-3, 27);
  shape.lineTo(-8, 17);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 9,
    bevelEnabled: true,
    bevelSize: 1.1,
    bevelThickness: 1.1,
    bevelSegments: 1,
  });
}

export function WorldLandmarks() {
  const spire = useMemo(() => createSpire(), []);
  const materials = useMemo(
    () => ({
      graphite: dataSurface("#2a3c49", "#26576a"),
      warm: dataSurface("#3f3536", "#7f5a3f"),
      violet: dataSurface("#302d43", "#5e4a81"),
      danger: dataSurface("#422d33", "#8e3e48"),
      cyan: energySurface("#84d7e8", 1.6),
      amber: energySurface("#e4a66a", 1.9),
      purple: energySurface("#a68dde", 1.3),
      coral: energySurface("#f18179", 2.4),
    }),
    [],
  );
  useEffect(
    () => () => {
      spire.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
    [spire, materials],
  );
  return (
    <>
      {/* THE ARRAY: a fan of receiver blades high above the opening corridor. */}
      <group position={[56, 0, -100]}>
        {[0, 1, 2, 3].map((index) => (
          <group
            key={index}
            position={[(index - 1.5) * 16, index % 2 ? 7 : -4, -index * 19]}
            rotation={[0, index * 0.09, (index - 1.5) * -0.1]}
          >
            <mesh geometry={spire} material={materials.graphite} />
            <mesh position={[0.3, 13, 10.6]} material={materials.cyan}>
              <boxGeometry args={[0.75, 42, 0.22]} />
            </mesh>
            <mesh position={[0, -22, 10.4]} material={materials.graphite}>
              <boxGeometry args={[18, 3.5, 2.8]} />
            </mesh>
          </group>
        ))}
        <pointLight color="#5bbbd4" intensity={55} distance={115} />
      </group>

      {/* THE FOUNDRY: polygonal drums and amber transfer bars mark the public split. */}
      <group position={[-57, 7, -292]}>
        {[0, 1, 2].map((index) => (
          <group key={index} position={[index * -10, index * 12, -index * 17]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.warm}>
              <cylinderGeometry args={[16 - index * 2, 16 - index * 2, 9, 8]} />
            </mesh>
            <mesh position={[0, 0, 5.3]} material={materials.graphite}>
              <cylinderGeometry args={[10 - index, 10 - index, 1.4, 8]} />
            </mesh>
            <mesh position={[0, 0, 6.2]} material={materials.amber}>
              <torusGeometry args={[7 - index * 0.5, 0.28, 4, 8]} />
            </mesh>
            <mesh
              position={[13 - index, -14, 0]}
              rotation={[0, 0, -0.4]}
              material={materials.warm}
            >
              <boxGeometry args={[5, 38, 9]} />
            </mesh>
          </group>
        ))}
        <mesh position={[15, -28, -22]} material={materials.warm}>
          <boxGeometry args={[42, 6, 83]} />
        </mesh>
        <mesh position={[15, -24.8, -22]} material={materials.amber}>
          <boxGeometry args={[27, 0.24, 81]} />
        </mesh>
        <pointLight color="#d89460" intensity={70} distance={95} />
      </group>

      {/* THE VAULT: a single, heavy cipher chamber instead of repeated hoops. */}
      <group position={[0, 0, -420]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 28, 7, 0]} material={materials.violet}>
              <boxGeometry args={[9, 44, 72]} />
            </mesh>
            <mesh
              position={[side * 23.25, 10, 0]}
              material={materials.graphite}
            >
              <boxGeometry args={[0.8, 30, 66]} />
            </mesh>
            <mesh position={[side * 22.7, 9, 0]} material={materials.purple}>
              <boxGeometry args={[0.18, 1, 61]} />
            </mesh>
            <mesh
              position={[side * 28, 30, -12]}
              rotation={[0, 0, side * 0.34]}
              material={materials.violet}
            >
              <boxGeometry args={[8, 25, 66]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 38, -7]} material={materials.violet}>
          <boxGeometry args={[48, 7, 65]} />
        </mesh>
        <mesh position={[0, 33.8, -7]} material={materials.purple}>
          <boxGeometry args={[21, 0.15, 58]} />
        </mesh>
        <pointLight color="#806bb5" intensity={65} distance={105} />
      </group>

      {/* THE WATCHER: an asymmetric surveillance mast with a contained red eye. */}
      <group position={[61, 12, -545]}>
        <mesh
          geometry={spire}
          scale={[1.7, 1.7, 1.4]}
          material={materials.danger}
        />
        <mesh position={[-3, 47, 13]} material={materials.graphite}>
          <cylinderGeometry args={[11, 11, 8, 6]} />
        </mesh>
        <mesh position={[-3, 47, 18]} material={materials.coral}>
          <icosahedronGeometry args={[5.3, 0]} />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh
            key={index}
            position={[-21 - index * 9, 21 + index * 9, -index * 5]}
            rotation={[0, 0, -0.53]}
            material={materials.danger}
          >
            <boxGeometry args={[3, 54 - index * 6, 8]} />
          </mesh>
        ))}
        <mesh position={[-2, -17, 16]} material={materials.coral}>
          <boxGeometry args={[1.2, 44, 0.25]} />
        </mesh>
        <pointLight color="#e75f62" intensity={75} distance={110} />
      </group>
    </>
  );
}

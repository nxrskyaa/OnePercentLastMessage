"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settingsStore";

type Bar = [number, number, number, number, number, number, number?];

function StageBatch({
  bars,
  color,
  opacity = 1,
}: {
  bars: Bar[];
  color: string;
  opacity?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    bars.forEach(([x, y, z, sx, sy, sz, angle = 0], index) => {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [bars]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, bars.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        toneMapped={false}
        depthWrite={opacity === 1}
      />
    </instancedMesh>
  );
}

function SegmentLines({
  positions,
  color,
  opacity,
}: {
  positions: Float32Array;
  color: string;
  opacity: number;
}) {
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function SignalHalos() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    [-95, -217, -347, -477, -590].forEach((z, index) => {
      dummy.position.set(index % 2 ? 4 : -4, 3, z);
      dummy.rotation.z = index * 0.83;
      dummy.scale.set(1, 0.8, 1);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 5]}>
      <torusGeometry args={[27, 0.16, 4, 54, Math.PI * 1.48]} />
      <meshBasicMaterial
        color="#78c9fa"
        transparent
        opacity={0.44}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const logo = useTexture("/brand/dlicom-mark-reference.jpg");
  const geometry = useMemo(() => {
    const frames: Bar[] = [];
    const edges: Bar[] = [];
    const blue: number[] = [];
    const violet: number[] = [];
    const stars: number[] = [];
    const line = (target: number[], a: number[], b: number[]) =>
      target.push(...a, ...b);

    // A sequence of open, asymmetric relay gates gives speed and depth without solid walls.
    for (let i = 0; i < 19; i++) {
      const z = 10 - i * 36;
      const emphasis = i % 4 === 0;
      for (const s of [-1, 1]) {
        frames.push([
          s * 21,
          1,
          z,
          emphasis ? 2.1 : 1.1,
          emphasis ? 31 : 22,
          emphasis ? 4 : 2,
        ]);
        frames.push([s * 16, 21, z, 1.1, 12, 2, -s * 0.78]);
        edges.push([s * 19.7, 0, z + 2, 0.22, emphasis ? 27 : 18, 0.24]);
        line(blue, [s * 19, -9, z], [s * 19, -9, z - 26]);
        if (emphasis) line(blue, [s * 21, 17, z], [s * 7, 28, z]);
      }
      if (i > 4 && i % 3 === 0) {
        line(violet, [-30, -4, z], [-42, 14, z - 24]);
        line(violet, [30, -4, z], [42, 14, z - 24]);
      }
      line(blue, [-7, -12, z], [7, -12, z]);
      line(blue, [0, -11.8, z], [0, -11.8, z - 17]);
    }
    for (let i = 0; i < (low ? 90 : 170); i++) {
      const seed = Math.sin(i * 127.1 + 4.8) * 43758.5453;
      const r = seed - Math.floor(seed);
      const x = Math.sin(i * 29.3) * (28 + r * 100);
      const y = Math.cos(i * 17.4) * (10 + r * 65);
      stars.push(x, y, 35 - ((i * 47.3) % 750));
    }
    return {
      frames,
      edges,
      blue: new Float32Array(blue),
      violet: new Float32Array(violet),
      stars: new Float32Array(stars),
    };
  }, [low]);
  return (
    <>
      <StageBatch bars={geometry.frames} color="#1b3658" />
      <StageBatch bars={geometry.edges} color="#67d8ff" opacity={0.86} />
      <SegmentLines positions={geometry.blue} color="#80e5ff" opacity={0.76} />
      <SegmentLines
        positions={geometry.violet}
        color="#a990e7"
        opacity={0.34}
      />
      <SignalHalos />
      <group position={[-26, 10, -55]} rotation={[0, 0.18, 0]}>
        <mesh>
          <planeGeometry args={[8, 8]} />
          <meshBasicMaterial
            map={logo}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[geometry.stars, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#b8eaff"
          size={0.38}
          transparent
          opacity={0.54}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useSettingsStore } from "@/store/settingsStore";
import { createSignalBlade, createSignalSeam } from "@/rendering/signalBlade";

// Actual spatial relay vessels, arranged to create foreground flybys and depth.
const RELAYS = [
  [-48, 9, -82, 0.78, 0.36],
  [53, 20, -137, 0.88, -0.48],
  [-62, -5, -190, 0.7, 0.54],
  [47, 23, -248, 0.83, -0.31],
  [-49, 19, -312, 0.95, 0.58],
  [59, -8, -371, 0.74, -0.51],
  [-45, 6, -432, 0.83, 0.35],
  [51, 21, -499, 0.91, -0.39],
  [-58, -3, -560, 0.8, 0.57],
  [44, 13, -612, 0.77, -0.27],
] as const;
const LOW_RELAYS = RELAYS.filter((_, index) => index % 2 === 0 || index === 1);
const SHADES = ["#49bff2", "#70c7ef", "#ab9ddb", "#70cfde", "#b79edb"];

function makeConduits() {
  const tubes: THREE.BufferGeometry[] = [];
  const add = (points: THREE.Vector3[], radius: number) =>
    tubes.push(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        Math.max(20, points.length * 8),
        radius,
        5,
        false,
      ),
    );
  for (const side of [-1, 1]) {
    const spine: THREE.Vector3[] = [];
    for (let i = 0; i <= 34; i++) {
      const z = 32 - i * 21;
      spine.push(
        new THREE.Vector3(
          side * (8 + Math.sin(i * 0.7) * 2),
          -13 + Math.cos(i * 0.53) * 2,
          z,
        ),
      );
    }
    add(spine, 0.28);
  }
  RELAYS.forEach(([x, y, z], index) => {
    add(
      [
        new THREE.Vector3(x, y - 24, z),
        new THREE.Vector3(x * 0.92, -21, z - 13),
        new THREE.Vector3(x * 0.63, -16, z - 26),
        new THREE.Vector3(Math.sign(x) * 9, -12, z - 37),
      ],
      index % 3 === 0 ? 0.38 : 0.27,
    );
  });
  const merged = mergeGeometries(tubes);
  tubes.forEach((tube) => tube.dispose());
  if (!merged) throw new Error("Network conduits could not be generated");
  return merged;
}

function makeAtmosphere(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.sin(i * 72.31) * 43758.5453;
    const b = Math.sin(i * 18.19 + 5) * 13758.1913;
    const c = Math.sin(i * 43.37 + 2) * 27375.773;
    positions[i * 3] = (a - Math.floor(a) - 0.5) * 235;
    positions[i * 3 + 1] = (b - Math.floor(b) - 0.35) * 125;
    positions[i * 3 + 2] = 25 - (c - Math.floor(c)) * 720;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function RelayVessel({
  data,
  index,
  blade,
  seam,
}: {
  data: (typeof RELAYS)[number];
  index: number;
  blade: THREE.BufferGeometry;
  seam: THREE.BufferGeometry;
}) {
  const [x, y, z, size, yaw] = data;
  const core = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (core.current)
      core.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.43 + index) * 0.14;
  });
  const tint = SHADES[index % SHADES.length];
  return (
    <group
      position={[x, y, z]}
      rotation={[0, yaw, index % 2 ? 0.12 : -0.14]}
      scale={size}
    >
      <mesh
        geometry={blade}
        position={[0, 3, 3]}
        rotation={[0.12, -0.15, -0.1]}
      >
        <meshPhysicalMaterial
          color={tint}
          vertexColors
          metalness={0.12}
          roughness={0.32}
          clearcoat={1}
          emissive={tint}
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh geometry={seam} position={[0, 3, 3]} rotation={[0.12, -0.15, -0.1]}>
        <meshBasicMaterial color="#9de3f0" toneMapped={false} />
      </mesh>
      <mesh
        geometry={blade}
        position={[0, -3, 3]}
        rotation={[-0.12, 0.14, Math.PI - 0.1]}
      >
        <meshPhysicalMaterial
          color={tint}
          vertexColors
          metalness={0.12}
          roughness={0.32}
          clearcoat={1}
          emissive={tint}
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh
        geometry={seam}
        position={[0, -3, 3]}
        rotation={[-0.12, 0.14, Math.PI - 0.1]}
      >
        <meshBasicMaterial color="#9de3f0" toneMapped={false} />
      </mesh>
      <group ref={core}>
        <mesh position={[0, 0, 7]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[7.2, 7.2, 6]} />
          <meshPhysicalMaterial
            color="#102c46"
            metalness={0.52}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>
        <mesh position={[0, 0, 10.4]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[4.4, 4.4, 0.4]} />
          <meshBasicMaterial color="#b8edf3" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, -23, -8]}>
        <cylinderGeometry args={[2.4, 4.6, 18, 8]} />
        <meshStandardMaterial
          color="#153b50"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, -32, -8]}>
        <cylinderGeometry args={[4.7, 4.7, 0.8, 10]} />
        <meshBasicMaterial color="#79d2e1" toneMapped={false} />
      </mesh>
    </group>
  );
}

function SwitchArray({
  data,
  index,
}: {
  data: (typeof RELAYS)[number];
  index: number;
}) {
  const [x, y, z, size, yaw] = data;
  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (pulse.current)
      pulse.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 1.5 + index) * 0.09,
      );
  });
  return (
    <group
      position={[x, y, z]}
      rotation={[0, yaw, index % 2 ? -0.16 : 0.12]}
      scale={size}
    >
      <mesh scale={[1.1, 1, 0.72]}>
        <cylinderGeometry args={[8, 8, 36, 8]} />
        <meshPhysicalMaterial
          color="#123b5b"
          metalness={0.42}
          roughness={0.3}
          clearcoat={0.8}
          flatShading
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 10, 0, 2]}>
          <mesh>
            <capsuleGeometry args={[2.9, 24, 5, 8]} />
            <meshStandardMaterial
              color="#376d91"
              metalness={0.31}
              roughness={0.31}
            />
          </mesh>
          <mesh position={[0, 0, 3.05]}>
            <boxGeometry args={[0.34, 25, 0.23]} />
            <meshBasicMaterial
              color={index % 2 ? "#b6d4f7" : "#7ddbe9"}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, side * 13, 0]}>
          <boxGeometry args={[26, 1.6, 7]} />
          <meshStandardMaterial
            color="#1d5272"
            metalness={0.52}
            roughness={0.37}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 8]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[9, 9, 4]} />
        <meshStandardMaterial
          color="#0d2941"
          metalness={0.54}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={pulse} position={[0, 0, 10.2]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[5.4, 5.4, 0.4]} />
        <meshBasicMaterial color="#d0f6f9" toneMapped={false} />
      </mesh>
    </group>
  );
}

function RelayFoundations({ low }: { low: boolean }) {
  const stations: ReadonlyArray<(typeof RELAYS)[number]> = low
    ? LOW_RELAYS
    : RELAYS;
  const decks = useRef<THREE.InstancedMesh>(null);
  const rims = useRef<THREE.InstancedMesh>(null);
  const keels = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!decks.current || !rims.current || !keels.current) return;
    const dummy = new THREE.Object3D();
    stations.forEach(([x, y, z, size, yaw], index) => {
      dummy.position.set(x, y - 33 * size, z - 7 * size);
      dummy.rotation.set(0, yaw + index * 0.12, 0);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      decks.current?.setMatrixAt(index, dummy.matrix);
      dummy.position.y += 1.2 * size;
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      rims.current?.setMatrixAt(index, dummy.matrix);
      dummy.position.y -= 7.2 * size;
      dummy.rotation.set(0, yaw, 0);
      dummy.updateMatrix();
      keels.current?.setMatrixAt(index, dummy.matrix);
    });
    for (const mesh of [decks.current, rims.current, keels.current])
      mesh.instanceMatrix.needsUpdate = true;
  }, [stations]);
  return (
    <>
      <instancedMesh ref={decks} args={[undefined, undefined, stations.length]}>
        <cylinderGeometry args={[19, 22, 2.5, 8]} />
        <meshStandardMaterial
          color="#102a3e"
          metalness={0.52}
          roughness={0.48}
          flatShading
        />
      </instancedMesh>
      <instancedMesh ref={rims} args={[undefined, undefined, stations.length]}>
        <torusGeometry args={[19.4, 0.27, 4, 8]} />
        <meshBasicMaterial color="#4ba7c7" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={keels} args={[undefined, undefined, stations.length]}>
        <cylinderGeometry args={[10.5, 2.5, 12, 8]} />
        <meshStandardMaterial
          color="#183d53"
          metalness={0.42}
          roughness={0.52}
          flatShading
        />
      </instancedMesh>
    </>
  );
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const geometry = useMemo(
    () => ({
      conduits: makeConduits(),
      atmosphere: makeAtmosphere(low ? 155 : 270),
      blade: createSignalBlade(),
      seam: createSignalSeam(),
    }),
    [low],
  );
  useEffect(
    () => () => Object.values(geometry).forEach((item) => item.dispose()),
    [geometry],
  );
  return (
    <>
      <mesh geometry={geometry.conduits}>
        <meshStandardMaterial
          color="#337993"
          emissive="#145d76"
          emissiveIntensity={0.65}
          metalness={0.36}
          roughness={0.42}
        />
      </mesh>
      <points geometry={geometry.atmosphere}>
        <pointsMaterial
          color="#b4d9e8"
          size={0.55}
          transparent
          opacity={0.63}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <RelayFoundations low={low} />
      {(low ? LOW_RELAYS : RELAYS).map((relay, index) =>
        index % 3 === 2 ? (
          <SwitchArray key={relay[2]} data={relay} index={index} />
        ) : (
          <RelayVessel
            key={relay[2]}
            data={relay}
            index={index}
            blade={geometry.blade}
            seam={geometry.seam}
          />
        ),
      )}
    </>
  );
}

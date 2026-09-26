"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createChatGeometry } from "@/rendering/chatGeometry";
import { useSettingsStore } from "@/store/settingsStore";

type MessageForm = {
  x: number;
  y: number;
  z: number;
  scale: number;
  yaw: number;
  tilt: number;
  color: string;
};

const FORMS: MessageForm[] = [
  {
    x: -47,
    y: 12,
    z: -56,
    scale: 1.35,
    yaw: 0.44,
    tilt: -0.13,
    color: "#307bbb",
  },
  {
    x: 59,
    y: 24,
    z: -109,
    scale: 1.82,
    yaw: -0.53,
    tilt: 0.18,
    color: "#4273ae",
  },
  {
    x: -79,
    y: 35,
    z: -135,
    scale: 1.14,
    yaw: 0.33,
    tilt: 0.31,
    color: "#72528b",
  },
  {
    x: 42,
    y: -5,
    z: -165,
    scale: 1.12,
    yaw: -0.28,
    tilt: -0.18,
    color: "#3c88b0",
  },
  {
    x: -54,
    y: 4,
    z: -208,
    scale: 1.95,
    yaw: 0.63,
    tilt: 0.11,
    color: "#277ea8",
  },
  {
    x: 92,
    y: 14,
    z: -242,
    scale: 1.24,
    yaw: -0.42,
    tilt: -0.3,
    color: "#b08a4a",
  },
  {
    x: -42,
    y: 31,
    z: -283,
    scale: 1.43,
    yaw: 0.44,
    tilt: -0.17,
    color: "#6b5a9b",
  },
  {
    x: 62,
    y: 38,
    z: -306,
    scale: 1.64,
    yaw: -0.55,
    tilt: 0.1,
    color: "#2f78b4",
  },
  {
    x: -86,
    y: -3,
    z: -346,
    scale: 1.2,
    yaw: 0.24,
    tilt: 0.24,
    color: "#408bac",
  },
  {
    x: 46,
    y: 3,
    z: -383,
    scale: 1.87,
    yaw: -0.4,
    tilt: -0.12,
    color: "#bb805b",
  },
  {
    x: -56,
    y: 41,
    z: -419,
    scale: 1.52,
    yaw: 0.57,
    tilt: 0.19,
    color: "#337fba",
  },
  {
    x: 87,
    y: 29,
    z: -448,
    scale: 1.09,
    yaw: -0.67,
    tilt: -0.29,
    color: "#624c89",
  },
  {
    x: -43,
    y: 6,
    z: -481,
    scale: 1.32,
    yaw: 0.35,
    tilt: -0.18,
    color: "#3e92b1",
  },
  {
    x: 51,
    y: 17,
    z: -522,
    scale: 2.04,
    yaw: -0.34,
    tilt: 0.1,
    color: "#327fb9",
  },
  {
    x: -93,
    y: 27,
    z: -555,
    scale: 1.2,
    yaw: 0.51,
    tilt: 0.25,
    color: "#af854e",
  },
  {
    x: 72,
    y: -4,
    z: -586,
    scale: 1.3,
    yaw: -0.31,
    tilt: -0.18,
    color: "#70578d",
  },
  {
    x: -48,
    y: 35,
    z: -616,
    scale: 1.57,
    yaw: 0.62,
    tilt: 0.09,
    color: "#3a82b2",
  },
  {
    x: 83,
    y: 36,
    z: -650,
    scale: 1.78,
    yaw: -0.48,
    tilt: -0.11,
    color: "#39739a",
  },
];

function makeFibers(forms: MessageForm[]) {
  const geometries: THREE.TubeGeometry[] = [];
  const add = (points: THREE.Vector3[], radius: number) => {
    geometries.push(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        Math.max(12, points.length * 3),
        radius,
        4,
        false,
      ),
    );
  };
  // One luminous carrier travels below the packet; the rest connects the
  // suspended messages without turning the scene into a paved corridor.
  const spine: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const z = 24 - i * 19;
    spine.push(
      new THREE.Vector3(
        Math.sin(z * 0.015) * 3,
        -13 + Math.sin(z * 0.023) * 2,
        z,
      ),
    );
  }
  add(spine, 0.18);
  forms.forEach((form, index) => {
    const anchor = new THREE.Vector3(form.x, form.y, form.z);
    const center = new THREE.Vector3(Math.sin(form.z * 0.015) * 3, -13, form.z);
    add(
      [
        anchor,
        new THREE.Vector3(form.x * 0.76, form.y + 8, form.z - 10),
        new THREE.Vector3(form.x * 0.32, 3, form.z - 18),
        center,
      ],
      0.085,
    );
    if (index % 2 === 0 && forms[index + 1]) {
      const next = forms[index + 1];
      add(
        [
          anchor,
          new THREE.Vector3(
            (form.x + next.x) * 0.45,
            Math.max(form.y, next.y) + 22,
            (form.z + next.z) / 2,
          ),
          new THREE.Vector3(next.x, next.y, next.z),
        ],
        0.06,
      );
    }
  });
  const merged = mergeGeometries(geometries);
  geometries.forEach((item) => item.dispose());
  if (!merged) throw new Error("Unable to create network fibers");
  return merged;
}

function makeDust(low: boolean) {
  const positions: number[] = [];
  for (let i = 0; i < (low ? 130 : 250); i++) {
    const n = Math.sin(i * 12.9898) * 43758.5453;
    const fraction = n - Math.floor(n);
    positions.push(
      (i % 2 ? 1 : -1) * (18 + fraction * 120),
      -8 + ((i * 19.73) % 95),
      30 - ((i * 53.71) % 720),
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

function MessageSculptures({ forms }: { forms: MessageForm[] }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const inset = useRef<THREE.InstancedMesh>(null);
  const strokes = useRef<THREE.InstancedMesh>(null);
  const bubbles = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createChatGeometry(), []);
  useEffect(() => {
    const outer = body.current,
      inner = inset.current,
      marks = strokes.current,
      glass = bubbles.current;
    if (!outer || !inner || !marks || !glass) return;
    const parent = new THREE.Matrix4();
    const local = new THREE.Matrix4();
    const marker = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const dummy = new THREE.Object3D();
    forms.forEach((form, index) => {
      dummy.position.set(form.x * 0.82, form.y * 0.7, form.z);
      dummy.rotation.set(0, form.yaw, form.tilt);
      dummy.scale.setScalar(form.scale);
      dummy.updateMatrix();
      parent.copy(dummy.matrix);
      glass.setMatrixAt(index, parent);
      glass.setColorAt(index, new THREE.Color(form.color));
      local.compose(
        new THREE.Vector3(0, 0, 5.5),
        new THREE.Quaternion(),
        new THREE.Vector3(0.48, 0.48, 0.48),
      );
      outer.setMatrixAt(index, marker.multiplyMatrices(parent, local));
      outer.setColorAt(index, new THREE.Color(form.color).multiplyScalar(1.4));
      local.compose(
        new THREE.Vector3(0, 0, 6.3),
        new THREE.Quaternion(),
        new THREE.Vector3(0.4, 0.38, 0.08),
      );
      inner.setMatrixAt(index, marker.multiplyMatrices(parent, local));
      position.set(0, -0.35, 6.55);
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4);
      scale.set(1.85, 1.85, 0.18);
      local.compose(position, quaternion, scale);
      marks.setMatrixAt(index, marker.multiplyMatrices(parent, local));
    });
    outer.instanceMatrix.needsUpdate = true;
    inner.instanceMatrix.needsUpdate = true;
    marks.instanceMatrix.needsUpdate = true;
    glass.instanceMatrix.needsUpdate = true;
    if (outer.instanceColor) outer.instanceColor.needsUpdate = true;
    if (glass.instanceColor) glass.instanceColor.needsUpdate = true;
  }, [forms]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <>
      <instancedMesh ref={body} args={[geometry, undefined, forms.length]}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.16}
          clearcoat={0.84}
          clearcoatRoughness={0.14}
          emissive="#0e3552"
          emissiveIntensity={0.72}
        />
      </instancedMesh>
      <instancedMesh ref={bubbles} args={[undefined, undefined, forms.length]}>
        <sphereGeometry args={[13.7, 22, 14]} />
        <meshPhysicalMaterial
          color="#9cc9ed"
          metalness={0.06}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.06}
          transparent
          opacity={0.22}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh ref={inset} args={[geometry, undefined, forms.length]}>
        <meshStandardMaterial
          color="#163b66"
          roughness={0.48}
          metalness={0.22}
          emissive="#245e95"
          emissiveIntensity={0.55}
        />
      </instancedMesh>
      <instancedMesh ref={strokes} args={[undefined, undefined, forms.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#94d8e3" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function DiliRelay() {
  const mascot = useTexture("/brand/dili-blue-cutout.png");
  const floating = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (floating.current)
      floating.current.position.y =
        11 + Math.sin(clock.elapsedTime * 1.35) * 0.35;
  });
  return (
    <group position={[-43, 0, -66]} rotation={[0, 0.32, 0]}>
      <mesh position={[0, -10, 0]}>
        <cylinderGeometry args={[5, 7, 4, 12]} />
        <meshStandardMaterial
          color="#2e597a"
          metalness={0.4}
          roughness={0.33}
        />
      </mesh>
      <mesh position={[0, -7.7, 0]}>
        <cylinderGeometry args={[4.8, 4.8, 0.2, 24]} />
        <meshBasicMaterial color="#8bdded" toneMapped={false} />
      </mesh>
      <group ref={floating} position={[0, 11, 0]}>
        <mesh>
          <sphereGeometry args={[8.3, 24, 16]} />
          <meshPhysicalMaterial
            color="#6dbbe1"
            transparent
            opacity={0.16}
            depthWrite={false}
            side={THREE.DoubleSide}
            roughness={0.18}
            metalness={0.12}
            clearcoat={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 2]}>
          <planeGeometry args={[12.5, 15.5]} />
          <meshBasicMaterial
            map={mascot}
            transparent
            alphaTest={0.05}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[0.23, 0.1, 0.1]}>
          <torusGeometry args={[8.65, 0.13, 4, 40]} />
          <meshBasicMaterial
            color="#acebf2"
            transparent
            opacity={0.75}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const forms = useMemo(
    () =>
      FORMS.filter((_, index) =>
        low
          ? [1, 4, 7, 9, 13, 17].includes(index)
          : [1, 4, 5, 7, 9, 11, 13, 15, 17].includes(index),
      ),
    [low],
  );
  const world = useMemo(
    () => ({ fibers: makeFibers(forms), dust: makeDust(low) }),
    [forms, low],
  );
  useEffect(
    () => () => Object.values(world).forEach((item) => item.dispose()),
    [world],
  );
  return (
    <>
      <mesh geometry={world.fibers}>
        <meshBasicMaterial
          color="#4bb4cf"
          transparent
          opacity={0.48}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <points geometry={world.dust}>
        <pointsMaterial
          color="#c9ecfb"
          size={0.6}
          transparent
          opacity={0.62}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <MessageSculptures forms={forms} />
      <DiliRelay />
    </>
  );
}

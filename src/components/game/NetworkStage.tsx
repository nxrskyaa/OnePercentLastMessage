"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useSettingsStore } from "@/store/settingsStore";
import { signalState } from "@/rendering/signalState";

const FIN_POSITIONS = [
  -45, -102, -168, -232, -296, -364, -430, -496, -562, -620,
];

function channelHeight(z: number) {
  return Math.sin(z * 0.019) * 2.3 + Math.sin(z * 0.047) * 0.75;
}

function colorize(geometry: THREE.BufferGeometry, color: string) {
  const tint = new THREE.Color(color);
  const colors = new Float32Array(geometry.getAttribute("position").count * 3);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = tint.r;
    colors[i + 1] = tint.g;
    colors[i + 2] = tint.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function makeFoldedChannel() {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const strips = [
    { a: 20, b: 29, ya: -21, yb: -16, tint: "#4d6fb1" },
    { a: 29, b: 36, ya: -16, yb: -3, tint: "#6885c9" },
    { a: 36, b: 45, ya: -3, yb: 19, tint: "#384e99" },
    { a: 45, b: 61, ya: 19, yb: 38, tint: "#5673b5" },
  ];
  const emit = (p: readonly [number, number, number], c: THREE.Color) => {
    positions.push(...p);
    colors.push(c.r, c.g, c.b);
  };
  for (const side of [-1, 1]) {
    for (const strip of strips) {
      const base = new THREE.Color(strip.tint);
      const violetColor = new THREE.Color("#9d86cb");
      const glacierColor = new THREE.Color("#9dbde2");
      const start = positions.length / 3;
      for (let i = 0; i <= 74; i++) {
        const z = 35 - i * 10;
        const fold = Math.sin(i * 0.71 + strip.a) * 1.7;
        const shade = base.clone();
        const violet = THREE.MathUtils.smoothstep(-z, 180, 400) * 0.38;
        const glacier = THREE.MathUtils.smoothstep(-z, 455, 650) * 0.34;
        shade.lerp(violetColor, violet);
        shade.lerp(glacierColor, glacier);
        const a = [
          side * (strip.a + fold),
          strip.ya + channelHeight(z),
          z,
        ] as const;
        const b = [
          side * (strip.b + fold),
          strip.yb + channelHeight(z),
          z,
        ] as const;
        emit(a, shade);
        emit(b, shade);
        if (i < 74) {
          const n = start + i * 2;
          indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCurrent() {
  const geometry = new THREE.PlaneGeometry(40, 720, 20, 180);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -320);
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const deep = new THREE.Color("#275ba6");
  const edge = new THREE.Color("#5cb4d1");
  const light = new THREE.Color("#b6e7e0");
  const shade = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    position.setY(
      i,
      -21 + channelHeight(z) + Math.sin(x * 0.18 + z * 0.035) * 0.35,
    );
    const flow =
      Math.sin(z * 0.052 + x * 0.18) + Math.sin(z * 0.021 - x * 0.24) * 0.48;
    shade.copy(deep).lerp(edge, Math.abs(x) / 36 + 0.18);
    shade.lerp(light, THREE.MathUtils.smoothstep(flow, 0.76, 1.35) * 0.6);
    colors[i * 3] = shade.r;
    colors[i * 3 + 1] = shade.g;
    colors[i * 3 + 2] = shade.b;
  }
  position.needsUpdate = true;
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function makeCrossings() {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const stops = [-80, -242, -436, -574];
  stops.forEach((zBase, section) => {
    const tint = new THREE.Color(
      section === 0
        ? "#b5dded"
        : section === 1
          ? "#9f9ad4"
          : section === 2
            ? "#d6bce1"
            : "#e7dcbf",
    );
    const row = (x: number, side: number): [number, number, number] => {
      const reach = Math.max(0, 1 - Math.pow(Math.abs(x) / 43, 1.8));
      return [
        x,
        -13 + 44 * Math.pow(reach, 0.68) + side * 2.5,
        zBase + Math.sin(x * 0.07) * 5 + side * 1.2,
      ];
    };
    const emit = (p: [number, number, number], brightness: number) => {
      positions.push(...p);
      colors.push(
        tint.r * brightness,
        tint.g * brightness,
        tint.b * brightness,
      );
    };
    const start = positions.length / 3;
    for (let i = 0; i <= 28; i++) {
      const x0 = -43 + (i / 28) * 86;
      const a = row(x0, -1);
      const b = row(x0, 1);
      emit(a, 0.58);
      emit(b, 1);
      if (i < 28) {
        const n = start + i * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeRibbon(x: number, y: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const z = 40 - i * 18;
    points.push(
      new THREE.Vector3(x + Math.sin(z * 0.019) * 0.9, y + channelHeight(z), z),
    );
  }
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    160,
    0.16,
    4,
    false,
  );
}

function makeSail() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -15);
  shape.lineTo(6, -15);
  shape.bezierCurveTo(17, -1, 13, 14, 3, 26);
  shape.bezierCurveTo(9, 6, 3, -3, 0, -15);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 3.2,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.65,
    bevelThickness: 0.65,
    curveSegments: 5,
  });
}

function makeRelaySails(low: boolean) {
  const parts: THREE.BufferGeometry[] = [];
  const sail = makeSail();
  FIN_POSITIONS.forEach((z, index) => {
    if (low && index % 2) return;
    for (const side of [index % 2 === 0 ? -1 : 1]) {
      const clone = sail.clone();
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(
          side * (36 + (index % 3) * 3),
          6 + channelHeight(z),
          z,
        ),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            0,
            side < 0 ? 0.42 : Math.PI - 0.42,
            side * (0.12 + index * 0.025),
          ),
        ),
        new THREE.Vector3(
          0.85 + (index % 3) * 0.17,
          0.78 + (index % 4) * 0.09,
          1,
        ),
      );
      clone.applyMatrix4(matrix);
      parts.push(
        colorize(
          clone,
          index < 3 ? "#adc7e3" : index < 7 ? "#aa9ddd" : "#c4d7f2",
        ),
      );
    }
  });
  sail.dispose();
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Relay sails could not be generated");
  return merged;
}

function makeSky() {
  const geometry = new THREE.SphereGeometry(900, 48, 24);
  const positions = geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);
  const low = new THREE.Color("#293b6e");
  const middle = new THREE.Color("#4a68a6");
  const high = new THREE.Color("#94a1c7");
  const shade = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const h = positions.getY(i) / 900;
    shade.copy(low).lerp(middle, THREE.MathUtils.smoothstep(h, -0.42, 0.08));
    shade.lerp(high, THREE.MathUtils.smoothstep(h, 0.08, 0.85));
    colors[i * 3] = shade.r;
    colors[i * 3 + 1] = shade.g;
    colors[i * 3 + 2] = shade.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function NetworkStage() {
  const low = useSettingsStore((state) => state.runtimeQuality === "low");
  const currentMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const crossingMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const world = useMemo(() => {
    const ribbons = [-22, 22].map((x) => makeRibbon(x, x < 0 ? -16 : -17));
    const mergedRibbon = mergeGeometries(ribbons);
    ribbons.forEach((ribbon) => ribbon.dispose());
    if (!mergedRibbon) throw new Error("Signal ribbon could not be generated");
    return {
      channel: makeFoldedChannel(),
      current: makeCurrent(),
      crossings: makeCrossings(),
      sails: makeRelaySails(low),
      ribbon: mergedRibbon,
      sky: makeSky(),
    };
  }, [low]);
  useEffect(
    () => () => Object.values(world).forEach((asset) => asset.dispose()),
    [world],
  );
  useFrame(({ clock }) => {
    const boost = signalState.boost.value;
    const critical = signalState.critical.value;
    currentMaterial.current?.color.setRGB(
      1 + boost * 0.12 + critical * 0.12,
      1 + boost * 0.17 - critical * 0.13,
      1 + boost * 0.22 - critical * 0.16,
    );
    const pulse = 0.94 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
    crossingMaterial.current?.color.setRGB(pulse, pulse, 1);
  });
  return (
    <>
      <mesh geometry={world.sky} frustumCulled={false}>
        <meshBasicMaterial
          vertexColors
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh geometry={world.channel} frustumCulled={false}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.57}
          metalness={0.08}
        />
      </mesh>
      <mesh geometry={world.current} frustumCulled={false}>
        <meshBasicMaterial
          ref={currentMaterial}
          vertexColors
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={world.crossings} frustumCulled={false}>
        <meshStandardMaterial
          ref={crossingMaterial}
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.12}
        />
      </mesh>
      <mesh geometry={world.sails} frustumCulled={false}>
        <meshStandardMaterial
          vertexColors
          roughness={0.31}
          metalness={0.13}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={world.ribbon} frustumCulled={false}>
        <meshBasicMaterial color="#bdeaff" toneMapped={false} />
      </mesh>
    </>
  );
}

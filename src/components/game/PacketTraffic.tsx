"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { LineBasicNodeMaterial } from "three/webgpu";
import {
  attribute,
  color,
  float,
  mix,
  mod,
  positionLocal,
  sin,
  time,
  vec3,
} from "three/tsl";
import { useSettingsStore } from "@/store/settingsStore";

function random(seed: number) {
  const n = Math.sin(seed * 124.121 + 17.52) * 143758.5453;
  return n - Math.floor(n);
}

function trafficGeometry(count: number) {
  const positions = new Float32Array(count * 2 * 3);
  const speeds = new Float32Array(count * 2);
  const heats = new Float32Array(count * 2);
  const ends = new Float32Array(count * 2);
  const lengths = new Float32Array(count * 2);
  const curves = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const lane = i % 12;
    const distant = lane >= 8;
    const side = lane % 2 ? 1 : -1;
    const x = distant
      ? side * (46 + Math.floor((lane - 8) / 2) * 18)
      : side * (19 + Math.floor(lane / 2) * 3.2);
    const y = distant
      ? 13.75 + Math.floor((lane - 8) / 2) * 9
      : -6.8 + Math.floor(lane / 2) * 2.4;
    const start = random(i * 4 + 2) * 705;
    const speed = (distant ? 12 : 22) + random(i * 6 + 5) * (distant ? 14 : 24);
    const length = (distant ? 0.25 : 0.45) + random(i * 3 + 4) * 0.9;
    const heat =
      lane === 7 || lane === 5
        ? 0.22 + random(i + 34) * 0.22
        : 0.38 + random(i + 16) * 0.38;
    for (let j = 0; j < 2; j++) {
      const k = i * 2 + j;
      positions[k * 3] = x + (random(i * 9 + 8) - 0.5) * 0.75;
      positions[k * 3 + 1] = y + (random(i * 7 + 3) - 0.5) * 0.6;
      positions[k * 3 + 2] = start;
      speeds[k] = speed;
      heats[k] = heat;
      ends[k] = j;
      lengths[k] = length;
      curves[k] = distant ? side * 8 : 0;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("aHeat", new THREE.BufferAttribute(heats, 1));
  geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
  geometry.setAttribute("aLength", new THREE.BufferAttribute(lengths, 1));
  geometry.setAttribute("aCurve", new THREE.BufferAttribute(curves, 1));
  return geometry;
}

export function PacketTraffic() {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const count = quality === "low" ? 220 : quality === "medium" ? 520 : 1050;
  const geometry = useMemo(() => trafficGeometry(count), [count]);
  const material = useMemo(() => {
    const traffic = new LineBasicNodeMaterial();
    const z = float(34)
      .sub(
        mod(
          positionLocal.z.add(time.mul(attribute("aSpeed", "float"))),
          float(705),
        ),
      )
      .add(attribute("aEnd", "float").mul(attribute("aLength", "float")));
    traffic.positionNode = vec3(
      positionLocal.x.add(sin(z.mul(0.013)).mul(attribute("aCurve", "float"))),
      positionLocal.y,
      z,
    );
    traffic.colorNode = mix(
      color("#195372"),
      color("#b7f8ff"),
      attribute("aHeat", "float"),
    );
    traffic.transparent = true;
    traffic.opacity = 0.38;
    traffic.depthWrite = false;
    traffic.toneMapped = false;
    return traffic;
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <lineSegments
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

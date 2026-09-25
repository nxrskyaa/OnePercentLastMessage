"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settingsStore";

function random(seed: number) {
  const value = Math.sin(seed * 124.121 + 17.52) * 143758.5453;
  return value - Math.floor(value);
}

export function PacketTraffic() {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const count = quality === "low" ? 90 : quality === "medium" ? 150 : 240;
  const data = useMemo(() => {
    const positions = new Float32Array(count * 6);
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const speed = new Float32Array(count);
    const offset = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const lane = i % 8;
      const side = lane % 2 ? 1 : -1;
      x[i] = side * (19 + Math.floor(lane / 2) * 4);
      y[i] = -7 + Math.floor(lane / 2) * 4;
      speed[i] = 16 + random(i * 6 + 5) * 22;
      offset[i] = random(i * 4 + 2) * 700;
    }
    const geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(positions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", attribute);
    return { geometry, positions, x, y, speed, offset };
  }, [count]);
  const active = useRef<typeof data | null>(null);
  useEffect(() => {
    active.current = data;
    return () => {
      active.current = null;
      data.geometry.dispose();
    };
  }, [data]);
  useFrame(({ clock }) => {
    const frame = active.current;
    if (!frame) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const z = 25 - ((frame.offset[i] + t * frame.speed[i]) % 700);
      const index = i * 6;
      frame.positions[index] = frame.x[i];
      frame.positions[index + 1] = frame.y[i];
      frame.positions[index + 2] = z;
      frame.positions[index + 3] = frame.x[i];
      frame.positions[index + 4] = frame.y[i];
      frame.positions[index + 5] = z - 0.8;
    }
    frame.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments geometry={data.geometry} frustumCulled={false}>
      <lineBasicMaterial
        color="#7ddaf5"
        transparent
        opacity={0.46}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

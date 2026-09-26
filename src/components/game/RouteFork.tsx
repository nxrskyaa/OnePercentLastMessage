"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

function route(side: number) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -11, -215),
    new THREE.Vector3(side * 7, -8, -255),
    new THREE.Vector3(side * 11, -6, -304),
    new THREE.Vector3(side * 8, -9, -344),
    new THREE.Vector3(0, -11, -370),
  ]);
}

function strand(curve: THREE.CatmullRomCurve3, side: number) {
  const points = Array.from({ length: 36 }, (_, index) => {
    const t = index / 35;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    return point
      .addScaledVector(across, side * 2.1)
      .add(new THREE.Vector3(0, Math.sin(t * Math.PI) * 0.9, 0));
  });
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    70,
    0.13,
    5,
    false,
  );
}

export function RouteFork() {
  const geometry = useMemo(() => {
    const safe = route(-1);
    const fast = route(1);
    return {
      safe: [strand(safe, -1), strand(safe, 1)],
      fast: [strand(fast, -1), strand(fast, 1)],
    };
  }, []);
  useEffect(
    () => () => {
      geometry.safe.forEach((item) => item.dispose());
      geometry.fast.forEach((item) => item.dispose());
    },
    [geometry],
  );
  return (
    <>
      {geometry.safe.map((item, index) => (
        <mesh key={`safe-${index}`} geometry={item}>
          <meshBasicMaterial color="#9ae5ef" toneMapped={false} />
        </mesh>
      ))}
      {geometry.fast.map((item, index) => (
        <mesh key={`fast-${index}`} geometry={item}>
          <meshBasicMaterial color="#e0ae71" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

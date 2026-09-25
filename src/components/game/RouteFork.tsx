"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { flowSurface } from "@/rendering/materials";

function route(side: number) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -12.1, -215),
    new THREE.Vector3(side * 5.5, -12.1, -260),
    new THREE.Vector3(side * 10, -12.1, -310),
    new THREE.Vector3(side * 7.5, -12.1, -345),
    new THREE.Vector3(0, -12.1, -370),
  ]);
}

function deck(curve: THREE.CatmullRomCurve3, width: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const tangent = new THREE.Vector3();
  const across = new THREE.Vector3();
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const center = curve.getPoint(t);
    curve.getTangent(t, tangent);
    across.set(-tangent.z, 0, tangent.x).normalize();
    for (const side of [-1, 1]) {
      positions.push(
        center.x + across.x * side * width * 0.5,
        center.y,
        center.z + across.z * side * width * 0.5,
      );
    }
    if (i < 32) {
      const start = i * 2;
      indices.push(
        start,
        start + 1,
        start + 2,
        start + 1,
        start + 3,
        start + 2,
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function edge(curve: THREE.CatmullRomCurve3, side: number) {
  const points = Array.from({ length: 33 }, (_, index) => {
    const t = index / 32;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    return point
      .addScaledVector(across, side * 3.7)
      .add(new THREE.Vector3(0, 0.22, 0));
  });
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    48,
    0.11,
    4,
    false,
  );
}

export function RouteFork() {
  const geometry = useMemo(() => {
    const safe = route(-1);
    const publicRoute = route(1);
    const approach = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -11.58, 25),
      new THREE.Vector3(0, -11.58, -80),
      new THREE.Vector3(0, -11.58, -155),
      new THREE.Vector3(0, -11.58, -215),
    ]);
    return {
      approach: new THREE.TubeGeometry(approach, 48, 0.09, 4, false),
      safeDeck: deck(safe, 7.4),
      publicDeck: deck(publicRoute, 7.4),
      safeEdges: [edge(safe, -1), edge(safe, 1)],
      publicEdges: [edge(publicRoute, -1), edge(publicRoute, 1)],
    };
  }, []);
  const materials = useMemo(
    () => ({
      safeDeck: new THREE.MeshStandardMaterial({
        color: "#294551",
        metalness: 0.45,
        roughness: 0.66,
        side: THREE.DoubleSide,
      }),
      publicDeck: new THREE.MeshStandardMaterial({
        color: "#514033",
        metalness: 0.45,
        roughness: 0.66,
        side: THREE.DoubleSide,
      }),
      approach: flowSurface("#c4f5f6"),
      safeEdge: flowSurface("#81d6df"),
      publicEdge: flowSurface("#dfab76"),
    }),
    [],
  );
  useEffect(
    () => () => {
      geometry.approach.dispose();
      geometry.safeDeck.dispose();
      geometry.publicDeck.dispose();
      geometry.safeEdges.forEach((item) => item.dispose());
      geometry.publicEdges.forEach((item) => item.dispose());
      Object.values(materials).forEach((item) => item.dispose());
    },
    [geometry, materials],
  );
  return (
    <>
      <mesh geometry={geometry.approach} material={materials.approach} />
      <mesh geometry={geometry.safeDeck} material={materials.safeDeck} />
      <mesh geometry={geometry.publicDeck} material={materials.publicDeck} />
      {geometry.safeEdges.map((item, index) => (
        <mesh
          key={`safe-${index}`}
          geometry={item}
          material={materials.safeEdge}
        />
      ))}
      {geometry.publicEdges.map((item, index) => (
        <mesh
          key={`public-${index}`}
          geometry={item}
          material={materials.publicEdge}
        />
      ))}
    </>
  );
}

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { dataSurface, energySurface } from "@/rendering/materials";
import { useSettingsStore } from "@/store/settingsStore";

type Beam = { a: THREE.Vector3; b: THREE.Vector3; width: number };
type Block = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
};
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildKit(spacing: number) {
  const frame: Beam[] = [];
  const braces: Beam[] = [];
  const far: Beam[] = [];
  const panels: Block[] = [];
  const seams: Block[] = [];
  const conduits: Block[] = [];
  const amber: Block[] = [];
  const warning: Block[] = [];
  const end = GAME_CONFIG.destination.z + 25;

  // Suspended machine deck with open gaps between solid bulkheads.
  for (let z = 20, index = 0; z > end; z -= spacing, index++) {
    const heavy = index % 3 === 0;
    for (const side of [-1, 1]) {
      const x = side * (24 + (index % 4 === 2 ? 5 : 0));
      const outer = x + side * (heavy ? 13 : 8);
      frame.push({
        a: v(x, -12, z),
        b: v(x, 19 + (heavy ? 7 : 0), z),
        width: heavy ? 3.8 : 2.5,
      });
      if (heavy)
        frame.push({
          a: v(x, 26, z),
          b: v(side * 12, 34, z - 3),
          width: 2.6,
        });
      else if (index % 3 === 2)
        frame.push({
          a: v(x, 19, z),
          b: v(x + side * 14, 37, z - spacing * 0.25),
          width: 1.6,
        });
      braces.push({
        a: v(x, -8, z),
        b: v(outer, 11, z - spacing * 0.42),
        width: 1.45,
      });
      braces.push({
        a: v(outer, 11, z - spacing * 0.42),
        b: v(x, 22, z - spacing * 0.8),
        width: 1.2,
      });
      panels.push({
        x: outer,
        y: 5,
        z: z - spacing * 0.45,
        sx: heavy ? 8 : 5,
        sy: heavy ? 21 : 15,
        sz: heavy ? 14 : 9,
      });
      for (const y of [0, 6, 12]) {
        seams.push({
          x: outer - side * (heavy ? 4.07 : 2.57),
          y,
          z: z - spacing * 0.45,
          sx: 0.14,
          sy: 0.22,
          sz: heavy ? 12 : 7,
        });
      }
      panels.push({
        x: side * 21,
        y: -10,
        z: z - spacing * 0.5,
        sx: 6,
        sy: 2.2,
        sz: spacing * 0.82,
      });
      conduits.push({
        x: side * 20,
        y: -8.65,
        z: z - spacing * 0.5,
        sx: 0.22,
        sy: 0.1,
        sz: spacing * 0.73,
      });
      if (heavy)
        panels.push({
          x: outer + side * 2,
          y: 11,
          z: z - spacing * 0.45,
          sx: 1.2,
          sy: 11,
          sz: 8,
        });
    }
    if (heavy) {
      frame.push({ a: v(-12, 34, z - 3), b: v(12, 34, z - 3), width: 2.8 });
      panels.push({ x: 0, y: 35.8, z: z - 3, sx: 13, sy: 1.1, sz: 5 });
    }
    panels.push({
      x: 0,
      y: -15,
      z: z - spacing * 0.5,
      sx: 9,
      sy: 2,
      sz: spacing * 0.78,
    });
    if (index % 2 === 0)
      panels.push({
        x: 0,
        y: -12.7,
        z: z - spacing * 0.5,
        sx: 2.3,
        sy: 0.35,
        sz: spacing * 0.54,
      });
  }
  // Far processing stacks and branching highways create the skyline.
  for (let i = 0; i < 19; i++) {
    const side = i % 2 ? 1 : -1;
    const z = -26 - i * 36;
    const x = side * (72 + (i % 4) * 12);
    const height = 55 + (i % 5) * 15;
    far.push({ a: v(x, -42, z), b: v(x, height, z), width: 9 + (i % 3) * 2 });
    far.push({
      a: v(x, height * 0.65, z),
      b: v(x - side * 22, height * 0.45, z - 18),
      width: 2.3,
    });
    if (i % 3 === 0)
      far.push({ a: v(x, height + 8, z), b: v(x, height + 36, z), width: 1.3 });
  }
  for (const side of [-1, 1]) {
    panels.push({ x: side * 43, y: -21, z: -290, sx: 8, sy: 5, sz: 610 });
    conduits.push({
      x: side * 41.6,
      y: -17.9,
      z: -290,
      sx: 0.2,
      sy: 0.12,
      sz: 585,
    });
    // The Array: an offset suspended antenna bank.
    for (let i = 0; i < 5; i++) {
      const x = side * (51 + i * 5.5);
      frame.push({
        a: v(x, -14, -230 - i * 8),
        b: v(x, 56 + i * 7, -230 - i * 8),
        width: i % 2 ? 2.8 : 4,
      });
      braces.push({
        a: v(x, 35, -230 - i * 8),
        b: v(x - side * 13, 55, -239 - i * 8),
        width: 1,
      });
    }
    // The Gate and The Watcher stay outside the steering corridor.
    panels.push({ x: side * 36, y: 13, z: -438, sx: 14, sy: 63, sz: 18 });
    panels.push({ x: side * 24, y: 37, z: -438, sx: 10, sy: 8, sz: 18 });
    panels.push({ x: side * 59, y: 30, z: -535, sx: 13, sy: 96, sz: 22 });
    braces.push({
      a: v(side * 58, 65, -535),
      b: v(side * 27, 47, -547),
      width: 3.5,
    });
    warning.push({ x: side * 58, y: 63, z: -522, sx: 3.2, sy: 1.2, sz: 0.3 });
    for (let i = 0; i < 7; i++) {
      const target = side < 0 ? conduits : amber;
      target.push({
        x: side * 16,
        y: -6,
        z: -375 - i * 26,
        sx: 0.14,
        sy: 0.1,
        sz: 12,
      });
    }
  }
  return { frame, braces, far, panels, seams, conduits, amber, warning };
}

function BeamBatch({
  beams,
  material,
}: {
  beams: Beam[];
  material: THREE.Material;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    const direction = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    beams.forEach((beam, index) => {
      direction.subVectors(beam.b, beam.a);
      helper.position.copy(beam.a).addScaledVector(direction, 0.5);
      helper.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      helper.scale.set(beam.width, direction.length(), beam.width);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [beams]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, beams.length]}
      material={material}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function BlockBatch({
  blocks,
  material,
}: {
  blocks: Block[];
  material: THREE.Material;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const helper = new THREE.Object3D();
    blocks.forEach((block, index) => {
      helper.position.set(block.x, block.y, block.z);
      helper.rotation.set(0, 0, 0);
      helper.scale.set(block.sx, block.sy, block.sz);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [blocks]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, blocks.length]}
      material={material}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

export function SignalStructures() {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const kit = useMemo(
    () => buildKit(quality === "low" ? 86 : quality === "medium" ? 72 : 62),
    [quality],
  );
  const materials = useMemo(
    () => ({
      frame: dataSurface("#344752", "#20455b"),
      panel: dataSurface("#24343e", "#193143"),
      seam: dataSurface("#0b1720", "#193143"),
      brace: dataSurface("#40515a", "#244a59"),
      far: dataSurface("#1c2b34", "#152835"),
      cyan: energySurface("#317f9a", 1.7),
      amber: energySurface("#aa7a48", 1.6),
      warning: energySurface("#984c48", 1.8),
    }),
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );
  return (
    <>
      <BeamBatch beams={kit.far} material={materials.far} />
      <BeamBatch beams={kit.frame} material={materials.frame} />
      <BeamBatch beams={kit.braces} material={materials.brace} />
      <BlockBatch blocks={kit.panels} material={materials.panel} />
      <BlockBatch blocks={kit.seams} material={materials.seam} />
      <BlockBatch blocks={kit.conduits} material={materials.cyan} />
      <BlockBatch blocks={kit.amber} material={materials.amber} />
      <BlockBatch blocks={kit.warning} material={materials.warning} />
    </>
  );
}

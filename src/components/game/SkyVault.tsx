"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { channelHeight } from "./NetworkStage";
import { GAME_CONFIG } from "@/game/config";
import { stageAt, type StageDefinition } from "@/game/stages";
import { makeSoftLightTexture } from "@/rendering/lightTextures";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

const STOPS = [-42, -120, -202, -286, -370, -456, -544, -626];

function buildVault(stage: StageDefinition) {
  const ribs: THREE.BufferGeometry[] = [];
  const edges: THREE.BufferGeometry[] = [];
  const bells: THREE.BufferGeometry[] = [];
  const lenses: THREE.BufferGeometry[] = [];
  const glow: THREE.BufferGeometry[] = [];
  const beams: THREE.BufferGeometry[] = [];
  STOPS.forEach((z, index) => {
    const h = channelHeight(z);
    const crown =
      (stage.motif === "prisms" ? 72 : 63) + Math.sin(index * 1.2) * 5;
    for (const offset of [-3.5, 3.5]) {
      const points = Array.from({ length: 25 }, (_, i) => {
        const x = -62 + (i / 24) * 124;
        return new THREE.Vector3(
          x,
          h + 21 + (crown - 21) * Math.cos(((x / 62) * Math.PI) / 2),
          z + offset + Math.sin(x * 0.04 + index) * 4,
        );
      });
      const curve = new THREE.CatmullRomCurve3(points);
      ribs.push(new THREE.TubeGeometry(curve, 48, 1.5, 6, false));
      const edge = new THREE.TubeGeometry(curve, 48, 0.16, 3, false);
      edge.translate(0, -1.4, 0);
      edges.push(edge);
    }
    // Cross ties give the paired spars depth without sealing the sky.
    for (const x of [-44, -25, 0, 25, 44]) {
      const y = h + 21 + (crown - 21) * Math.cos(((x / 62) * Math.PI) / 2);
      const tie = new THREE.CylinderGeometry(0.5, 0.5, 7, 6);
      tie.rotateX(Math.PI / 2);
      tie.translate(x, y, z + Math.sin(x * 0.04 + index) * 4);
      ribs.push(tie);
    }
    if (!GAME_CONFIG.world.wellStops.some((stop) => stop === z)) return;
    // Suspended signal reservoirs, with a luminous lens nested into an opaque shell.
    const cy = h + 40;
    const profile = [
      [0, 5],
      [2, 4.8],
      [5.6, 2.1],
      [7, 0],
      [6.8, -0.8],
      [4.2, -2],
      [0, -2.2],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const shell = new THREE.LatheGeometry(profile, 24);
    shell.translate(0, cy, z);
    bells.push(shell);
    for (const side of [-1, 1]) {
      const length = crown - 42;
      const cable = new THREE.CylinderGeometry(0.18, 0.18, length, 5);
      cable.translate(side * 3.6, cy + 2 + length / 2, z);
      ribs.push(cable);
    }
    const lens = new THREE.SphereGeometry(4.5, 20, 10);
    lens.scale(1, 0.32, 1);
    lens.translate(0, cy - 1.8, z);
    lenses.push(lens);
    const rim = new THREE.TorusGeometry(6.4, 0.22, 6, 24);
    rim.rotateX(Math.PI / 2);
    rim.translate(0, cy - 0.8, z);
    edges.push(rim);
    const halo = new THREE.PlaneGeometry(32, 25);
    halo.translate(0, cy - 2, z + 2);
    glow.push(halo);
    for (const angle of [-0.45, 0.45]) {
      const beam = new THREE.PlaneGeometry(18, 58);
      beam.rotateY(angle);
      beam.translate(0, cy - 29, z);
      beams.push(beam);
    }
  });
  const merge = (parts: THREE.BufferGeometry[]) => {
    const result = mergeGeometries(parts);
    parts.forEach((part) => part.dispose());
    if (!result) throw new Error("Vault assembly failed");
    return result;
  };
  return {
    ribs: merge(ribs),
    edges: merge(edges),
    bells: merge(bells),
    lenses: merge(lenses),
    glow: merge(glow),
    beams: merge(beams),
  };
}

export function SkyVault() {
  const stage = stageAt(useGameStore((state) => state.stageIndex));
  const reduced = useSettingsStore((state) => state.reducedMotion);
  const geometry = useMemo(() => buildVault(stage), [stage]);
  const texture = useMemo(() => makeSoftLightTexture(), []);
  const lensMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const hot = useMemo(
    () => new THREE.Color(stage.accent).multiplyScalar(3.2),
    [stage],
  );
  useEffect(
    () => () => Object.values(geometry).forEach((part) => part.dispose()),
    [geometry],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }) => {
    if (lensMaterial.current)
      lensMaterial.current.color
        .copy(hot)
        .multiplyScalar(
          reduced ? 1 : 0.96 + Math.sin(clock.elapsedTime * 0.7) * 0.04,
        );
  });
  return (
    <>
      <mesh geometry={geometry.ribs}>
        <meshStandardMaterial
          color={stage.relief[1]}
          roughness={0.39}
          metalness={0.42}
        />
      </mesh>
      <mesh geometry={geometry.edges}>
        <meshBasicMaterial color={stage.accentSoft} toneMapped={false} />
      </mesh>
      <mesh geometry={geometry.bells}>
        <meshStandardMaterial
          color="#a39379"
          roughness={0.28}
          metalness={0.68}
        />
      </mesh>
      <mesh geometry={geometry.lenses}>
        <meshBasicMaterial ref={lensMaterial} color={hot} toneMapped={false} />
      </mesh>
      <mesh geometry={geometry.glow}>
        <meshBasicMaterial
          color={stage.accent}
          map={texture}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geometry.beams}>
        <meshBasicMaterial
          color={stage.accent}
          map={texture}
          transparent
          opacity={0.17}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

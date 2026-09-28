"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { channelHeight } from "@/components/game/NetworkStage";
import { GAME_CONFIG } from "@/game/config";
import { stageAt, type StageDefinition } from "@/game/stages";
import { signalState } from "@/rendering/signalState";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

const VAULT_STOPS = [-42, -120, -202, -286, -370, -456, -544, -626];
type Point = readonly [number, number, number];

function makeVault(stage: StageDefinition) {
  const bodyPositions: number[] = [];
  const bodyColors: number[] = [];
  const bodyIndices: number[] = [];
  const lightPositions: number[] = [];
  const lightColors: number[] = [];
  const lightIndices: number[] = [];
  const glowPlanes: THREE.BufferGeometry[] = [];
  const shaftPlanes: THREE.BufferGeometry[] = [];
  const shell = new THREE.Color(stage.channel[2]);
  const shoulder = new THREE.Color(stage.relief[0]);
  const bounce = new THREE.Color(stage.accentSoft).multiplyScalar(0.38);
  const luminous = new THREE.Color(stage.accentSoft).multiplyScalar(1.2);
  const dim = new THREE.Color(stage.accent).multiplyScalar(0.22);

  const quad = (
    positions: number[],
    colors: number[],
    indices: number[],
    points: [Point, Point, Point, Point],
    tints: [THREE.Color, THREE.Color, THREE.Color, THREE.Color],
  ) => {
    const start = positions.length / 3;
    points.forEach((point, index) => {
      positions.push(...point);
      const color = tints[index];
      colors.push(color.r, color.g, color.b);
    });
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  };

  VAULT_STOPS.forEach((z, index) => {
    const h = channelHeight(z);
    const crown =
      (stage.motif === "prisms" ? 77 : stage.motif === "halos" ? 66 : 72) +
      [-3, 2, 5, 0][index % 4];
    const twist =
      stage.motif === "prisms"
        ? index % 2
          ? -7
          : 7
        : Math.sin(index * 1.6) * (stage.motif === "sails" ? 5 : 3);
    for (const side of [-1, 1]) {
      const outerFront: Point = [side * 64, h + 28, z + 13];
      const outerBack: Point = [side * 61, h + 31, z - 16];
      const shoulderFront: Point = [side * 39, h + 55, z + 10 + twist];
      const shoulderBack: Point = [side * 40, h + 51, z - 12 + twist];
      const innerFront: Point = [side * 11, h + crown, z + 7];
      const innerBack: Point = [side * 10, h + crown - 3, z - 10];
      quad(
        bodyPositions,
        bodyColors,
        bodyIndices,
        [outerFront, shoulderFront, shoulderBack, outerBack],
        [shell, shoulder, shoulder, shell],
      );
      quad(
        bodyPositions,
        bodyColors,
        bodyIndices,
        [shoulderFront, innerFront, innerBack, shoulderBack],
        [shoulder, bounce, bounce, shoulder],
      );
      // A narrow light leak follows the cut edge of each suspended panel.
      const seam = 0.48;
      quad(
        lightPositions,
        lightColors,
        lightIndices,
        [
          innerFront,
          [side * (11 + seam), h + crown - seam, z + 7],
          [side * (10 + seam), h + crown - 3 - seam, z - 10],
          innerBack,
        ],
        [luminous, dim, dim, luminous],
      );
      quad(
        lightPositions,
        lightColors,
        lightIndices,
        [
          [side * 32, h + 58, z + 3 + twist],
          [side * 22, h + crown - 7, z + 4],
          [side * 22, h + crown - 7, z - 2],
          [side * 32, h + 58, z - 3 + twist],
        ],
        [dim, luminous, luminous, dim],
      );
    }
    // A diamond aperture remains open to the sky between the two wings.
    // Beveled edges give the aperture a clear silhouette from the chase camera.
    const y = h + crown - 1;
    const frame: Point[] = [
      [-10, y, z + 10],
      [0, y + 2, z + 18],
      [10, y, z + 10],
      [10, y - 2, z - 13],
      [0, y, z - 20],
      [-10, y - 2, z - 13],
    ];
    for (let i = 0; i < frame.length; i++) {
      const a = frame[i];
      const b = frame[(i + 1) % frame.length];
      quad(
        lightPositions,
        lightColors,
        lightIndices,
        [
          a,
          b,
          [b[0] * 0.76, b[1] - 0.55, b[2] * 0.76 + z * 0.24],
          [a[0] * 0.76, a[1] - 0.55, a[2] * 0.76 + z * 0.24],
        ],
        [luminous, luminous, dim, dim],
      );
    }
    const glow = new THREE.PlaneGeometry(27, 19);
    glow.translate(0, h + crown - 4, z - 3);
    glowPlanes.push(glow);
    if (GAME_CONFIG.world.wellStops.some((stop) => stop === z)) {
      for (const angle of [-0.52, 0.52]) {
        const shaft = new THREE.PlaneGeometry(24, 90);
        shaft.rotateY(angle);
        shaft.translate(0, h + 24, z - 3);
        shaftPlanes.push(shaft);
      }
    }
  });

  const geometry = (
    positions: number[],
    colors: number[],
    indices: number[],
    normals: boolean,
  ) => {
    const result = new THREE.BufferGeometry();
    result.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    result.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    result.setIndex(indices);
    if (normals) result.computeVertexNormals();
    return result;
  };
  const glow = mergeGeometries(glowPlanes);
  const shafts = mergeGeometries(shaftPlanes);
  glowPlanes.forEach((plane) => plane.dispose());
  shaftPlanes.forEach((plane) => plane.dispose());
  if (!glow || !shafts)
    throw new Error("Vault apertures could not be generated");
  return {
    body: geometry(bodyPositions, bodyColors, bodyIndices, true),
    light: geometry(lightPositions, lightColors, lightIndices, false),
    glow,
    shafts,
  };
}

function makeGlowTexture() {
  const size = 48;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - size / 2) / (size / 2);
      const v = (y + 0.5 - size / 2) / (size / 2);
      const falloff = Math.max(0, 1 - u * u - v * v);
      const index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
      pixels[index + 3] = Math.round(255 * falloff * falloff * falloff);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function makeShaftTexture() {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - size / 2) / (size / 2);
      const v = (y + 0.5) / size;
      const horizontal = Math.exp(-u * u * 9);
      const vertical = Math.sin(Math.PI * v) ** 1.7;
      const index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
      pixels[index + 3] = Math.round(255 * horizontal * vertical);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

export function SkyVault() {
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const reduced = useSettingsStore((state) => state.reducedMotion);
  const lightMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const vault = useMemo(() => makeVault(stage), [stage]);
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const shaftTexture = useMemo(() => makeShaftTexture(), []);
  useEffect(
    () => () => {
      vault.body.dispose();
      vault.light.dispose();
      vault.glow.dispose();
      vault.shafts.dispose();
    },
    [vault],
  );
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  useEffect(() => () => shaftTexture.dispose(), [shaftTexture]);
  useFrame(({ clock }) => {
    if (!lightMaterial.current) return;
    const pulse = reduced ? 0 : Math.sin(clock.elapsedTime * 1.5) * 0.05;
    lightMaterial.current.opacity =
      0.72 + pulse + signalState.boost.value * 0.16;
  });
  return (
    <>
      <mesh geometry={vault.body} frustumCulled={false}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.67}
          metalness={0.08}
        />
      </mesh>
      <mesh geometry={vault.light} frustumCulled={false}>
        <meshBasicMaterial
          ref={lightMaterial}
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.72}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={vault.glow} frustumCulled={false}>
        <meshBasicMaterial
          color={stage.accent}
          map={glowTexture}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={vault.shafts} frustumCulled={false}>
        <meshBasicMaterial
          color={stage.accent}
          map={shaftTexture}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

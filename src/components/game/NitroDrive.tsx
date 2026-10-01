"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import type { CourierCraft } from "@/game/crafts";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { signalState } from "@/rendering/signalState";
import { presentationState } from "@/game/presentation";

const flameVertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const flameFragment = `uniform vec3 uColor;uniform float uTime;uniform float uPower;varying vec2 vUv;
void main(){
  float along=vUv.y;
  float pulse=.88+.12*sin(along*27.-uTime*36.);
  float side=pow(max(0.,sin(vUv.x*3.14159)),.5);
  float fade=pow(max(0.,1.-along),1.15);
  vec3 hot=mix(uColor,vec3(1.),pow(fade,2.)*.8);
  gl_FragColor=vec4(hot*(1.6+uPower*1.8),fade*pulse*(.55+uPower*.45)*(.65+side*.35));
}`;

/** The jet starts at an actual socket; it does not rely on postprocessing bloom. */
export function NitroDrive({ craft }: { craft: CourierCraft }) {
  const jets = useRef<Array<THREE.Group | null>>([]);
  const shocks = useRef<THREE.InstancedMesh>(null);
  const hotspots = useRef<THREE.InstancedMesh>(null);
  const streaks = useRef<THREE.LineSegments>(null);
  const light = useRef<THREE.PointLight>(null);
  const rig = useRef<THREE.Group>(null);
  const resources = useMemo(() => {
    const profile = [
      new THREE.Vector2(0.23, 0),
      new THREE.Vector2(0.3, 0.17),
      new THREE.Vector2(0.19, 0.6),
      new THREE.Vector2(0.015, 1),
    ];
    const jet = new THREE.LatheGeometry(profile, 10).rotateX(Math.PI / 2);
    const flame = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(craft.exhaust) },
        uTime: { value: 0 },
        uPower: { value: 0 },
      },
      vertexShader: flameVertex,
      fragmentShader: flameFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const core = new THREE.MeshBasicMaterial({
      color: "#fff9df",
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const ring = new THREE.TorusGeometry(0.29, 0.025, 4, 12);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: craft.exhaust,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(GAME_CONFIG.nitro.streakCount * 6),
        3,
      ).setUsage(THREE.DynamicDrawUsage),
    );
    const line = new THREE.LineBasicMaterial({
      color: craft.exhaust,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return {
      jet,
      hotspot: new THREE.SphereGeometry(0.18, 8, 6),
      flame,
      core,
      ring,
      ringMaterial,
      buffer,
      line,
      object: new THREE.Object3D(),
    };
  }, [craft]);
  useEffect(
    () => () => {
      for (const resource of [
        resources.jet,
        resources.hotspot,
        resources.flame,
        resources.core,
        resources.ring,
        resources.ringMaterial,
        resources.buffer,
        resources.line,
      ])
        resource.dispose();
    },
    [resources],
  );
  const resourcesRef = useRef(resources);
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);
  useFrame(() => {
    const live = resourcesRef.current;
    const phase = useGameStore.getState().phase;
    const preview = ["ident", "title", "menu", "countdown"].includes(phase);
    const active = preview || phase === "playing" || phase === "paused";
    if (rig.current) rig.current.visible = active;
    if (!active) return;
    const reduced = useSettingsStore.getState().reducedMotion;
    const power = signalState.boost.value;
    const time = preview ? presentationState.time : signalState.flightTime;
    const idlePreview = phase === "menu";
    const length =
      THREE.MathUtils.lerp(
        GAME_CONFIG.nitro.idleJetLength,
        GAME_CONFIG.nitro.boostJetLength,
        power,
      ) * (idlePreview ? 0.5 : 1);
    live.flame.uniforms.uTime.value = reduced ? 0 : time;
    live.flame.uniforms.uPower.value = power;
    live.core.opacity = (0.6 + power * 0.35) * (idlePreview ? 0.4 : 1);
    for (let i = 0; i < craft.engines.length; i++) {
      const group = jets.current[i];
      if (group)
        group.scale.set(
          1 + power * 0.32,
          1 + power * 0.32,
          length * (reduced ? 1 : 1 + Math.sin(time * 38 + i) * 0.035),
        );
    }
    live.ringMaterial.opacity = power * 0.58;
    const object = live.object,
      count = GAME_CONFIG.nitro.shockRingsPerEngine;
    craft.engines.forEach(([x, y, z], engine) => {
      object.position.set(x, y, z + 0.16);
      object.scale.setScalar(0.85 + power * 0.6);
      object.rotation.set(0, 0, 0);
      object.updateMatrix();
      hotspots.current?.setMatrixAt(engine, object.matrix);
      for (let i = 0; i < count; i++) {
        const u = (i + 0.65) / count;
        object.position.set(x, y, z + length * u);
        const taper =
          (1 - u) *
          (0.75 + power * 0.35) *
          (reduced ? 1 : 1 + Math.sin(time * 16 - i) * 0.07);
        object.scale.set(taper, taper, 1);
        object.rotation.set(0, 0, Math.PI / 4);
        object.updateMatrix();
        shocks.current?.setMatrixAt(engine * count + i, object.matrix);
      }
    });
    if (hotspots.current) hotspots.current.instanceMatrix.needsUpdate = true;
    if (shocks.current) {
      shocks.current.visible = power > 0.03;
      shocks.current.instanceMatrix.needsUpdate = true;
    }
    if (light.current)
      light.current.intensity =
        THREE.MathUtils.lerp(
          GAME_CONFIG.nitro.idleLight,
          GAME_CONFIG.nitro.boostLight,
          power,
        ) * (idlePreview ? 0.35 : 1);
    const positions = live.buffer.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const low = useSettingsStore.getState().runtimeQuality === "low";
    const streakCount = low ? 12 : GAME_CONFIG.nitro.streakCount;
    live.buffer.setDrawRange(0, streakCount * 2);
    live.line.opacity =
      reduced || preview || !useSettingsStore.getState().screenEffects
        ? 0
        : power * 0.4;
    if (streaks.current) streaks.current.visible = live.line.opacity > 0.02;
    for (let i = 0; i < streakCount; i++) {
      const angle = i * 2.39996;
      const radius = 4.5 + (i % 4) * 0.8;
      const x = Math.cos(angle) * radius,
        y = Math.sin(angle) * radius + 2.5;
      const z =
        -34 +
        ((time * (24 + power * 22) + i * 7.91) %
          GAME_CONFIG.nitro.streakTravel);
      positions.setXYZ(i * 2, x, y, z);
      positions.setXYZ(
        i * 2 + 1,
        x,
        y,
        z + GAME_CONFIG.nitro.streakLength * (0.4 + power),
      );
    }
    positions.needsUpdate = true;
  });
  return (
    <group ref={rig} name="nitro-drive" dispose={null}>
      {craft.engines.map((socket, i) => (
        <group
          key={i}
          position={[socket[0], socket[1], socket[2] + 0.09]}
          ref={(g) => {
            jets.current[i] = g;
          }}
        >
          <mesh geometry={resources.jet} material={resources.flame} />
          <mesh
            geometry={resources.jet}
            material={resources.core}
            scale={[0.38, 0.38, 0.58]}
          />
        </group>
      ))}
      <instancedMesh
        ref={hotspots}
        args={[resources.hotspot, resources.core, craft.engines.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={shocks}
        args={[
          resources.ring,
          resources.ringMaterial,
          craft.engines.length * GAME_CONFIG.nitro.shockRingsPerEngine,
        ]}
        frustumCulled={false}
      />
      <lineSegments
        ref={streaks}
        geometry={resources.buffer}
        material={resources.line}
        frustumCulled={false}
      />
      <pointLight
        ref={light}
        position={[0, -0.2, 2.5]}
        color={craft.exhaust}
        intensity={GAME_CONFIG.nitro.idleLight}
        distance={22}
        decay={2}
      />
    </group>
  );
}

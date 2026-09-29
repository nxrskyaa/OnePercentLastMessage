"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { HARBOR, harborHorizon } from "@/game/harbor";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { signalState } from "@/rendering/signalState";

const vertexShader = /* glsl */ `
  uniform mat4 textureMatrix;
  varying vec4 vReflection;
  varying vec3 vWorld;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vReflection = textureMatrix * vec4(position, 1.0);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;

const fragmentShader = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec3 color;
  uniform float uTime;
  uniform float uReflect;
  uniform vec3 uPlayer;
  uniform vec3 uScan;
  uniform float uScanRadius;
  uniform float uScanStrength;
  uniform vec3 uAccent;
  uniform vec3 uHorizon;
  varying vec4 vReflection;
  varying vec3 vWorld;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    vec2 p = vWorld.xz;
    float wave = sin(p.x*.34 + p.y*.17 + uTime*.65) * sin(p.y*.27-uTime*.48);
    vec2 ripple = vec2(wave, sin(p.y*.41+uTime*.6)) * .00075;
    vec2 uv = vReflection.xy / vReflection.w + ripple;
    uv = clamp(uv, .004, .996);
    // A small cross filter removes pixel stair-steps from bright reflected fixtures.
    vec2 texel = vec2(.00195, 0.0);
    vec3 reflected = texture2D(tDiffuse, uv).rgb * .4;
    reflected += texture2D(tDiffuse, uv+texel.xy).rgb * .15;
    reflected += texture2D(tDiffuse, uv-texel.xy).rgb * .15;
    reflected += texture2D(tDiffuse, uv+texel.yx).rgb * .15;
    reflected += texture2D(tDiffuse, uv-texel.yx).rgb * .15;
    float fresnel = pow(1.0-clamp(normalize(cameraPosition-vWorld).y,0.0,1.0),2.0);
    vec3 surface = color * (.78 + wave*.055);
    surface = mix(surface, reflected * vec3(.78,.91,.94), uReflect * (.3+fresnel*.52));
    float crest = pow(max(0.0, wave), 18.0);
    surface += uAccent * crest * .035;
    float wakeZ = p.y-uPlayer.z;
    float wakeX = abs(p.x-uPlayer.x);
    float wake = exp(-pow((wakeX-wakeZ*.36)/.48,2.0)) * smoothstep(0.0,8.0,wakeZ) * (1.0-smoothstep(8.0,43.0,wakeZ));
    surface += uAccent * wake * .25;
    float scanDistance = length(p-uScan.xz);
    float scan = exp(-pow((scanDistance-uScanRadius)/1.3,2.0)) * uScanStrength;
    surface += uAccent*scan*.65;
    surface = mix(surface,uHorizon,smoothstep(300.,1050.,distance(cameraPosition,vWorld)));
    gl_FragColor = vec4(surface,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;

export function SignalWater({
  playerRef,
}: {
  playerRef: RefObject<THREE.Group | null>;
}) {
  const stage = stageAt(useGameStore((s) => s.stageIndex));
  const reflective = useSettingsStore(
    (s) => s.runtimeQuality !== "low" && s.screenEffects,
  );
  const reduced = useSettingsStore((s) => s.reducedMotion);
  const time = useRef(0);
  const waterRef = useRef<Reflector>(null);
  const waterColor = stage.current[0];
  const accent = stage.accent;
  const horizon = harborHorizon(stage);
  const water = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10000, 10000);
    const reflector = new Reflector(geometry, {
      color: new THREE.Color(waterColor),
      textureWidth: HARBOR.reflectionSize,
      textureHeight: HARBOR.reflectionSize,
      multisample: 0,
      clipBias: 0.003,
      shader: {
        name: "SignalEstuary",
        uniforms: {
          color: { value: new THREE.Color(waterColor) },
          tDiffuse: { value: null },
          textureMatrix: { value: new THREE.Matrix4() },
          uTime: { value: 0 },
          uReflect: { value: reflective ? 1 : 0 },
          uPlayer: { value: new THREE.Vector3() },
          uScan: { value: new THREE.Vector3() },
          uScanRadius: { value: -1000 },
          uScanStrength: { value: 0 },
          uAccent: { value: new THREE.Color(accent) },
          uHorizon: { value: new THREE.Color(horizon) },
        },
        vertexShader,
        fragmentShader,
      },
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(0, HARBOR.waterY, -320);
    const material = reflector.material as THREE.ShaderMaterial;
    material.fog = true;
    Object.assign(
      material.uniforms,
      THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    );
    const renderReflection = reflector.onBeforeRender.bind(reflector);
    const reflectionSource = new THREE.PerspectiveCamera();
    let frame = 0;
    reflector.onBeforeRender = (renderer, scene, camera, ...rest) => {
      // A half-rate small reflection target keeps the main scene sharp at native DPR.
      if (reflective && frame++ % HARBOR.reflectionInterval === 0) {
        reflectionSource.copy(camera as THREE.PerspectiveCamera, false);
        // Reflect the harbor, not every gameplay effect and tracker draw call.
        reflectionSource.layers.set(1);
        renderReflection(renderer, scene, reflectionSource, ...rest);
      }
    };
    return reflector;
  }, [waterColor, accent, horizon, reflective]);
  useEffect(
    () => () => {
      water.geometry.dispose();
      water.dispose();
    },
    [water],
  );
  useFrame((_, delta) => {
    if (useGameStore.getState().phase === "playing" && !reduced)
      time.current += Math.min(delta, 0.05);
    if (!waterRef.current) return;
    const u = (waterRef.current.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value = time.current;
    if (playerRef.current) u.uPlayer.value.copy(playerRef.current.position);
    u.uScan.value.copy(signalState.scanOrigin.value);
    u.uScanRadius.value = signalState.scanRadius.value;
    u.uScanStrength.value = signalState.scanStrength.value;
  });
  return <primitive ref={waterRef} object={water} />;
}

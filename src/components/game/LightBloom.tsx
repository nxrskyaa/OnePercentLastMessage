"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GAME_CONFIG } from "@/game/config";
import { useSettingsStore } from "@/store/settingsStore";
import { renderMetrics } from "@/rendering/metrics";

export function LightBloom() {
  const { gl, scene, camera } = useThree();
  const enabled = useSettingsStore(
    (state) => state.runtimeQuality !== "low" && state.screenEffects,
  );
  const pipeline = useRef<{
    composer: EffectComposer;
    bloom: UnrealBloomPass;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (!enabled || !gl.extensions.has("EXT_color_buffer_float")) return;
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: 2,
    });
    const composer = new EffectComposer(gl, target);
    composer.setPixelRatio(1);
    const render = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(256, 144),
      GAME_CONFIG.world.bloomStrength,
      GAME_CONFIG.world.bloomRadius,
      GAME_CONFIG.world.bloomThreshold,
    );
    const output = new OutputPass();
    composer.addPass(render);
    composer.addPass(bloom);
    composer.addPass(output);
    pipeline.current = { composer, bloom, width: 0, height: 0 };
    return () => {
      pipeline.current = null;
      composer.dispose();
      render.dispose();
      bloom.dispose();
      output.dispose();
    };
  }, [gl, scene, camera, enabled]);
  useFrame((state, delta) => {
    const renderStart = performance.now();
    gl.info.reset();
    const current = pipeline.current;
    if (!current) {
      gl.render(scene, camera);
      renderMetrics.renderCpuMs = performance.now() - renderStart;
      return;
    }
    const width = Math.round(state.size.width * gl.getPixelRatio());
    const height = Math.round(state.size.height * gl.getPixelRatio());
    if (current.width !== width || current.height !== height) {
      current.composer.setSize(width, height);
      const scale = Math.min(0.5, GAME_CONFIG.world.bloomMaxHeight / height);
      current.bloom.setSize(
        Math.max(1, Math.round(width * scale)),
        Math.max(1, Math.round(height * scale)),
      );
      current.width = width;
      current.height = height;
    }
    current.composer.render(delta);
    renderMetrics.renderCpuMs = performance.now() - renderStart;
  }, 1);
  return null;
}

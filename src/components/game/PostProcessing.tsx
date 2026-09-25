"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { pass } from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { RenderPipeline, WebGPURenderer } from "three/webgpu";
import { useSettingsStore } from "@/store/settingsStore";
import { renderMetrics } from "@/rendering/metrics";

export function PostProcessing() {
  const { gl, scene, camera } = useThree();
  const bloomEnabled = useSettingsStore((state) => state.bloom);
  const screenEffects = useSettingsStore((state) => state.screenEffects);
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const pipelineRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  const bloomActive = useRef(false);
  const enabled = bloomEnabled && screenEffects && quality !== "low";

  useEffect(() => {
    if (!enabled) {
      bloomActive.current = false;
      return;
    }
    const pipeline = createPipeline(
      gl as unknown as WebGPURenderer,
      scene,
      camera,
    );
    pipelineRef.current = pipeline;
    bloomActive.current = true;
    return () => {
      bloomActive.current = false;
      pipelineRef.current = null;
      pipeline.glow.dispose();
      pipeline.renderPipeline.dispose();
    };
  }, [gl, scene, camera, enabled]);

  useEffect(() => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;
    pipeline.glow.strength.value = quality === "high" ? 0.24 : 0.15;
  }, [quality]);

  useFrame(() => {
    if (bloomActive.current && pipelineRef.current)
      pipelineRef.current.renderPipeline.render();
    else (gl as unknown as WebGPURenderer).render(scene, camera);
    const info = (gl as unknown as WebGPURenderer).info.render;
    renderMetrics.drawCalls = info.drawCalls;
    renderMetrics.triangles = info.triangles;
  }, 1);
  return null;
}

function createPipeline(
  gl: WebGPURenderer,
  scene: Parameters<typeof pass>[0],
  camera: Parameters<typeof pass>[1],
) {
  const renderPipeline = new RenderPipeline(gl);
  const scenePass = pass(scene, camera);
  const sceneColor = scenePass.getTextureNode("output");
  const glow = bloom(sceneColor, 0.22, 0.25, 1.15);
  glow.setResolutionScale(0.5);
  renderPipeline.outputNode = sceneColor.add(glow);
  return { renderPipeline, sceneColor, glow };
}

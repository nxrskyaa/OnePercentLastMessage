"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { pass } from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { RenderPipeline, WebGPURenderer } from "three/webgpu";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Vector2 } from "three";
import { useSettingsStore } from "@/store/settingsStore";
import { renderMetrics } from "@/rendering/metrics";

export function PostProcessing() {
  const { gl } = useThree();
  const bloomEnabled = useSettingsStore((state) => state.bloom);
  const screenEffects = useSettingsStore((state) => state.screenEffects);
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const enabled = bloomEnabled && screenEffects && quality !== "low";
  if (!enabled) return <DirectMetrics />;
  return gl instanceof WebGPURenderer ? (
    <BloomRenderer quality={quality} />
  ) : (
    <WebGlBloomRenderer quality={quality} />
  );
}

function DirectMetrics() {
  const { gl } = useThree();
  useFrame(() => {
    if (gl instanceof WebGPURenderer) {
      renderMetrics.drawCalls = gl.info.render.drawCalls;
      renderMetrics.triangles = gl.info.render.triangles;
    } else {
      renderMetrics.drawCalls = gl.info.render.calls;
      renderMetrics.triangles = gl.info.render.triangles;
    }
  });
  return null;
}

function BloomRenderer({ quality }: { quality: "low" | "medium" | "high" }) {
  const { gl, scene, camera } = useThree();
  const pipelineRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  useEffect(() => {
    const pipeline = createPipeline(
      gl as unknown as WebGPURenderer,
      scene,
      camera,
    );
    pipeline.glow.strength.value = quality === "high" ? 0.24 : 0.15;
    pipelineRef.current = pipeline;
    return () => {
      pipelineRef.current = null;
      pipeline.glow.dispose();
      pipeline.renderPipeline.dispose();
    };
  }, [gl, scene, camera, quality]);
  useFrame(() => {
    pipelineRef.current?.renderPipeline.render();
    const info = (gl as unknown as WebGPURenderer).info.render;
    renderMetrics.drawCalls = info.drawCalls;
    renderMetrics.triangles = info.triangles;
  }, 1);
  return null;
}

function WebGlBloomRenderer({
  quality,
}: {
  quality: "low" | "medium" | "high";
}) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new Vector2(size.width, size.height),
        quality === "high" ? 0.3 : 0.17,
        0.4,
        0.86,
      ),
    );
    composer.addPass(new OutputPass());
    composerRef.current = composer;
    return () => {
      composerRef.current = null;
      composer.dispose();
    };
  }, [gl, scene, camera, size.width, size.height, quality]);
  useFrame((_, delta) => {
    composerRef.current?.render(delta);
    renderMetrics.drawCalls = gl.info.render.calls;
    renderMetrics.triangles = gl.info.render.triangles;
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
  return { renderPipeline, glow };
}

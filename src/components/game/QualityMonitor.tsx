"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { WebGPURenderer } from "three/webgpu";
import { renderMetrics } from "@/rendering/metrics";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function QualityMonitor() {
  const seconds = useRef(0);
  const frames = useRef(0);
  const scale = useRef(1);
  const fastWindows = useRef(0);
  const { setDpr } = useThree();
  useFrame(({ gl }, delta) => {
    if (document.hidden) return;
    seconds.current += Math.min(delta, 0.25);
    frames.current += 1;
    if (seconds.current < 4) return;
    const fps = frames.current / seconds.current;
    const settings = useSettingsStore.getState();
    const renderer = gl as unknown as WebGPURenderer;
    renderMetrics.fps = fps;
    renderMetrics.frameMs = 1000 / Math.max(1, fps);
    renderMetrics.backend =
      "isWebGPUBackend" in renderer.backend ? "webgpu" : "webgl2";
    renderMetrics.quality = settings.runtimeQuality;
    renderMetrics.trafficPackets =
      settings.runtimeQuality === "low"
        ? 600
        : settings.runtimeQuality === "medium"
          ? 1600
          : 3600;
    if (
      settings.quality === "auto" &&
      useGameStore.getState().phase === "playing"
    ) {
      if (fps < 55) scale.current = Math.max(0.7, scale.current - 0.1);
      else if (fps > 60) scale.current = Math.min(1, scale.current + 0.05);
      fastWindows.current =
        fps > 62 && scale.current >= 1 ? fastWindows.current + 1 : 0;
      if (
        fps < 42 &&
        scale.current <= 0.7 &&
        settings.runtimeQuality === "high"
      )
        settings.setRuntimeQuality("medium");
      else if (
        fps < 38 &&
        scale.current <= 0.7 &&
        settings.runtimeQuality === "medium"
      )
        settings.setRuntimeQuality("low");
      else if (fastWindows.current >= 3 && settings.runtimeQuality !== "high") {
        settings.setRuntimeQuality(
          settings.runtimeQuality === "low" ? "medium" : "high",
        );
        fastWindows.current = 0;
      }
      const base =
        settings.runtimeQuality === "low"
          ? 1
          : settings.runtimeQuality === "medium"
            ? 1.3
            : 1.6;
      setDpr(base * scale.current);
    } else if (settings.quality !== "auto") {
      scale.current = 1;
      setDpr(
        settings.runtimeQuality === "low"
          ? 1
          : settings.runtimeQuality === "medium"
            ? 1.3
            : 1.6,
      );
    }
    renderMetrics.renderScale = scale.current;
    seconds.current = 0;
    frames.current = 0;
  });
  return null;
}

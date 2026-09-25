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
  const lastDpr = useRef(0);
  const slowWindows = useRef(0);
  const { setDpr } = useThree();
  useFrame(({ gl }, delta) => {
    if (document.hidden) return;
    seconds.current += Math.min(delta, 0.5);
    frames.current += 1;
    if (seconds.current < 1.5) return;
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
        ? 220
        : settings.runtimeQuality === "medium"
          ? 520
          : 1050;
    const playing = useGameStore.getState().phase === "playing";
    if (fps < 50) scale.current = Math.max(0.55, scale.current - 0.2);
    else if (fps > 68 && !playing)
      scale.current = Math.min(1, scale.current + 0.05);
    if (settings.quality === "auto" && playing) {
      if (
        fps < 48 &&
        scale.current <= 0.8 &&
        settings.runtimeQuality === "high"
      )
        settings.setRuntimeQuality("medium");
      else if (
        fps < 45 &&
        scale.current <= 0.8 &&
        settings.runtimeQuality === "medium"
      )
        settings.setRuntimeQuality("low");
    } else if (settings.quality !== "auto" && playing) {
      slowWindows.current = fps < 45 ? slowWindows.current + 1 : 0;
      if (slowWindows.current >= 2 && settings.quality !== "low") {
        settings.update({ quality: "low" });
        slowWindows.current = 0;
      }
    } else slowWindows.current = 0;
    const base =
      settings.runtimeQuality === "low"
        ? 0.8
        : settings.runtimeQuality === "medium"
          ? 1
          : 1.25;
    const nextDpr = base * scale.current;
    if (Math.abs(nextDpr - lastDpr.current) > 0.025) {
      setDpr(nextDpr);
      lastDpr.current = nextDpr;
    }
    renderMetrics.renderScale = scale.current;
    seconds.current = 0;
    frames.current = 0;
  });
  return null;
}

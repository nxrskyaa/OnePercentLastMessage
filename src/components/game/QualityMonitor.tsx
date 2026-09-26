"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { renderMetrics } from "@/rendering/metrics";
import { budgetedDpr } from "@/rendering/resolution";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function QualityMonitor() {
  const seconds = useRef(0);
  const frames = useRef(0);
  const scale = useRef(1);
  const lastDpr = useRef(0);
  const slowWindows = useRef(0);
  const fastWindows = useRef(0);
  const activeSeconds = useRef(0);
  const { setDpr } = useThree();
  useFrame(({ gl, size }, delta) => {
    if (document.hidden || !document.hasFocus()) {
      seconds.current = 0;
      frames.current = 0;
      activeSeconds.current = 0;
      return;
    }
    if (useGameStore.getState().phase !== "playing") {
      seconds.current = 0;
      frames.current = 0;
      activeSeconds.current = 0;
      return;
    }
    activeSeconds.current += Math.min(delta, 0.5);
    seconds.current += Math.min(delta, 0.5);
    frames.current += 1;
    if (seconds.current < 1.5) return;
    const fps = frames.current / seconds.current;
    const settings = useSettingsStore.getState();
    renderMetrics.fps = fps;
    renderMetrics.frameMs = 1000 / Math.max(1, fps);
    renderMetrics.backend = "webgl2";
    renderMetrics.quality = settings.runtimeQuality;
    renderMetrics.drawCalls = gl.info.render.calls;
    renderMetrics.triangles = gl.info.render.triangles;
    // Shader compilation and first-run asset upload are not sustained load.
    const warmedUp = activeSeconds.current > 4;
    slowWindows.current = warmedUp && fps < 45 ? slowWindows.current + 1 : 0;
    fastWindows.current = warmedUp && fps > 62 ? fastWindows.current + 1 : 0;
    if (slowWindows.current >= 2) {
      scale.current = Math.max(0.55, scale.current - 0.12);
      slowWindows.current = 0;
    } else if (fastWindows.current >= 2) {
      scale.current = Math.min(1, scale.current + 0.08);
      fastWindows.current = 0;
    }
    if (settings.quality === "auto" && warmedUp) {
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
    } else if (settings.quality !== "auto" && warmedUp) {
      if (fps < 35 && scale.current <= 0.6 && settings.quality !== "low") {
        settings.update({ quality: "low" });
      }
    }
    const nextDpr = budgetedDpr(
      size.width,
      size.height,
      settings.runtimeQuality,
      scale.current,
    );
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

"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function QualityMonitor() {
  const seconds = useRef(0);
  const frames = useRef(0);
  useFrame((_, delta) => {
    if (
      useGameStore.getState().phase !== "playing" ||
      useSettingsStore.getState().quality !== "auto"
    ) {
      seconds.current = 0;
      frames.current = 0;
      return;
    }
    seconds.current += Math.min(delta, 0.25);
    frames.current += 1;
    if (seconds.current < 6) return;
    const fps = frames.current / seconds.current;
    const settings = useSettingsStore.getState();
    if (fps < 42 && settings.runtimeQuality === "high")
      settings.setRuntimeQuality("medium");
    else if (fps < 34 && settings.runtimeQuality === "medium")
      settings.setRuntimeQuality("low");
    seconds.current = 0;
    frames.current = 0;
  });
  return null;
}

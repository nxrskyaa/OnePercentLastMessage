"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PRESENTATION, presentationState } from "@/game/presentation";
import { useGameStore, type GamePhase } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

/** Capped presentation frames; no second renderer or per-frame React updates. */
export function PresentationDirector({ onReady }: { onReady?: () => void }) {
  const phase = useGameStore((s) => s.phase);
  const panel = useGameStore((s) => s.panel);
  const reduced = useSettingsStore((s) => s.reducedMotion);
  const invalidate = useThree((s) => s.invalidate);
  const clock = useRef({
    phase: "loading" as GamePhase,
    start: 0,
    phaseStart: 0,
  });
  const ready = useRef(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(readyTimer.current), []);
  useEffect(() => {
    const animated = [
      "ident",
      "title",
      "menu",
      "briefing",
      "countdown",
    ].includes(phase);
    if (!animated || panel !== "none" || reduced) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && document.hasFocus()) invalidate();
    }, 1000 / PRESENTATION.menuFps);
    return () => window.clearInterval(timer);
  }, [phase, panel, reduced, invalidate]);

  useFrame((_, delta) => {
    if (!ready.current) {
      ready.current = true;
      // Run after the first complete render, including synchronous shader warmup.
      readyTimer.current = setTimeout(() => onReady?.(), 0);
    }
    const now = performance.now();
    const previous = clock.current.phase;
    if (phase !== previous) {
      if (phase === "ident") clock.current.start = now;
      clock.current.phaseStart = now;
      clock.current.phase = phase;
    }
    presentationState.time += Math.min(delta, 0.1);
    presentationState.phaseTime = (now - clock.current.phaseStart) / 1000;
    if (phase === "ident" || phase === "title")
      presentationState.introTime = reduced
        ? 6
        : (now - clock.current.start) / 1000;
  }, -2);
  return null;
}

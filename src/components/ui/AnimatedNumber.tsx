"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";

/** Bounded result reveal, without rerendering the result dialog each frame. */
export function AnimatedNumber({ value }: { value: number }) {
  const element = useRef<HTMLElement>(null);
  const reduced = useSettingsStore((s) => s.reducedMotion);
  useEffect(() => {
    if (!element.current) return;
    if (reduced) {
      element.current.textContent = value.toLocaleString();
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / 1000);
      if (element.current)
        element.current.textContent = Math.round(
          value * (1 - (1 - t) ** 3),
        ).toLocaleString();
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);
  return (
    <strong ref={element} aria-label={value.toLocaleString()}>
      {value.toLocaleString()}
    </strong>
  );
}

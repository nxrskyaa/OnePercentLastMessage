"use client";

import { useEffect, useState } from "react";
import { renderMetrics, type RenderMetrics } from "@/rendering/metrics";

export function PerformanceHUD() {
  const [metrics, setMetrics] = useState<RenderMetrics | null>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("perf") !== "1") return;
    const interval = window.setInterval(
      () => setMetrics({ ...renderMetrics }),
      500,
    );
    return () => window.clearInterval(interval);
  }, []);
  if (!metrics) return null;
  return (
    <aside className="perf-hud" aria-label="Performance metrics">
      <b>RENDER / {metrics.backend.toUpperCase()}</b>
      <span>
        {metrics.fps.toFixed(0)} FPS · {metrics.frameMs.toFixed(1)} MS
      </span>
      <span>
        {metrics.drawCalls} DRAWS · {metrics.triangles.toLocaleString()} TRI
      </span>
      <span>
        {metrics.trafficPackets.toLocaleString()} PACKETS ·{" "}
        {metrics.quality.toUpperCase()} ·{" "}
        {Math.round(metrics.renderScale * 100)}%
      </span>
    </aside>
  );
}

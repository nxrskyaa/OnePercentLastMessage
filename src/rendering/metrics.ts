export interface RenderMetrics {
  fps: number;
  frameMs: number;
  backend: "webgpu" | "webgl2" | "unknown";
  drawCalls: number;
  triangles: number;
  trafficPackets: number;
  renderScale: number;
  quality: "low" | "medium" | "high";
}

export const renderMetrics: RenderMetrics = {
  fps: 0,
  frameMs: 0,
  backend: "unknown",
  drawCalls: 0,
  triangles: 0,
  trafficPackets: 0,
  renderScale: 1,
  quality: "high",
};

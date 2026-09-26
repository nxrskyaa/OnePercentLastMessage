export interface RenderMetrics {
  fps: number;
  frameMs: number;
  backend: "webgpu" | "webgl2" | "unknown";
  drawCalls: number | null;
  triangles: number | null;
  renderScale: number;
  quality: "low" | "medium" | "high";
}

export const renderMetrics: RenderMetrics = {
  fps: 0,
  frameMs: 0,
  backend: "unknown",
  drawCalls: 0,
  triangles: 0,
  renderScale: 1,
  quality: "high",
};

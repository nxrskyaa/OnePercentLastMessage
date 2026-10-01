/** Shared, mutable input state. Rendering reads it without a React update per frame. */
export const gameInput = {
  pressed: { current: new Set<string>() },
  touchAxis: { current: { x: 0, y: 0 } },
  mouseX: { current: 0 },
  scanQueuedRef: { current: false },
  clear() {
    this.pressed.current.clear();
    this.touchAxis.current.x = 0;
    this.touchAxis.current.y = 0;
    this.mouseX.current = 0;
    this.scanQueuedRef.current = false;
  },
};

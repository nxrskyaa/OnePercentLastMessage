/** Shared, mutable input state. Rendering reads it without a React update per frame. */
export const gameInput = {
  pressed: { current: new Set<string>() },
  mouseX: { current: 0 },
  scanQueuedRef: { current: false },
  clear() {
    this.pressed.current.clear();
    this.mouseX.current = 0;
    this.scanQueuedRef.current = false;
  },
};

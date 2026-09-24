"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export function useKeyboard() {
  const pressed = useRef(new Set<string>());
  const mouseX = useRef(0);
  const scanQueuedRef = useRef(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)
      ) {
        event.preventDefault();
      }
      if (key === "escape" && !event.repeat) {
        const state = useGameStore.getState();
        if (state.panel !== "none") state.closePanel();
        else if (state.phase === "playing") state.pause();
        else if (state.phase === "paused") state.resume();
        else if (state.phase === "briefing" || state.phase === "tutorial")
          state.goMenu();
      }
      if (
        key === " " &&
        !event.repeat &&
        useGameStore.getState().phase === "playing"
      )
        scanQueuedRef.current = true;
      pressed.current.add(key);
    };
    const up = (event: KeyboardEvent) =>
      pressed.current.delete(event.key.toLowerCase());
    const move = (event: PointerEvent) => {
      if (useGameStore.getState().phase === "playing")
        mouseX.current = (event.clientX / window.innerWidth - 0.5) * 2;
      else mouseX.current = 0;
    };
    const clear = () => {
      pressed.current.clear();
      mouseX.current = 0;
      scanQueuedRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return { pressed, mouseX, scanQueuedRef };
}

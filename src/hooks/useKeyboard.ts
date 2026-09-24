"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export function useKeyboard() {
  const pressed = useRef(new Set<string>());

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
        if (state.phase === "playing") state.pause();
        else if (state.phase === "paused") state.resume();
      }
      pressed.current.add(key);
    };
    const up = (event: KeyboardEvent) =>
      pressed.current.delete(event.key.toLowerCase());
    const clear = () => pressed.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return pressed;
}

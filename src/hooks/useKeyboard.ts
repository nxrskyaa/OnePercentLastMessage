"use client";

import { useEffect } from "react";
import { gameInput } from "@/game/input";
import { useGameStore } from "@/store/gameStore";

export function useKeyboard() {
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
        gameInput.scanQueuedRef.current = true;
      gameInput.pressed.current.add(key);
    };
    const up = (event: KeyboardEvent) =>
      gameInput.pressed.current.delete(event.key.toLowerCase());
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (
        event.target instanceof Element &&
        event.target.closest(".mobile-controls")
      )
        return;
      if (useGameStore.getState().phase === "playing")
        gameInput.mouseX.current =
          (event.clientX / window.innerWidth - 0.5) * 2;
      else gameInput.mouseX.current = 0;
    };
    const clear = () => gameInput.clear();
    gameInput.clear();
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

  return gameInput;
}

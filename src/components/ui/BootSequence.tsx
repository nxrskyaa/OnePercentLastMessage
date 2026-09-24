"use client";

import type { GamePhase } from "@/store/gameStore";
import { GameButton } from "@/components/ui/GameButton";

export function BootSequence({
  phase,
  onSkip,
}: {
  phase: GamePhase;
  onSkip: () => void;
}) {
  return (
    <section className="boot-screen" aria-label="Game opening">
      <div className="boot-cross boot-cross--a" />
      <div className="boot-cross boot-cross--b" />
      {phase === "loading" && (
        <div className="boot-center">
          <span className="boot-symbol">◉</span>
          <span className="micro-label">NXR PRESENTS</span>
          <strong>INITIALIZING NETWORK...</strong>
          <span className="boot-line" />
        </div>
      )}
      {phase === "ident" && (
        <div className="boot-center boot-ident" key="ident">
          <span className="micro-label">A GAME BY</span>
          <strong>NXR</strong>
          <span className="boot-line" />
        </div>
      )}
      {phase === "title" && (
        <div className="boot-center boot-title" key="title">
          <strong>
            1<span>%</span>
          </strong>
          <b>LAST MESSAGE</b>
          <p>One battery percent. One message left.</p>
        </div>
      )}
      {phase !== "loading" && (
        <GameButton className="boot-skip" onClick={onSkip}>
          SKIP INTRO ↗
        </GameButton>
      )}
    </section>
  );
}

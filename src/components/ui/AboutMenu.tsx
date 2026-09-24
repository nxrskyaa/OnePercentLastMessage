"use client";

import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/store/gameStore";

export function AboutMenu() {
  const closePanel = useGameStore((state) => state.closePanel);
  const setPhase = useGameStore((state) => state.setPhase);
  return (
    <section
      className="panel-screen about-screen"
      aria-label="About and credits"
    >
      <div className="panel-heading">
        <span className="micro-label">SIGNAL ORIGIN / 03</span>
        <GameButton onClick={closePanel}>CLOSE ✕</GameButton>
      </div>
      <div className="about-mark">
        NXR<span>{"//"}</span>
      </div>
      <h2>
        ABOUT THE <em>SIGNAL</em>
      </h2>
      <p className="panel-lede">
        One battery percent. One message. Find a path through the network before
        the signal dies.
      </p>
      <p>
        1% — Last Message is a short 3D network survival game created for the
        Dlicom AI Game Jam. An independent game jam project.
      </p>
      <div className="creator-line">
        <span className="micro-label">CREATED BY</span>
        <strong>NXR</strong>
        <span>@nxrskyaa</span>
      </div>
      <div className="social-links">
        <a
          href="https://x.com/nxrskyaa"
          target="_blank"
          rel="noopener noreferrer"
        >
          X / @nxrskyaa ↗
        </a>
        <a
          href="https://github.com/nxrskyaa"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB / nxrskyaa ↗
        </a>
      </div>
      <div className="credits-grid">
        <div>
          <span>GAME DESIGN</span>
          <strong>NXR</strong>
        </div>
        <div>
          <span>DEVELOPMENT</span>
          <strong>NXR + Codex</strong>
        </div>
        <div>
          <span>TECHNOLOGY</span>
          <strong>Three.js · R3F · Next.js</strong>
        </div>
        <div>
          <span>BUILT FOR</span>
          <strong>Dlicom AI Game Jam</strong>
        </div>
      </div>
      <GameButton
        onClick={() => {
          closePanel();
          setPhase("ident");
        }}
      >
        REPLAY INTRO ↗
      </GameButton>
    </section>
  );
}

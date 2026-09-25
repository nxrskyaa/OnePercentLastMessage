"use client";

import Image from "next/image";
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
      <div className="dlicom-feature">
        <div className="dlicom-feature-copy">
          <div className="dlicom-feature-heading">
            <Image
              src="/brand/dlicom-mark-reference.jpg"
              alt="Dlicom mark"
              width={68}
              height={68}
              unoptimized
            />
            <div>
              <span className="micro-label">GAME JAM ORIGIN</span>
              <strong>DLICOM</strong>
            </div>
          </div>
          <p>
            Dlicom brings messages, communities, creator tips, and a
            self-custody wallet together. This game turns one last encrypted
            message into a playable race.
          </p>
          <a
            href="https://www.dlicom.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            EXPLORE DLICOM ↗
          </a>
        </div>
        <Image
          className="dlicom-feature-mascot"
          src="/brand/dili-blue-cutout.png"
          alt="Blue Dili mascot in a bubble helmet"
          width={202}
          height={303}
          unoptimized
        />
      </div>
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

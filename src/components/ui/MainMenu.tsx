"use client";

import Image from "next/image";
import { GameButton } from "@/components/ui/GameButton";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";

export function MainMenu() {
  const openBriefing = useGameStore((state) => state.openBriefing);
  const openPanel = useGameStore((state) => state.openPanel);
  const bestScore = useGameStore((state) => state.bestScore);
  const bestTime = useGameStore((state) => state.bestTime);
  return (
    <section className="main-menu" aria-label="Main menu">
      <header className="top-signature">
        <span className="dlicom-signature">
          <Image
            src="/brand/dlicom-mark-reference.jpg"
            width={32}
            height={32}
            alt="Dlicom logo"
            unoptimized
          />{" "}
          DLICOM
        </span>
        <span>1% / LAST MESSAGE</span>
      </header>
      <div className="menu-mascot" aria-hidden="true">
        <div className="menu-mascot-orbit" />
        <Image
          src="/brand/dili-blue-cutout.png"
          width={650}
          height={650}
          alt=""
          priority
          unoptimized
        />
      </div>
      <div className="menu-main">
        <div className="menu-kicker">
          <span className="live-dot" /> ONE MESSAGE LEFT
        </div>
        <h1 className="game-title">
          <span>
            1<em>%</em>
          </span>
          <small>LAST MESSAGE</small>
        </h1>
        <p className="menu-subtitle">
          Reach the receiver before the signal dies.
        </p>
        <nav className="menu-actions" aria-label="Game menu">
          <GameButton variant="primary" onClick={() => openBriefing(true)}>
            TRANSMIT <span aria-hidden="true">↗</span>
          </GameButton>
          <div className="menu-secondary">
            <GameButton onClick={() => openPanel("how")}>CONTROLS</GameButton>
            <GameButton onClick={() => openPanel("settings")}>
              SETTINGS
            </GameButton>
            <GameButton onClick={() => openPanel("about")}>CREDITS</GameButton>
          </div>
        </nav>
      </div>
      <footer className="menu-footer">
        <span>
          <strong>NXR</strong> × DLICOM GAME JAM
        </span>
        <span className="footer-stats">
          BEST {bestScore.toLocaleString()}{" "}
          {bestTime !== null && (
            <>
              {" "}
              <i>·</i> {formatTime(bestTime)}
            </>
          )}
        </span>
      </footer>
    </section>
  );
}

"use client";

import { GameButton } from "@/components/ui/GameButton";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";

export function MainMenu() {
  const openBriefing = useGameStore((state) => state.openBriefing);
  const openPanel = useGameStore((state) => state.openPanel);
  const bestScore = useGameStore((state) => state.bestScore);
  const bestTime = useGameStore((state) => state.bestTime);
  const completedRuns = useGameStore((state) => state.completedRuns);
  return (
    <section className="main-menu" aria-label="Main menu">
      <header className="top-signature">
        <span>
          NXR <i>{"//"}</i> SIGNAL DIVISION
        </span>
        <span>GAME JAM BUILD / 0.2</span>
      </header>
      <div className="menu-main">
        <div className="menu-kicker">
          <span className="live-dot" /> ONE MESSAGE QUEUED{" "}
          <span className="kicker-line" />
        </div>
        <h1 className="game-title">
          <span>
            1<em>%</em>
          </span>
          <small>LAST MESSAGE</small>
        </h1>
        <p className="menu-subtitle">
          One battery percent.
          <br />
          One message left.
        </p>
        <nav className="menu-actions" aria-label="Game menu">
          <GameButton variant="primary" onClick={() => openBriefing(true)}>
            TRANSMIT <span aria-hidden="true">↗</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openPanel("how")}>
            HOW TO PLAY <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openPanel("settings")}>
            SETTINGS <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openPanel("about")}>
            ABOUT / CREDITS <span aria-hidden="true">→</span>
          </GameButton>
        </nav>
      </div>
      <footer className="menu-footer">
        <span>
          BUILT BY <strong>NXR</strong>{" "}
          <span className="footer-muted">/ @nxrskyaa</span>
        </span>
        <span className="footer-stats">
          DELIVERED {completedRuns} <i>·</i> BEST {bestScore.toLocaleString()}{" "}
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

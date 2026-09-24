"use client";

import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/store/gameStore";

export function PauseMenu() {
  const resume = useGameStore((state) => state.resume);
  const retry = useGameStore((state) => state.retry);
  const goMenu = useGameStore((state) => state.goMenu);
  const openPanel = useGameStore((state) => state.openPanel);
  return (
    <section className="pause-screen" aria-label="Transmission paused">
      <div className="pause-card">
        <span className="micro-label">TRANSMISSION HELD / POWER STABLE</span>
        <h2>
          PAUSED<span>.</span>
        </h2>
        <p>Your signal is held. The battery will wait.</p>
        <div className="pause-actions">
          <GameButton variant="primary" onClick={resume}>
            RESUME <span aria-hidden="true">↗</span>
          </GameButton>
          <GameButton variant="menu" onClick={retry}>
            RESTART TRANSMISSION <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openPanel("settings")}>
            SETTINGS <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={goMenu}>
            RETURN TO MAIN MENU <span aria-hidden="true">→</span>
          </GameButton>
        </div>
      </div>
    </section>
  );
}

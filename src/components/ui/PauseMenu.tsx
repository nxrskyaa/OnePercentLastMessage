"use client";

import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function PauseMenu() {
  const resume = useGameStore((state) => state.resume);
  const retry = useGameStore((state) => state.retry);
  const goMenu = useGameStore((state) => state.goMenu);
  const openPanel = useGameStore((state) => state.openPanel);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  return (
    <section className="pause-screen" aria-label="Transmission paused">
      <div className="pause-card">
        <span className="micro-label">{t.powerStable}</span>
        <h2>
          {t.paused}
          <span>.</span>
        </h2>
        <p>{t.pauseDetail}</p>
        <div className="pause-actions">
          <GameButton variant="primary" onClick={resume}>
            {t.resume} <span aria-hidden="true">↗</span>
          </GameButton>
          <GameButton variant="menu" onClick={retry}>
            {t.restart} <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openPanel("settings")}>
            {t.settings} <span aria-hidden="true">→</span>
          </GameButton>
          <GameButton variant="menu" onClick={goMenu}>
            {t.returnMenu} <span aria-hidden="true">→</span>
          </GameButton>
        </div>
      </div>
    </section>
  );
}

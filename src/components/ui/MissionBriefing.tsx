"use client";

import { GameButton } from "@/components/ui/GameButton";
import { MISSIONS } from "@/game/missions";
import { useGameStore } from "@/store/gameStore";

export function MissionBriefing() {
  const missionIndex = useGameStore((state) => state.missionIndex);
  const tutorialCompleted = useGameStore((state) => state.tutorialCompleted);
  const beginCountdown = useGameStore((state) => state.beginCountdown);
  const openTutorial = useGameStore((state) => state.openTutorial);
  const goMenu = useGameStore((state) => state.goMenu);
  const mission = MISSIONS[missionIndex];
  return (
    <section className="briefing-screen" aria-label="Mission briefing">
      <div className="briefing-index">
        <span className="live-dot" /> INCOMING{" "}
        <span>#{String(missionIndex + 1).padStart(2, "0")}</span>
      </div>
      <div className="briefing-card">
        <span className="micro-label">FROM {mission.source}</span>
        <h2 className="briefing-message">“{mission.message}”</h2>
        <p className="briefing-objective">{mission.objective}</p>
        <div className="briefing-charge">
          <strong>
            1.00<small>%</small>
          </strong>
          <span>POWER REMAINING</span>
          <i />
        </div>
        <GameButton
          variant="primary"
          onClick={() =>
            tutorialCompleted ? beginCountdown() : openTutorial("countdown")
          }
        >
          TRANSMIT <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton className="briefing-back" onClick={goMenu}>
          ← MAIN MENU
        </GameButton>
      </div>
    </section>
  );
}

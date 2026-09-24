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
        <span className="live-dot" /> INCOMING TRANSMISSION{" "}
        <span>#{String(missionIndex + 1).padStart(2, "0")}</span>
      </div>
      <div className="briefing-card">
        <span className="micro-label">PRIORITY / FINAL DELIVERY</span>
        <h2>
          ONE MESSAGE
          <br />
          <em>LEFT.</em>
        </h2>
        <div className="briefing-details">
          <div>
            <span>SOURCE</span>
            <strong>{mission.source}</strong>
          </div>
          <div>
            <span>MESSAGE</span>
            <strong>“{mission.message}”</strong>
          </div>
          <div>
            <span>OBJECTIVE</span>
            <strong>{mission.objective}</strong>
          </div>
        </div>
        <div className="briefing-resources">
          <div>
            <span>BATTERY</span>
            <strong>1.00%</strong>
          </div>
          <div>
            <span>PRIVACY</span>
            <strong>100%</strong>
          </div>
          <div>
            <span>RECEIVER</span>
            <strong>{mission.receiver}</strong>
          </div>
        </div>
        <GameButton
          variant="primary"
          onClick={() =>
            tutorialCompleted ? beginCountdown() : openTutorial("countdown")
          }
        >
          BEGIN TRANSMISSION <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton className="briefing-back" onClick={goMenu}>
          ← MAIN MENU
        </GameButton>
      </div>
      <div className="briefing-ghost">NXR://SIGNAL</div>
    </section>
  );
}

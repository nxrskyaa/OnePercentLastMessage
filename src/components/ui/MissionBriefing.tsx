"use client";

import { GameButton } from "@/components/ui/GameButton";
import { RouteMap } from "@/components/ui/RouteMap";
import { missionAt } from "@/game/missions";
import { copyFor } from "@/game/copy";
import { stageAt } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function MissionBriefing() {
  const missionIndex = useGameStore((state) => state.missionIndex);
  const stageIndex = useGameStore((state) => state.stageIndex);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  const tutorialCompleted = useGameStore((state) => state.tutorialCompleted);
  const beginCountdown = useGameStore((state) => state.beginCountdown);
  const openTutorial = useGameStore((state) => state.openTutorial);
  const goMenu = useGameStore((state) => state.goMenu);
  const mission = missionAt(missionIndex, language);
  const stage = stageAt(stageIndex);
  return (
    <section
      className="briefing-screen flight-briefing"
      aria-label="Mission briefing"
    >
      <div className="briefing-index">
        <span className="live-dot" /> {t.incoming}{" "}
        <span>#{String(missionIndex + 1).padStart(2, "0")}</span>
      </div>
      <div className="briefing-card">
        <span className="micro-label">
          {t.from} {mission.source} · {t.stage} {stage.number} /{" "}
          {language === "id" ? stage.nameId : stage.name}
        </span>
        <h2 className="briefing-message">“{mission.message}”</h2>
        <p className="briefing-objective">{mission.objective}</p>
        <div className="briefing-charge">
          <strong>
            1.00<small>%</small>
          </strong>
          <span>{t.powerRemaining}</span>
          <i />
        </div>
        <GameButton
          variant="primary"
          onClick={() =>
            tutorialCompleted ? beginCountdown() : openTutorial("countdown")
          }
        >
          {t.transmit} <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton className="briefing-back" onClick={goMenu}>
          ← {t.mainMenu}
        </GameButton>
      </div>
      <aside
        className="briefing-route"
        aria-label={language === "id" ? "Rencana penerbangan" : "Flight plan"}
      >
        <span>{language === "id" ? "RENCANA PENERBANGAN" : "FLIGHT PLAN"}</span>
        <h3>{language === "id" ? stage.nameId : stage.name}</h3>
        <RouteMap stage={stageIndex} />
        <p>
          01 / {language === "id" ? "BERANGKAT" : "DEPARTURE"}
          <span>04 / {language === "id" ? "PENERIMA" : "RECEIVER"}</span>
        </p>
      </aside>
    </section>
  );
}

"use client";

import Image from "next/image";
import { GameButton } from "@/components/ui/GameButton";
import { formatTime } from "@/lib/format";
import { copyFor } from "@/game/copy";
import { STAGES } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore } from "@/store/settingsStore";

export function MainMenu() {
  const openBriefing = useGameStore((state) => state.openBriefing);
  const openPanel = useGameStore((state) => state.openPanel);
  const bestScore = useGameStore((state) => state.bestScore);
  const bestTime = useGameStore((state) => state.bestTime);
  const stageIndex = useGameStore((state) => state.stageIndex);
  const selectStage = useGameStore((state) => state.selectStage);
  const playerName = usePlayerProfileStore((state) => state.name);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
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
          <span className="live-dot" /> {t.oneMessage}
        </div>
        <h1 className="game-title">
          <span>
            1<em>%</em>
          </span>
          <small>LAST MESSAGE</small>
        </h1>
        <p className="menu-subtitle">{t.subtitle}</p>
        <nav className="menu-actions" aria-label="Game menu">
          <GameButton variant="primary" onClick={() => openBriefing(true)}>
            {t.transmit} <span aria-hidden="true">↗</span>
          </GameButton>
          <div className="menu-secondary">
            <GameButton onClick={() => openPanel("how")}>
              {t.controls}
            </GameButton>
            <GameButton onClick={() => openPanel("settings")}>
              {t.settings}
            </GameButton>
            <GameButton onClick={() => openPanel("profile")}>
              {t.profile}
            </GameButton>
            <GameButton onClick={() => openPanel("about")}>
              {t.credits}
            </GameButton>
          </div>
        </nav>
        <div className="stage-picker" aria-label={t.selectStage}>
          <span>{t.selectStage}</span>
          <div>
            {STAGES.map((stage, index) => (
              <button
                type="button"
                key={stage.id}
                className={index === stageIndex ? "active" : ""}
                onClick={() => selectStage(index)}
                aria-pressed={index === stageIndex}
              >
                <small>{stage.number}</small>
                <strong>{language === "id" ? stage.nameId : stage.name}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="menu-footer">
        <span>
          <strong>NXR</strong> × DLICOM GAME JAM
        </span>
        <span className="footer-stats">
          {playerName && <b>{playerName.toUpperCase()} · </b>}
          {t.best} {bestScore.toLocaleString()}{" "}
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

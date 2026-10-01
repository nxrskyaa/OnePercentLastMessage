"use client";

import Image from "next/image";
import { GameLogo } from "./GameLogo";
import { formatTime } from "@/lib/format";
import { copyFor } from "@/game/copy";
import { STAGES } from "@/game/stages";
import { useGameStore } from "@/store/gameStore";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore } from "@/store/settingsStore";

export function MainMenu() {
  const openBriefing = useGameStore((s) => s.openBriefing);
  const openPanel = useGameStore((s) => s.openPanel);
  const bestScore = useGameStore((s) => s.bestScore);
  const bestTime = useGameStore((s) => s.bestTime);
  const stageIndex = useGameStore((s) => s.stageIndex);
  const selectStage = useGameStore((s) => s.selectStage);
  const playerName = usePlayerProfileStore((s) => s.name);
  const language = useSettingsStore((s) => s.language);
  const t = copyFor(language);
  const id = language === "id";
  return (
    <section className="dispatch-menu" aria-label="Main menu">
      <div className="dispatch-print" aria-hidden="true" />
      <header className="dispatch-header">
        <span className="dispatch-brand">
          <Image
            src="/brand/dlicom-mark-reference.jpg"
            width={32}
            height={32}
            alt="Dlicom logo"
            unoptimized
          />{" "}
          DLICOM <small>× NXR</small>
        </span>
        <span className="dispatch-best">
          {t.best} <b>{bestScore.toLocaleString()}</b>
        </span>
      </header>
      <div className="dispatch-hero" aria-hidden="true">
        <div className="dispatch-burst" />
        <span className="dispatch-hero-type">
          SEND
          <br />
          IT!
        </span>
        <Image
          className="dispatch-dili"
          src="/brand/dili-blue-cutout.png"
          width={650}
          height={975}
          alt=""
          priority
          unoptimized
        />
        <span className="dispatch-sticker">
          {id
            ? "SATU PESAN.\nHARUS SAMPAI."
            : "ONE MESSAGE.\nEVERYTHING AT STAKE."}
        </span>
      </div>
      <div className="dispatch-content">
        <span className="dispatch-kicker">
          {id
            ? "BATERAI KRITIS / SINYAL AKTIF"
            : "BATTERY CRITICAL / SIGNAL LIVE"}
        </span>
        <h1>
          <GameLogo />
        </h1>
        <p>{id ? "Satu persen. Satu kesempatan." : "One percent. One shot."}</p>
        <nav className="dispatch-actions" aria-label="Game menu">
          <button
            className="dispatch-launch"
            onClick={() => openBriefing(true)}
          >
            <span aria-hidden="true">↗</span>
            <b>{t.transmit}</b>
            <small>{id ? "MULAI TERBANG" : "TAKE FLIGHT"}</small>
          </button>
          <div className="dispatch-tools">
            <button onClick={() => openPanel("how")}>
              <span aria-hidden="true">⌘</span>
              {t.controls}
            </button>
            <button onClick={() => openPanel("settings")}>
              <span aria-hidden="true">⚙</span>
              {t.settings}
            </button>
            <button onClick={() => openPanel("profile")}>
              <span aria-hidden="true">◉</span>
              {t.profile}
            </button>
            <button onClick={() => openPanel("about")}>
              <span aria-hidden="true">✳</span>
              {t.credits}
            </button>
          </div>
        </nav>
      </div>
      <div className="dispatch-stages" aria-label={t.selectStage}>
        <span className="dispatch-stage-label">
          {id ? "PILIH FREKUENSIMU" : "PICK YOUR FREQUENCY"} <b>↓</b>
        </span>
        <div className="dispatch-stage-list">
          {STAGES.map((stage, index) => (
            <button
              type="button"
              className={index === stageIndex ? "selected" : ""}
              aria-pressed={index === stageIndex}
              onClick={() => selectStage(index)}
              key={stage.id}
            >
              <svg viewBox="0 0 100 58" aria-hidden="true">
                <path
                  d={
                    index === 0
                      ? "M0 38Q20 3 40 33T80 26L100 14"
                      : index === 1
                        ? "M0 48 22 10 42 42 63 6 80 40 100 15"
                        : "M0 42Q25 42 35 16T68 20T100 30"
                  }
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <circle cx="80" cy="26" r="5" fill="currentColor" />
              </svg>
              <span className="dispatch-stage-number">{stage.number}</span>
              <span>
                <b>{id ? stage.nameId : stage.name}</b>
                <small>
                  {index === 0
                    ? id
                      ? "SEIMBANG"
                      : "BALANCED"
                    : index === 1
                      ? id
                        ? "TEKNIS"
                        : "TECHNICAL"
                      : id
                        ? "INTENS"
                        : "INTENSE"}{" "}
                  / 1.8 KM
                </small>
              </span>
              <i aria-hidden="true">{index === stageIndex ? "↗" : "+"}</i>
            </button>
          ))}
        </div>
      </div>
      <footer className="dispatch-footer">
        <b>{playerName || "OPERATOR"}</b>
        <span>DLICOM AI GAME JAM</span>
        <span>
          {bestTime !== null ? formatTime(bestTime) : "1% / LAST MESSAGE"}
        </span>
      </footer>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { ResultCardDialog } from "@/components/ui/ResultCardDialog";
import { missionAt } from "@/game/missions";
import { copyFor } from "@/game/copy";
import { stageAt } from "@/game/stages";
import { privacyRank } from "@/game/scoring";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore } from "@/store/settingsStore";

export function ResultsScreen() {
  const phase = useGameStore((state) => state.phase);
  const missionIndex = useGameStore((state) => state.missionIndex);
  const stageIndex = useGameStore((state) => state.stageIndex);
  const playerName = usePlayerProfileStore((state) => state.name);
  const xHandle = usePlayerProfileStore((state) => state.xHandle);
  const avatarUrl = usePlayerProfileStore((state) => state.avatarUrl);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  const elapsed = useGameStore((state) => state.elapsed);
  const battery = useGameStore((state) => state.battery);
  const privacy = useGameStore((state) => state.privacy);
  const distance = useGameStore((state) => state.distance);
  const score = useGameStore((state) => state.score);
  const newBest = useGameStore((state) => state.newBest);
  const awards = useGameStore((state) => state.awards);
  const trackerHits = useGameStore((state) => state.trackerHits);
  const tipsCollected = useGameStore((state) => state.tipsCollected);
  const retry = useGameStore((state) => state.retry);
  const openBriefing = useGameStore((state) => state.openBriefing);
  const goMenu = useGameStore((state) => state.goMenu);
  const [copyStatus, setCopyStatus] = useState<"ready" | "copied" | "error">(
    "ready",
  );
  const [cardOpen, setCardOpen] = useState(false);
  const success = phase === "success";
  const mission = missionAt(missionIndex, language);
  const stage = stageAt(stageIndex);
  const cardData = useMemo(
    () => ({
      success,
      receiver: mission.receiver,
      elapsed,
      battery,
      privacy,
      score,
      trackerHits,
      tipsCollected,
      playerName,
      xHandle,
      avatarUrl,
      stageName: language === "id" ? stage.nameId : stage.name,
      language,
    }),
    [
      success,
      mission.receiver,
      elapsed,
      battery,
      privacy,
      score,
      trackerHits,
      tipsCollected,
      playerName,
      xHandle,
      avatarUrl,
      stage,
      language,
    ],
  );
  const resultText = `${success ? t.delivered : t.lost}\n${playerName}${xHandle ? ` (@${xHandle})` : ""}\n${language === "id" ? stage.nameId : stage.name}\n${mission.receiver}\n${t.battery}: ${battery.toFixed(2)}%\n${t.privacy}: ${Math.round(privacy)}%\n${t.score}: ${score.toLocaleString()}\n\n1% — Last Message\n#LastMessage #DlicomGameJam`;
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };
  return (
    <section
      className={`results-screen ${success ? "results-screen--success" : "results-screen--failed"}`}
      aria-label="Run result"
    >
      <div className="result-heading">
        <span className="micro-label">
          {stage.number} / {language === "id" ? stage.nameId : stage.name} ·{" "}
          {playerName}
        </span>
      </div>
      <div className="result-body">
        <div className="result-intro">
          <div className="result-seal" aria-hidden="true">
            {success ? "◇" : "×"}
          </div>
          <div>
            {newBest && <span className="personal-best">✦ {t.newBest}</span>}
            <h2>
              {success ? (
                <>
                  {language === "id" ? "PESAN" : "MESSAGE"}
                  <br />
                  <em>{language === "id" ? "TERKIRIM." : "DELIVERED."}</em>
                </>
              ) : (
                <>
                  {language === "id" ? "SINYAL" : "SIGNAL"}
                  <br />
                  <em>{language === "id" ? "HILANG." : "LOST."}</em>
                </>
              )}
            </h2>
            <p>
              {success
                ? `${t.reached} ${mission.receiver}.`
                : `${t.depleted} ${Math.ceil(distance)}${t.awayFrom} ${mission.receiver}.`}
            </p>
          </div>
        </div>
        <div className="result-score">
          <span>{t.score}</span>
          <strong>{score.toLocaleString()}</strong>
          <small>{privacyRank(privacy)}</small>
        </div>
        <div className="result-grid">
          <div>
            <span>{t.time}</span>
            <strong>{formatTime(elapsed)}</strong>
          </div>
          <div>
            <span>{t.battery}</span>
            <strong>{battery.toFixed(2)}%</strong>
          </div>
          <div>
            <span>{t.privacy}</span>
            <strong>{Math.round(privacy)}%</strong>
          </div>
          <div>
            <span>{t.trackers}</span>
            <strong>{trackerHits}</strong>
          </div>
        </div>
        {awards.length > 0 && (
          <div className="result-awards">
            {awards.map((award) => (
              <span key={award}>✦ {award}</span>
            ))}
          </div>
        )}
        <div className="result-actions">
          <GameButton variant="primary" onClick={retry}>
            {t.retry} <span aria-hidden="true">↗</span>
          </GameButton>
          <GameButton variant="primary" onClick={() => setCardOpen(true)}>
            {t.downloadCard} <span aria-hidden="true">↓</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openBriefing(true)}>
            {t.newMessage} <span aria-hidden="true">→</span>
          </GameButton>
        </div>
        <div className="result-secondary">
          <GameButton onClick={goMenu}>{t.mainMenu}</GameButton>
          <GameButton onClick={copyResult}>
            {copyStatus === "ready"
              ? t.copyResult
              : copyStatus === "copied"
                ? t.copied
                : t.copyUnavailable}
          </GameButton>
        </div>
      </div>
      {cardOpen && (
        <ResultCardDialog data={cardData} onClose={() => setCardOpen(false)} />
      )}
    </section>
  );
}

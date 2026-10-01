"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GameLogo } from "./GameLogo";
import { ResultCardDialog } from "@/components/ui/ResultCardDialog";
import { missionAt } from "@/game/missions";
import { copyFor } from "@/game/copy";
import { stageAt } from "@/game/stages";
import { privacyRank } from "@/game/scoring";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";
import { usePlayerProfileStore } from "@/store/playerProfileStore";
import { useSettingsStore } from "@/store/settingsStore";
import { RouteMap } from "./RouteMap";
import { craftAt } from "@/game/crafts";
import { AnimatedNumber } from "./AnimatedNumber";

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
  const grade = !success
    ? "X"
    : trackerHits === 0 && privacy >= 90
      ? "S"
      : privacy >= 75
        ? "A"
        : privacy >= 50
          ? "B"
          : "C";
  return (
    <section
      className={`receipt-screen flight-results kinetic-results ${success ? "receipt-success" : "receipt-failed"}`}
      aria-label="Run result"
    >
      <header className="receipt-top">
        <GameLogo />
        <span>
          {stage.number} / {language === "id" ? stage.nameId : stage.name}
        </span>
        <button onClick={goMenu} aria-label={t.mainMenu}>
          ×
        </button>
      </header>
      <div className="receipt-poster">
        <div className="receipt-halftone" aria-hidden="true" />
        <div className="result-flight-log">
          <span>
            {language === "id" ? "CATATAN PENERBANGAN" : "FLIGHT RECORDER"}
          </span>
          <RouteMap
            stage={stageIndex}
            progress={success ? 1 : 1 - distance / 1800}
            large
          />
          <h3>{craftAt(stageIndex).name}</h3>
          <p>
            {success
              ? language === "id"
                ? "PESAN SAMPAI"
                : "RECEIVER REACHED"
              : `${Math.round((1 - distance / 1800) * 100)}% ${language === "id" ? "LINTASAN SELESAI" : "ROUTE COMPLETE"}`}
          </p>
          <Image
            src="/brand/dili-blue-cutout.png"
            width={100}
            height={150}
            alt="DILI"
            unoptimized
          />
        </div>
        <div className="receipt-banner">
          <span>{success ? "✓" : "×"}</span>
          <h2>{success ? t.delivered : t.lost}</h2>
        </div>
        <div className="receipt-record">
          <div className="receipt-identity">
            <span className="receipt-avatar">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  width={52}
                  height={52}
                  alt=""
                  unoptimized
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <b>{playerName.slice(0, 2).toUpperCase()}</b>
            </span>
            <div>
              <strong>{playerName}</strong>
              <small>{xHandle ? `@${xHandle}` : "DLICOM SIGNAL COURIER"}</small>
            </div>
          </div>
          <div className="receipt-grade">
            <b>{grade}</b>
            <div>
              <span>{language === "id" ? "PERINGKAT" : "RUN RANK"}</span>
              <strong>{privacyRank(privacy)}</strong>
              <small>
                {newBest
                  ? `✦ ${t.newBest}`
                  : success
                    ? `${t.reached} ${mission.receiver}`
                    : `${Math.ceil(distance)}m ${language === "id" ? "dari" : "from"} ${mission.receiver}`}
              </small>
            </div>
          </div>
          <div className="receipt-score">
            <span>{t.score}</span>
            <AnimatedNumber value={score} />
            <span>PTS</span>
          </div>
          <div className="receipt-stats">
            <div>
              <span>{t.time}</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
            <div>
              <span>{t.battery}</span>
              <strong>{battery.toFixed(2)}%</strong>
              <i>
                <b style={{ width: `${battery * 100}%` }} />
              </i>
            </div>
            <div>
              <span>{t.privacy}</span>
              <strong>{Math.round(privacy)}%</strong>
              <i>
                <b style={{ width: `${privacy}%` }} />
              </i>
            </div>
            <div>
              <span>{t.trackers} / TIPS</span>
              <strong>
                {trackerHits} / {tipsCollected}
              </strong>
            </div>
          </div>
          {awards.length > 0 && (
            <div className="receipt-awards">
              {awards.map((award) => (
                <span key={award}>✦ {award}</span>
              ))}
            </div>
          )}
        </div>
        <span className="receipt-stamp">
          {success ? "DELIVERY CONFIRMED" : "SIGNAL INTERRUPTED"}
          <small>NXR × DLICOM</small>
        </span>
      </div>
      <nav className="receipt-actions" aria-label="Result actions">
        <button onClick={retry} className="receipt-retry">
          ↗ {t.retry}
        </button>
        <button onClick={() => setCardOpen(true)}>↓ {t.downloadCard}</button>
        <button onClick={() => openBriefing(true)}>→ {t.newMessage}</button>
        <button onClick={copyResult}>
          {copyStatus === "ready"
            ? t.copyResult
            : copyStatus === "copied"
              ? t.copied
              : t.copyUnavailable}
        </button>
      </nav>
      {cardOpen && (
        <ResultCardDialog data={cardData} onClose={() => setCardOpen(false)} />
      )}
    </section>
  );
}

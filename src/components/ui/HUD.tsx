"use client";

import Image from "next/image";
import { GAME_CONFIG } from "@/game/config";
import { MISSIONS } from "@/game/missions";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";

export function HUD() {
  const battery = useGameStore((state) => state.battery);
  const privacy = useGameStore((state) => state.privacy);
  const distance = useGameStore((state) => state.distance);
  const elapsed = useGameStore((state) => state.elapsed);
  const boosting = useGameStore((state) => state.boosting);
  const scanCooldown = useGameStore((state) => state.scanCooldown);
  const feedback = useGameStore((state) => state.feedback);
  const advisor = useGameStore((state) => state.advisor);
  const missionIndex = useGameStore((state) => state.missionIndex);
  const pause = useGameStore((state) => state.pause);
  const critical = battery < 0.1;
  return (
    <div
      className={`game-hud ${critical ? "game-hud--critical" : ""}`}
      aria-live="off"
    >
      <header className="hud-primary">
        <div
          className="hud-energy"
          aria-label={`Battery ${battery.toFixed(2)} percent, privacy ${Math.round(privacy)} percent`}
        >
          <span className="hud-caption">BATTERY</span>
          <strong>
            {battery.toFixed(2)}
            <small>%</small>
          </strong>
          <div className="hud-energy-track">
            <span style={{ width: `${battery * 100}%` }} />
          </div>
          <div className="hud-privacy">
            <span>PRIVACY</span>
            <b>{Math.round(privacy)}%</b>
            <i style={{ width: `${privacy}%` }} />
          </div>
        </div>
        <div
          className="hud-destination"
          aria-label={`${Math.ceil(distance)} metres to ${MISSIONS[missionIndex].receiver}`}
        >
          <span className="hud-destination-icon" aria-hidden="true">
            ◇
          </span>
          <div>
            <strong>
              {Math.ceil(distance)}
              <small>m</small>
            </strong>
            <span>{MISSIONS[missionIndex].receiver}</span>
          </div>
        </div>
        <div className="hud-clock">
          <strong>{formatTime(elapsed)}</strong>
          <button type="button" onClick={pause} aria-label="Pause game">
            Ⅱ
          </button>
        </div>
      </header>
      <div className="hud-reticle" aria-hidden="true">
        <span />
      </div>
      {distance < 440 && distance > 300 && (
        <div className="route-choice" role="status">
          <div>
            <span>←</span>
            <strong>SAFE</strong>
            <small>100% PRIVATE</small>
          </div>
          <div>
            <strong>FAST</strong>
            <small>−{GAME_CONFIG.nodes.publicPrivacyDamage}% PRIVACY</small>
            <span>→</span>
          </div>
        </div>
      )}
      {feedback && (
        <div
          key={`event-${feedback.id}`}
          className={`event-feedback event-feedback--${feedback.tone}`}
          role="status"
        >
          <strong>{feedback.title}</strong>
        </div>
      )}
      {advisor && (
        <div key={`advisor-${advisor.id}`} className="dili-hint" role="status">
          <Image
            src="/brand/dili-blue-cutout.png"
            width={42}
            height={42}
            alt="DILI"
            unoptimized
          />
          <span>{advisor.text}</span>
        </div>
      )}
      {critical && (
        <div className="critical-alert" role="alert">
          LOW POWER
        </div>
      )}
      <footer className="hud-footer">
        <div
          className={`scan-indicator ${scanCooldown <= 0 ? "ready" : ""}`}
          aria-label={
            scanCooldown <= 0
              ? "Scan ready. Press Space."
              : `Scan ready in ${scanCooldown.toFixed(1)} seconds`
          }
        >
          <span>⌁</span>
          <small>
            {scanCooldown <= 0 ? "SPACE · SCAN" : `${scanCooldown.toFixed(1)}s`}
          </small>
        </div>
        {boosting && <span className="boost-active">BOOSTING</span>}
      </footer>
    </div>
  );
}

"use client";

import Image from "next/image";
import { GAME_CONFIG } from "@/game/config";
import { missionAt } from "@/game/missions";
import { copyFor } from "@/game/copy";
import { formatTime } from "@/lib/format";
import { courseAct } from "@/game/course";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

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
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  const mission = missionAt(missionIndex, language);
  const pause = useGameStore((state) => state.pause);
  const critical = battery < 0.1;
  const act = courseAct(distance);
  const altitude = useGameStore((state) => state.altitude ?? 0);
  return (
    <div
      className={`game-hud ${critical ? "game-hud--critical" : ""}`}
      aria-live="off"
    >
      <header className="hud-primary">
        <div
          className="hud-energy"
          aria-label={`${t.battery} ${battery.toFixed(2)} percent, ${t.privacy} ${Math.round(privacy)} percent`}
        >
          <span className="hud-caption">{t.battery}</span>
          <strong>
            {battery.toFixed(2)}
            <small>%</small>
          </strong>
          <div className="hud-energy-track">
            <span style={{ width: `${battery * 100}%` }} />
          </div>
          <div className="hud-privacy">
            <span>{t.privacy}</span>
            <b>{Math.round(privacy)}%</b>
            <i style={{ width: `${privacy}%` }} />
          </div>
        </div>
        <div
          className="hud-destination"
          aria-label={`${Math.ceil(distance)} metres to ${mission.receiver}`}
        >
          <span className="hud-destination-icon" aria-hidden="true">
            ◇
          </span>
          <div>
            <strong>
              {Math.ceil(distance)}
              <small>m</small>
            </strong>
            <span>{mission.receiver}</span>
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
      <div className="course-readout">
        <b>{act.mark}</b>
        <span>{language === "id" ? act.nameId : act.name}</span>
        <i
          style={{
            width: `${(1 - distance / Math.abs(GAME_CONFIG.destination.z)) * 100}%`,
          }}
        />
      </div>
      <div className="altitude-readout">
        <span>{language === "id" ? "KETINGGIAN" : "ALTITUDE"}</span>
        <b>
          {altitude >= 0 ? "+" : ""}
          {altitude.toFixed(1)}
        </b>
        <small>Q ↑ / E ↓</small>
      </div>
      {distance <
        Math.abs(GAME_CONFIG.destination.z) +
          GAME_CONFIG.course.splitStart +
          50 &&
        distance >
          Math.abs(GAME_CONFIG.destination.z) + GAME_CONFIG.course.splitZ && (
          <div className="route-choice" role="status">
            <div>
              <span>←</span>
              <strong>{t.safe}</strong>
              <small>{t.private}</small>
            </div>
            <div>
              <strong>{t.fast}</strong>
              <small>
                −{GAME_CONFIG.nodes.publicPrivacyDamage}% {t.privacy}
              </small>
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
          {t.lowPower}
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
            {scanCooldown <= 0 ? t.scanReady : `${scanCooldown.toFixed(1)}s`}
          </small>
        </div>
        {boosting && <span className="boost-active">{t.boosting}</span>}
      </footer>
    </div>
  );
}

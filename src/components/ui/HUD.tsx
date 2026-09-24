"use client";

import { GameButton } from "@/components/ui/GameButton";
import { GAME_CONFIG } from "@/game/config";
import { MISSIONS } from "@/game/missions";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function HUD() {
  const battery = useGameStore((state) => state.battery);
  const privacy = useGameStore((state) => state.privacy);
  const distance = useGameStore((state) => state.distance);
  const elapsed = useGameStore((state) => state.elapsed);
  const boosting = useGameStore((state) => state.boosting);
  const eventScore = useGameStore((state) => state.eventScore);
  const scanCooldown = useGameStore((state) => state.scanCooldown);
  const feedback = useGameStore((state) => state.feedback);
  const advisor = useGameStore((state) => state.advisor);
  const missionIndex = useGameStore((state) => state.missionIndex);
  const pause = useGameStore((state) => state.pause);
  const mute = useSettingsStore((state) => state.mute);
  const updateSettings = useSettingsStore((state) => state.update);
  const critical = battery < 0.1;
  return (
    <div
      className={`game-hud ${critical ? "game-hud--critical" : ""}`}
      aria-live="off"
    >
      <div className="hud-topline">
        <span>
          NXR <i>{"//"}</i> SECURE CHANNEL
        </span>
        <span>TRANSMISSION ACTIVE</span>
        <span>ENCRYPTED PACKET / 001</span>
      </div>
      <header className="hud-stats">
        <div className="hud-resource">
          <span className="micro-label">BATTERY</span>
          <strong>
            {battery.toFixed(2)}
            <small>%</small>
          </strong>
          <div className="resource-track">
            <span style={{ width: `${battery * 100}%` }} />
          </div>
          <div className="privacy-line">
            <span>PRIVACY</span>
            <b>{Math.round(privacy)}%</b>
          </div>
        </div>
        <div className="hud-target">
          <span className="micro-label">
            TARGET / {MISSIONS[missionIndex].receiver}
          </span>
          <strong>
            {Math.ceil(distance)}
            <small>m</small>
          </strong>
          <span>TO RECEIVER</span>
        </div>
        <div className="hud-time">
          <span className="micro-label">ELAPSED</span>
          <strong>{formatTime(elapsed)}</strong>
          <span>SCORE {Math.max(0, eventScore).toLocaleString()}</span>
        </div>
      </header>
      <div className="hud-reticle" aria-hidden="true">
        <span />
      </div>
      {distance < 440 && distance > 300 && (
        <div className="route-choice">
          <div>
            <span>← LEFT GATE</span>
            <strong>SECURE ROUTE</strong>
            <small>PRIVACY PRESERVED</small>
          </div>
          <div>
            <span>RIGHT GATE →</span>
            <strong>PUBLIC RELAY</strong>
            <small>
              FASTER / -{GAME_CONFIG.nodes.publicPrivacyDamage}% PRIVACY
            </small>
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
          <span>{feedback.detail}</span>
        </div>
      )}
      {advisor && (
        <div key={`advisor-${advisor.id}`} className="dili-hint">
          <span className="dili-glyph">◈</span>
          <div>
            <small>DILI // NETWORK INTELLIGENCE</small>
            <strong>{advisor.text}</strong>
          </div>
        </div>
      )}
      {battery < 0.1 && (
        <div className="critical-alert">
          {battery < 0.05 ? "SIGNAL FAILURE IMMINENT" : "CRITICAL POWER"}
        </div>
      )}
      <footer className="hud-footer">
        <div className="hud-keys">
          <kbd>W</kbd> THRUST <kbd>A</kbd>
          <kbd>D</kbd> STEER <kbd>SHIFT</kbd> BOOST
        </div>
        <div className="scan-indicator">
          <span className={scanCooldown <= 0 ? "scan-ring ready" : "scan-ring"}>
            ◉
          </span>
          <strong>SCAN</strong>
          <small>
            {scanCooldown <= 0
              ? "SPACE / READY"
              : `${scanCooldown.toFixed(1)}s`}
          </small>
        </div>
        <div className="hud-actions">
          <span className={boosting ? "boost-active" : ""}>
            BOOST {boosting ? "ACTIVE" : "READY"}
          </span>
          <GameButton onClick={() => updateSettings({ mute: !mute })}>
            {mute ? "UNMUTE" : "MUTE"}
          </GameButton>
          <GameButton onClick={pause}>ESC / PAUSE</GameButton>
        </div>
      </footer>
    </div>
  );
}

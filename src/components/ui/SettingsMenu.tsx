"use client";

import { useEffect, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/store/gameStore";
import {
  useSettingsStore,
  type GameSettings,
  type Quality,
} from "@/store/settingsStore";

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="setting-row">
      <span>
        {label}
        <strong>{Math.round(value * 100)}%</strong>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(value * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="setting-row setting-toggle">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={checked ? "switch is-on" : "switch"}
      >
        <span />
      </button>
    </div>
  );
}

export function SettingsMenu() {
  const settings = useSettingsStore();
  const closePanel = useGameStore((state) => state.closePanel);
  const goMenu = useGameStore((state) => state.goMenu);
  const openTutorial = useGameStore((state) => state.openTutorial);
  const phase = useGameStore((state) => state.phase);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const update = <K extends keyof Omit<GameSettings, "version">>(
    key: K,
    value: GameSettings[K],
  ) => settings.update({ [key]: value });
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenError("");
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser.");
    }
  };
  const replayTutorial = () => {
    if (phase === "paused") goMenu();
    else closePanel();
    openTutorial("menu");
  };
  return (
    <section className="panel-screen settings-screen" aria-label="Settings">
      <div className="panel-heading">
        <span className="micro-label">SYSTEM CONFIGURATION / 02</span>
        <GameButton onClick={closePanel}>CLOSE ✕</GameButton>
      </div>
      <h2>SETTINGS</h2>
      <div className="settings-grid">
        <div className="settings-group">
          <span className="micro-label">AUDIO</span>
          <Slider
            label="Master volume"
            value={settings.masterVolume}
            onChange={(value) => update("masterVolume", value)}
          />
          <Slider
            label="Music volume"
            value={settings.musicVolume}
            onChange={(value) => update("musicVolume", value)}
          />
          <Slider
            label="SFX volume"
            value={settings.sfxVolume}
            onChange={(value) => update("sfxVolume", value)}
          />
          <Toggle
            label="Mute"
            checked={settings.mute}
            onChange={(value) => update("mute", value)}
          />
        </div>
        <div className="settings-group">
          <span className="micro-label">VISUAL / CONTROL</span>
          <Toggle
            label="Camera shake"
            checked={settings.cameraShake}
            onChange={(value) => update("cameraShake", value)}
          />
          <Toggle
            label="Screen effects"
            checked={settings.screenEffects}
            onChange={(value) => update("screenEffects", value)}
          />
          <Toggle
            label="Bloom"
            checked={settings.bloom}
            onChange={(value) => update("bloom", value)}
          />
          <Toggle
            label="Reduced motion"
            checked={settings.reducedMotion}
            onChange={(value) => update("reducedMotion", value)}
          />
          <Slider
            label="Mouse influence"
            value={settings.mouseSensitivity}
            onChange={(value) => update("mouseSensitivity", value)}
          />
          <label className="setting-row quality-row">
            <span>
              Quality
              <small className="quality-mobile-note">
                Mobile capped at Low
              </small>
            </span>
            <select
              value={settings.quality}
              onChange={(event) =>
                update("quality", event.target.value as Quality)
              }
            >
              <option value="auto">AUTO</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
            </select>
          </label>
        </div>
      </div>
      <div className="settings-actions">
        <GameButton variant="menu" onClick={toggleFullscreen}>
          {fullscreen ? "EXIT FULLSCREEN" : "ENTER FULLSCREEN"}{" "}
          <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton variant="menu" onClick={replayTutorial}>
          REPLAY GUIDE {phase === "paused" ? "· END RUN" : ""}{" "}
          <span aria-hidden="true">↗</span>
        </GameButton>
      </div>
      {fullscreenError && <p className="settings-error">{fullscreenError}</p>}
    </section>
  );
}

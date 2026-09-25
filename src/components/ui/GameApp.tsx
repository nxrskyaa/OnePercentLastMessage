"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { AboutMenu } from "@/components/ui/AboutMenu";
import { BootSequence } from "@/components/ui/BootSequence";
import { Countdown } from "@/components/ui/Countdown";
import { FirstRunTutorial } from "@/components/ui/FirstRunTutorial";
import { HowToPlay } from "@/components/ui/HowToPlay";
import { HUD } from "@/components/ui/HUD";
import { MainMenu } from "@/components/ui/MainMenu";
import { MissionBriefing } from "@/components/ui/MissionBriefing";
import { MobileControls } from "@/components/ui/MobileControls";
import { PauseMenu } from "@/components/ui/PauseMenu";
import { PerformanceHUD } from "@/components/ui/PerformanceHUD";
import { ResultsScreen } from "@/components/ui/ResultsScreen";
import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { configureAudio, setAudioPhase, shutdownAudio } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => null,
});

export function GameApp() {
  const phase = useGameStore((state) => state.phase);
  const panel = useGameStore((state) => state.panel);
  const screenEffects = useSettingsStore((state) => state.screenEffects);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const mute = useSettingsStore((state) => state.mute);
  const onCanvasReady = useCallback(() => {
    if (useGameStore.getState().phase === "loading")
      useGameStore.getState().bootReady();
  }, []);

  useEffect(() => {
    useSettingsStore.getState().hydrate();
    const onVisibilityChange = () => {
      if (document.hidden) useGameStore.getState().pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      shutdownAudio();
    };
  }, []);

  useEffect(() => {
    if (phase === "ident") {
      const timer = window.setTimeout(
        () => useGameStore.getState().setPhase("title"),
        950,
      );
      return () => window.clearTimeout(timer);
    }
    if (phase === "title") {
      const timer = window.setTimeout(
        () => useGameStore.getState().finishIntro(),
        1250,
      );
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  useEffect(
    () => configureAudio({ masterVolume, musicVolume, sfxVolume, mute }),
    [masterVolume, musicVolume, sfxVolume, mute],
  );
  useEffect(() => setAudioPhase(phase), [phase]);

  return (
    <main
      className={`game-shell ${screenEffects ? "game-shell--effects" : ""} ${reducedMotion ? "game-shell--reduced" : ""}`}
    >
      <div className="scene-layer">
        <GameCanvas onReady={onCanvasReady} />
      </div>
      <div className="world-vignette" aria-hidden="true" />
      {["loading", "ident", "title"].includes(phase) && (
        <BootSequence
          phase={phase}
          onSkip={() => useGameStore.getState().finishIntro()}
        />
      )}
      {phase === "menu" && panel === "none" && <MainMenu />}
      {phase === "briefing" && <MissionBriefing />}
      {phase === "tutorial" && <FirstRunTutorial />}
      {phase === "countdown" && <Countdown />}
      {(phase === "playing" || phase === "paused") && <HUD />}
      {phase === "playing" && <MobileControls />}
      {phase === "paused" && panel === "none" && <PauseMenu />}
      {(phase === "success" || phase === "failed") && <ResultsScreen />}
      {panel !== "none" && (
        <div className="panel-backdrop">
          {panel === "how" && <HowToPlay />}
          {panel === "settings" && <SettingsMenu />}
          {panel === "about" && <AboutMenu />}
        </div>
      )}
      <div className="screen-noise" aria-hidden="true" />
      <PerformanceHUD />
    </main>
  );
}

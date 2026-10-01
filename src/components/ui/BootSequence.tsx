"use client";

import Image from "next/image";
import type { GamePhase } from "@/store/gameStore";
import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useSettingsStore } from "@/store/settingsStore";
import { GameLogo } from "./GameLogo";
import { unlockAudio } from "@/lib/audio";

export function BootSequence({
  phase,
  onSkip,
}: {
  phase: GamePhase;
  onSkip: () => void;
}) {
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  return (
    <section
      className={`boot-screen cine-boot cine-boot--${phase}`}
      aria-label="Game opening"
    >
      <div className="cine-shutter cine-shutter--top" aria-hidden="true" />
      <div className="cine-shutter cine-shutter--bottom" aria-hidden="true" />
      <header className="cine-brand">
        <Image
          src="/brand/dlicom-mark-reference.jpg"
          width={30}
          height={30}
          alt="Dlicom logo"
          unoptimized
        />
        <span>
          DLICOM <small>× NXR</small>
        </span>
      </header>
      {phase === "loading" && (
        <div className="cine-loader" role="status">
          <div className="loading-packet" aria-hidden="true">
            <span>
              1<small>%</small>
            </span>
            <i>✉</i>
          </div>
          <strong>{t.initializing}</strong>
          <div className="loading-links" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      {phase === "ident" && (
        <div className="cine-message" key="ident">
          <span>
            {language === "id"
              ? "SATU PESAN DALAM ANTREAN"
              : "ONE MESSAGE QUEUED"}
          </span>
          <strong>
            {language === "id" ? "Jangan putus." : "Stay with me."}
          </strong>
          <small>
            {language === "id"
              ? "DILI / MENGHUBUNGKAN SINYAL"
              : "DILI / CONNECTING SIGNAL"}
          </small>
        </div>
      )}
      {phase === "title" && (
        <div className="cine-title" key="title">
          <GameLogo className="opening-logo" />
          <p>
            {language === "id"
              ? "Satu persen baterai. Satu pesan terakhir."
              : "One battery percent. One message left."}
          </p>
        </div>
      )}
      {phase !== "loading" && (
        <GameButton
          className="boot-skip"
          onClick={() => {
            unlockAudio();
            onSkip();
          }}
        >
          {t.skipIntro} <span aria-hidden="true">↗</span>
        </GameButton>
      )}
    </section>
  );
}

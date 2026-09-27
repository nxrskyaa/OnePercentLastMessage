"use client";

import Image from "next/image";
import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function AboutMenu() {
  const closePanel = useGameStore((state) => state.closePanel);
  const setPhase = useGameStore((state) => state.setPhase);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  return (
    <section className="panel-screen about-screen" aria-label={t.credits}>
      <div className="panel-heading">
        <span className="micro-label">SIGNAL ORIGIN / 03</span>
        <GameButton onClick={closePanel}>{t.close} ✕</GameButton>
      </div>
      <div className="about-mark">
        NXR<span>{"//"}</span>
      </div>
      <h2>
        {language === "id" ? "TENTANG" : "ABOUT THE"} <em>SIGNAL</em>
      </h2>
      <p className="panel-lede">
        {language === "id"
          ? "Satu persen baterai. Satu pesan. Temukan jalur sebelum sinyal padam."
          : "One battery percent. One message. Find a path through the network before the signal dies."}
      </p>
      <p>
        {language === "id"
          ? "1% — Last Message adalah game bertahan di jaringan 3D yang dibuat untuk Dlicom AI Game Jam. Sebuah proyek game jam independen."
          : "1% — Last Message is a short 3D network survival game created for the Dlicom AI Game Jam. An independent game jam project."}
      </p>
      <div className="dlicom-feature">
        <div className="dlicom-feature-copy">
          <div className="dlicom-feature-heading">
            <Image
              src="/brand/dlicom-mark-reference.jpg"
              alt="Dlicom mark"
              width={68}
              height={68}
              unoptimized
            />
            <div>
              <span className="micro-label">
                {language === "id" ? "ASAL GAME JAM" : "GAME JAM ORIGIN"}
              </span>
              <strong>DLICOM</strong>
            </div>
          </div>
          <p>
            {language === "id"
              ? "Dlicom menyatukan pesan, komunitas, tip untuk kreator, dan dompet self-custody. Game ini mengubah satu pesan terenkripsi terakhir menjadi perlombaan."
              : "Dlicom brings messages, communities, creator tips, and a self-custody wallet together. This game turns one last encrypted message into a playable race."}
          </p>
          <a
            href="https://www.dlicom.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {language === "id" ? "JELAJAHI DLICOM" : "EXPLORE DLICOM"} ↗
          </a>
        </div>
        <Image
          className="dlicom-feature-mascot"
          src="/brand/dili-blue-cutout.png"
          alt="Blue Dili mascot in a bubble helmet"
          width={202}
          height={303}
          unoptimized
        />
      </div>
      <div className="creator-line">
        <span className="micro-label">
          {language === "id" ? "DIBUAT OLEH" : "CREATED BY"}
        </span>
        <strong>NXR</strong>
        <span>@nxrskyaa</span>
      </div>
      <div className="social-links">
        <a
          href="https://x.com/nxrskyaa"
          target="_blank"
          rel="noopener noreferrer"
        >
          X / @nxrskyaa ↗
        </a>
        <a
          href="https://github.com/nxrskyaa"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB / nxrskyaa ↗
        </a>
      </div>
      <div className="credits-grid">
        <div>
          <span>{language === "id" ? "DESAIN GAME" : "GAME DESIGN"}</span>
          <strong>NXR</strong>
        </div>
        <div>
          <span>{language === "id" ? "PENGEMBANGAN" : "DEVELOPMENT"}</span>
          <strong>NXR + Codex</strong>
        </div>
        <div>
          <span>{language === "id" ? "TEKNOLOGI" : "TECHNOLOGY"}</span>
          <strong>Three.js · R3F · Next.js</strong>
        </div>
        <div>
          <span>{language === "id" ? "DIBUAT UNTUK" : "BUILT FOR"}</span>
          <strong>Dlicom AI Game Jam</strong>
        </div>
      </div>
      <GameButton
        onClick={() => {
          closePanel();
          setPhase("ident");
        }}
      >
        {language === "id" ? "ULANGI INTRO" : "REPLAY INTRO"} ↗
      </GameButton>
    </section>
  );
}

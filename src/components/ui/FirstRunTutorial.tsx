"use client";

import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

const STEPS = [
  {
    count: "01 / 03",
    title: "YOU ARE THE MESSAGE.",
    body: "The packet flies forward. Steer through the network and keep it moving.",
    chips: [
      ["W / ↑", "ACCELERATE"],
      ["A D / ← →", "STEER"],
      ["S / ↓", "BRAKE"],
    ],
    touchChips: [
      ["THRUST", "ACCELERATE"],
      ["◀ ▶", "STEER"],
      ["BRAKE", "SLOW DOWN"],
    ],
  },
  {
    count: "02 / 03",
    title: "ONE PERCENT.",
    body: "Your battery is dying. Boost is fast but expensive. Cyan boosters restore a little power; red trackers drain power and privacy.",
    chips: [
      ["SHIFT", "BOOST"],
      ["CYAN", "POWER"],
      ["RED", "DANGER"],
    ],
    touchChips: [
      ["BOOST", "HOLD"],
      ["CYAN", "POWER"],
      ["RED", "DANGER"],
    ],
  },
  {
    count: "03 / 03",
    title: "READ THE NETWORK.",
    body: "Press Space to scan. Pass through relay centers for a speed burst. At the split, choose a private route or a faster public one.",
    chips: [
      ["SPACE", "SCAN"],
      ["CENTER", "PERFECT RELAY"],
      ["ESC", "PAUSE"],
    ],
    touchChips: [
      ["SCAN", "TAP"],
      ["CENTER", "PERFECT RELAY"],
      ["PAUSE", "TAP"],
    ],
  },
] as const;

const STEPS_ID = [
  {
    count: "01 / 03",
    title: "KAMULAH PESANNYA.",
    body: "Packet bergerak maju. Arahkan melewati jaringan dan terus melaju.",
    chips: [
      ["W / ↑", "AKSELERASI"],
      ["A D / ← →", "BELOK"],
      ["S / ↓", "REM"],
    ],
    touchChips: [
      ["MAJU", "AKSELERASI"],
      ["◀ ▶", "BELOK"],
      ["REM", "PERLAMBAT"],
    ],
  },
  {
    count: "02 / 03",
    title: "SATU PERSEN.",
    body: "Baterai terus menipis. Boost cepat tetapi boros. Booster biru memulihkan daya; pelacak merah menguras daya dan privasi.",
    chips: [
      ["SHIFT", "BOOST"],
      ["BIRU", "DAYA"],
      ["MERAH", "BAHAYA"],
    ],
    touchChips: [
      ["BOOST", "TAHAN"],
      ["BIRU", "DAYA"],
      ["MERAH", "BAHAYA"],
    ],
  },
  {
    count: "03 / 03",
    title: "BACA JARINGAN.",
    body: "Tekan Spasi untuk memindai. Lewati pusat relay untuk lonjakan kecepatan. Pilih jalur privat atau jalur publik yang lebih cepat.",
    chips: [
      ["SPACE", "PINDAI"],
      ["TENGAH", "RELAY SEMPURNA"],
      ["ESC", "JEDA"],
    ],
    touchChips: [
      ["PINDAI", "KETUK"],
      ["TENGAH", "RELAY SEMPURNA"],
      ["JEDA", "KETUK"],
    ],
  },
] as const;

export function FirstRunTutorial() {
  const [step, setStep] = useState(0);
  const completeTutorial = useGameStore((state) => state.completeTutorial);
  const goMenu = useGameStore((state) => state.goMenu);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  const current = language === "id" ? STEPS_ID[step] : STEPS[step];
  return (
    <section className="tutorial-screen" aria-label="First run guide">
      <div className="tutorial-visual" aria-hidden="true">
        <div className="tutorial-orbit">
          <div className="tutorial-packet" />
        </div>
        <span>SECURE CHANNEL / {current.count}</span>
      </div>
      <div className="tutorial-content">
        <span className="micro-label">
          {t.guide} <i>{"//"}</i> {current.count}
        </span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="tutorial-chips desktop-instructions">
          {current.chips.map(([key, label]) => (
            <div key={label}>
              <kbd>{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="tutorial-chips touch-instructions">
          {current.touchChips.map(([key, label]) => (
            <div key={`${key}-${label}`}>
              <kbd>{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="tutorial-progress" aria-hidden="true">
          {STEPS.map((_, index) => (
            <span className={index <= step ? "active" : ""} key={index} />
          ))}
        </div>
        <GameButton
          variant="primary"
          onClick={() =>
            step === STEPS.length - 1 ? completeTutorial() : setStep(step + 1)
          }
        >
          {step === STEPS.length - 1 ? t.understood : t.next}{" "}
          <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton onClick={goMenu}>← {t.mainMenu}</GameButton>
      </div>
    </section>
  );
}

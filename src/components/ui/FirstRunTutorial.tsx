"use client";

import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/store/gameStore";

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
  },
] as const;

export function FirstRunTutorial() {
  const [step, setStep] = useState(0);
  const completeTutorial = useGameStore((state) => state.completeTutorial);
  const goMenu = useGameStore((state) => state.goMenu);
  const current = STEPS[step];
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
          FIELD GUIDE <i>{"//"}</i> {current.count}
        </span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="tutorial-chips">
          {current.chips.map(([key, label]) => (
            <div key={label}>
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
          {step === STEPS.length - 1 ? "UNDERSTOOD" : "NEXT"}{" "}
          <span aria-hidden="true">↗</span>
        </GameButton>
        <GameButton onClick={goMenu}>← MAIN MENU</GameButton>
      </div>
    </section>
  );
}

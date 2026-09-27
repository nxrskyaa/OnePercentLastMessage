"use client";

import { useEffect, useState } from "react";
import { playSound } from "@/lib/audio";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function Countdown() {
  const [step, setStep] = useState(0);
  const startRun = useGameStore((state) => state.startRun);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  useEffect(() => {
    const timers = [650, 1300, 1950].map((delay, index) =>
      window.setTimeout(() => {
        if (index === 2) {
          playSound("start");
          startRun();
        } else {
          playSound("click");
          setStep(index + 1);
        }
      }, delay),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [startRun]);
  return (
    <section className="countdown-screen" aria-label="Starting transmission">
      <div className="countdown-core">
        <span className="micro-label">{t.encrypting}</span>
        <strong key={step}>{3 - step}</strong>
        <span>{t.routeReady}</span>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { playSound } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";

export function Countdown() {
  const [step, setStep] = useState(0);
  const startRun = useGameStore((state) => state.startRun);
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
        <span className="micro-label">ENCRYPTING MESSAGE...</span>
        <strong key={step}>{3 - step}</strong>
        <span>ROUTE ESTABLISHED</span>
      </div>
    </section>
  );
}

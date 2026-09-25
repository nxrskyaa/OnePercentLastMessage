"use client";

import Image from "next/image";
import type { GamePhase } from "@/store/gameStore";
import { GameButton } from "@/components/ui/GameButton";

export function BootSequence({
  phase,
  onSkip,
}: {
  phase: GamePhase;
  onSkip: () => void;
}) {
  return (
    <section className="boot-screen" aria-label="Game opening">
      <div className="boot-cross boot-cross--a" />
      <div className="boot-cross boot-cross--b" />
      {phase === "loading" && (
        <div className="boot-center">
          <Image
            className="boot-logo"
            src="/brand/dlicom-mark-reference.jpg"
            width={58}
            height={58}
            alt="Dlicom logo"
            unoptimized
          />
          <span className="micro-label">DLICOM NETWORK / NXR GAME</span>
          <strong>INITIALIZING NETWORK...</strong>
          <span className="boot-line" />
        </div>
      )}
      {phase === "ident" && (
        <div className="boot-center boot-ident" key="ident">
          <Image
            className="boot-mascot"
            src="/brand/dili-blue-cutout.png"
            width={190}
            height={190}
            alt="DILI mascot"
            unoptimized
          />
          <span className="micro-label">DILI IS CONNECTING YOUR MESSAGE</span>
          <strong>DLICOM</strong>
          <span className="boot-line" />
        </div>
      )}
      {phase === "title" && (
        <div className="boot-center boot-title" key="title">
          <strong>
            1<span>%</span>
          </strong>
          <b>LAST MESSAGE</b>
          <p>One battery percent. One message left.</p>
        </div>
      )}
      {phase !== "loading" && (
        <GameButton className="boot-skip" onClick={onSkip}>
          SKIP INTRO ↗
        </GameButton>
      )}
    </section>
  );
}

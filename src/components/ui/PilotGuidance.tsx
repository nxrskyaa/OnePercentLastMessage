"use client";

import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export function PilotGuidance() {
  const cue = useGameStore((s) => s.pilotCue);
  const id = useSettingsStore((s) => s.language === "id");
  if (!cue) return null;
  const names = {
    relay: id ? "RELAY" : "RELAY",
    booster: id ? "DAYA" : "POWER",
    shutter: id ? "CELAH" : "APERTURE",
    curtain: id ? "CELAH" : "APERTURE",
    rotor: "ROTOR",
    receiver: id ? "PENERIMA" : "RECEIVER",
    tip: "TIP",
    public: "PUBLIC",
    safe: "SAFE",
    tracker: id ? "HINDARI MERAH" : "AVOID RED",
  };
  const aligned = cue.horizontal === 0 && cue.vertical === 0;
  return (
    <div
      className={`pilot-guidance ${aligned ? "pilot-guidance--aligned" : ""}`}
      aria-label={
        id ? "Arah menuju target berikutnya" : "Direction to the next target"
      }
    >
      <header>
        <span>◇ {names[cue.type]}</span>
        <b>{cue.distance} m</b>
      </header>
      <div>
        {cue.horizontal !== 0 && (
          <span>
            <kbd className="desktop-instructions">
              {cue.horizontal < 0 ? "A" : "D"}
            </kbd>
            {cue.horizontal < 0 ? "←" : "→"}
          </span>
        )}
        {cue.vertical !== 0 && (
          <span>
            <kbd className="desktop-instructions">
              {cue.vertical > 0 ? "Q" : "E"}
            </kbd>
            {cue.vertical > 0 ? "↑" : "↓"}
          </span>
        )}
        {aligned && <span>✓ {id ? "PERTAHANKAN" : "HOLD YOUR LINE"}</span>}
      </div>
    </div>
  );
}

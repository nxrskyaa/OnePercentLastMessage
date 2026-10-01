"use client";

import { GameButton } from "@/components/ui/GameButton";
import { copyFor } from "@/game/copy";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

const NETWORK = [
  ["relay", "RELAY RING", "Hit its center for points and a speed burst."],
  [
    "tracker",
    "TRACKER",
    "Red rings drain privacy and battery. Skim the edge for a near miss.",
  ],
  ["booster", "SIGNAL BOOSTER", "Bright cyan nodes restore 0.08% battery."],
  ["public", "PUBLIC RELAY", "The right gate is faster, but costs privacy."],
  ["tip", "TIP NODE", "Collect gold packets quickly to build a combo."],
  [
    "curtain",
    "SKY LOCK",
    "Climb or dive through the bright moving opening. Clean passes earn points.",
  ],
  [
    "tracker",
    "ROTOR",
    "Time your approach through the gaps between rotating blades.",
  ],
] as const;
const NETWORK_ID = [
  [
    "relay",
    "CINCIN RELAY",
    "Lewati pusatnya untuk poin dan lonjakan kecepatan.",
  ],
  [
    "tracker",
    "PELACAK",
    "Cincin merah menguras privasi dan baterai. Lewati tepinya untuk near miss.",
  ],
  ["booster", "PENGUAT SINYAL", "Node biru terang memulihkan 0,08% baterai."],
  [
    "public",
    "RELAY PUBLIK",
    "Gerbang kanan lebih cepat, tetapi mengurangi privasi.",
  ],
  ["tip", "NODE TIP", "Kumpulkan paket emas dengan cepat untuk membuat kombo."],
  [
    "curtain",
    "GERBANG LANGIT",
    "Naik atau turun melalui celah terang yang bergerak. Lewat bersih memberi poin.",
  ],
  [
    "tracker",
    "ROTOR",
    "Atur waktu masuk melalui celah di antara bilah yang berputar.",
  ],
] as const;

export function HowToPlay() {
  const closePanel = useGameStore((state) => state.closePanel);
  const language = useSettingsStore((state) => state.language);
  const t = copyFor(language);
  const id = language === "id";
  return (
    <section className="panel-screen" aria-label="How to play">
      <div className="panel-heading">
        <span className="micro-label">FIELD MANUAL / 01</span>
        <GameButton onClick={closePanel}>{t.close} ✕</GameButton>
      </div>
      <h2>
        {id ? "CARA" : "HOW TO"} <em>{id ? "BERMAIN" : "PLAY"}</em>
      </h2>
      <p className="panel-lede">
        {id
          ? "Kirim pesan terakhirmu sebelum baterai habis."
          : "Deliver your last message before the battery reaches zero."}
      </p>
      <div className="guide-grid">
        <div className="guide-section desktop-instructions">
          <span className="micro-label">{t.controls}</span>
          <div className="guide-control">
            <kbd>W / ↑</kbd>
            <span>{id ? "Akselerasi" : "Accelerate"}</span>
          </div>
          <div className="guide-control">
            <kbd>A D / ← →</kbd>
            <span>{id ? "Belok" : "Steer"}</span>
          </div>
          <div className="guide-control">
            <kbd>S / ↓</kbd>
            <span>{id ? "Rem" : "Brake"}</span>
          </div>
          <div className="guide-control">
            <kbd>Q / E</kbd>
            <span>{id ? "Naik / Turun" : "Climb / Dive"}</span>
          </div>
          <div className="guide-control">
            <kbd>SHIFT</kbd>
            <span>{id ? "Boost · boros daya" : "Boost · costly"}</span>
          </div>
          <div className="guide-control">
            <kbd>SPACE</kbd>
            <span>{id ? "Pindai jaringan" : "Network scan"}</span>
          </div>
          <div className="guide-control">
            <kbd>ESC</kbd>
            <span>{id ? "Jeda" : "Pause"}</span>
          </div>
        </div>
        <div className="guide-section touch-instructions">
          <span className="micro-label">
            {id ? "KONTROL SENTUH" : "TOUCH CONTROLS"}
          </span>
          <div className="guide-control">
            <kbd>◀ ▶</kbd>
            <span>{id ? "Belok" : "Steer"}</span>
          </div>
          <div className="guide-control">
            <kbd>THRUST</kbd>
            <span>{id ? "Akselerasi" : "Accelerate"}</span>
          </div>
          <div className="guide-control">
            <kbd>BRAKE</kbd>
            <span>{id ? "Perlambat" : "Slow down"}</span>
          </div>
          <div className="guide-control">
            <kbd>↑ ↓</kbd>
            <span>
              {id
                ? "Naik / Turun (tombol kiri)"
                : "Climb / Dive (left controls)"}
            </span>
          </div>
          <div className="guide-control">
            <kbd>BOOST</kbd>
            <span>
              {id
                ? "Tahan untuk cepat · boros daya"
                : "Hold for speed · costly"}
            </span>
          </div>
          <div className="guide-control">
            <kbd>SCAN</kbd>
            <span>
              {id
                ? "Ketuk untuk melihat jaringan"
                : "Tap to reveal the network"}
            </span>
          </div>
          <div className="guide-control">
            <kbd>PAUSE</kbd>
            <span>
              {id ? "Ketuk tombol kanan atas" : "Tap the top-right button"}
            </span>
          </div>
        </div>
        <div className="guide-section">
          <span className="micro-label">
            {id ? "SINYAL JARINGAN" : "NETWORK SIGNALS"}
          </span>
          {(id ? NETWORK_ID : NETWORK).map(([type, title, description]) => (
            <div className="network-item" key={title}>
              <span className={`node-icon node-icon--${type}`} />
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <GameButton variant="primary" onClick={closePanel}>
        {t.returnMenu} <span aria-hidden="true">↗</span>
      </GameButton>
    </section>
  );
}

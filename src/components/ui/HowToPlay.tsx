"use client";

import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/store/gameStore";

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
] as const;

export function HowToPlay() {
  const closePanel = useGameStore((state) => state.closePanel);
  return (
    <section className="panel-screen" aria-label="How to play">
      <div className="panel-heading">
        <span className="micro-label">FIELD MANUAL / 01</span>
        <GameButton onClick={closePanel}>CLOSE ✕</GameButton>
      </div>
      <h2>
        HOW TO <em>PLAY</em>
      </h2>
      <p className="panel-lede">
        Deliver your last message before the battery reaches zero.
      </p>
      <div className="guide-grid">
        <div className="guide-section desktop-instructions">
          <span className="micro-label">CONTROLS</span>
          <div className="guide-control">
            <kbd>W / ↑</kbd>
            <span>Accelerate</span>
          </div>
          <div className="guide-control">
            <kbd>A D / ← →</kbd>
            <span>Steer</span>
          </div>
          <div className="guide-control">
            <kbd>S / ↓</kbd>
            <span>Brake</span>
          </div>
          <div className="guide-control">
            <kbd>SHIFT</kbd>
            <span>Boost · costly</span>
          </div>
          <div className="guide-control">
            <kbd>SPACE</kbd>
            <span>Network scan</span>
          </div>
          <div className="guide-control">
            <kbd>ESC</kbd>
            <span>Pause</span>
          </div>
        </div>
        <div className="guide-section touch-instructions">
          <span className="micro-label">TOUCH CONTROLS</span>
          <div className="guide-control">
            <kbd>◀ ▶</kbd>
            <span>Steer</span>
          </div>
          <div className="guide-control">
            <kbd>THRUST</kbd>
            <span>Accelerate</span>
          </div>
          <div className="guide-control">
            <kbd>BRAKE</kbd>
            <span>Slow down</span>
          </div>
          <div className="guide-control">
            <kbd>BOOST</kbd>
            <span>Hold for speed · costly</span>
          </div>
          <div className="guide-control">
            <kbd>SCAN</kbd>
            <span>Tap to reveal the network</span>
          </div>
          <div className="guide-control">
            <kbd>PAUSE</kbd>
            <span>Tap the top-right button</span>
          </div>
        </div>
        <div className="guide-section">
          <span className="micro-label">NETWORK SIGNALS</span>
          {NETWORK.map(([type, title, description]) => (
            <div className="network-item" key={type}>
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
        BACK TO MENU <span aria-hidden="true">↗</span>
      </GameButton>
    </section>
  );
}

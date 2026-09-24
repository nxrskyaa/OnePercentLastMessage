"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { GAME_CONFIG } from "@/game/config";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => <div className="canvas-loading">INITIALIZING NETWORK…</div>,
});

function BatteryReadout({ battery }: { battery: number }) {
  const critical = battery < 0.2;
  return (
    <div className={`battery-readout ${critical ? "is-critical" : ""}`}>
      <span className="eyebrow">BATTERY REMAINING</span>
      <strong>{battery.toFixed(2)}%</strong>
      <div className="battery-track" aria-hidden="true">
        <span style={{ width: `${battery * 100}%` }} />
      </div>
    </div>
  );
}

export function GameApp() {
  const phase = useGameStore((state) => state.phase);
  const battery = useGameStore((state) => state.battery);
  const elapsed = useGameStore((state) => state.elapsed);
  const distance = useGameStore((state) => state.distance);
  const boosting = useGameStore((state) => state.boosting);
  const bestTime = useGameStore((state) => state.bestTime);
  const startRun = useGameStore((state) => state.startRun);
  const resume = useGameStore((state) => state.resume);
  const pause = useGameStore((state) => state.pause);

  useEffect(() => {
    useGameStore.getState().loadBestTime();
    const onVisibilityChange = () => {
      if (document.hidden) useGameStore.getState().pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <main className="game-shell">
      <div className="scene-layer">
        <GameCanvas />
      </div>
      <div className="vignette" aria-hidden="true" />

      {phase === "menu" && (
        <section className="menu-panel" aria-label="Game start">
          <div className="brand-row">
            <span className="brand-mark">{"//"}</span> DLICOM AI GAME JAM{" "}
            <span>001 / 001</span>
          </div>
          <div className="menu-content">
            <div className="incoming">
              <span className="signal-dot" /> INCOMING / PRIORITY ONE
            </div>
            <h1>
              <span>
                1<span className="percent">%</span>
              </span>
              <small>LAST MESSAGE</small>
            </h1>
            <p className="tagline">
              One battery percent.
              <br />
              One message left.
            </p>
            <div className="message-card">
              <span className="eyebrow">ONE MESSAGE QUEUED</span>
              <div className="message-line">
                <span>FROM</span>
                <strong>MOM</strong>
              </div>
              <div className="message-line">
                <span>MESSAGE</span>
                <strong>“where are you?”</strong>
              </div>
              <p>Deliver your reply before the signal disappears.</p>
            </div>
            <button className="primary-button" onClick={startRun}>
              TRANSMIT <span>→</span>
            </button>
            <div className="menu-foot">
              <span>A network survival game.</span>
              <span>WASD / ARROWS · SHIFT · ESC</span>
            </div>
            {bestTime !== null && (
              <div className="best-time">
                BEST DELIVERY <strong>{formatTime(bestTime)}</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {(phase === "playing" || phase === "paused") && (
        <div className="hud" aria-live="off">
          <header className="hud-top">
            <BatteryReadout battery={battery} />
            <div className="destination-readout">
              <span className="eyebrow">DELIVER TO</span>
              <strong>{GAME_CONFIG.destination.name}</strong>
              <span>{Math.ceil(distance)}m TO RECEIVER</span>
            </div>
            <div className="time-readout">
              <span className="eyebrow">TIME ELAPSED</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
          </header>
          <div className="reticle" aria-hidden="true">
            <span />
            <span />
          </div>
          <footer className="hud-bottom">
            <div>
              <span className="small-key">W</span> ACCELERATE{" "}
              <span className="small-key">A</span>
              <span className="small-key">D</span> STEER{" "}
              <span className="small-key">S</span> BRAKE
            </div>
            <div className={boosting ? "boost-label active" : "boost-label"}>
              <span className="small-key">SHIFT</span> BOOST
            </div>
            <button className="text-button" onClick={pause}>
              ESC / PAUSE
            </button>
          </footer>
        </div>
      )}

      {phase === "paused" && (
        <section className="overlay-panel pause-panel" aria-label="Paused">
          <span className="eyebrow">TRANSMISSION HELD</span>
          <h2>PAUSED</h2>
          <p>Your battery is holding. Resume when ready.</p>
          <button className="primary-button" onClick={resume}>
            RESUME <span>→</span>
          </button>
          <button className="text-button" onClick={startRun}>
            RESTART TRANSMISSION
          </button>
        </section>
      )}

      {(phase === "success" || phase === "failed") && (
        <section
          className={`overlay-panel results-panel ${phase}`}
          aria-label="Run result"
        >
          <span className="eyebrow">
            TRANSMISSION / {phase === "success" ? "COMPLETE" : "INTERRUPTED"}
          </span>
          <h2>{phase === "success" ? "MESSAGE\nDELIVERED" : "SIGNAL\nLOST"}</h2>
          <p>
            {phase === "success"
              ? "Your message reached Mom."
              : "The battery died before your message arrived."}
          </p>
          <div className="results-stats">
            <div>
              <span>TIME</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
            <div>
              <span>BATTERY</span>
              <strong>{battery.toFixed(2)}%</strong>
            </div>
            <div>
              <span>DISTANCE LEFT</span>
              <strong>{Math.ceil(distance)}m</strong>
            </div>
          </div>
          <button className="primary-button" onClick={startRun}>
            RETRY <span>↗</span>
          </button>
          {bestTime !== null && (
            <div className="best-time">
              BEST DELIVERY <strong>{formatTime(bestTime)}</strong>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

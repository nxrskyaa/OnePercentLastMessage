"use client";

import { useMemo, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { ResultCardDialog } from "@/components/ui/ResultCardDialog";
import { MISSIONS } from "@/game/missions";
import { privacyRank } from "@/game/scoring";
import { formatTime } from "@/lib/format";
import { useGameStore } from "@/store/gameStore";

export function ResultsScreen() {
  const phase = useGameStore((state) => state.phase);
  const missionIndex = useGameStore((state) => state.missionIndex);
  const elapsed = useGameStore((state) => state.elapsed);
  const battery = useGameStore((state) => state.battery);
  const privacy = useGameStore((state) => state.privacy);
  const distance = useGameStore((state) => state.distance);
  const score = useGameStore((state) => state.score);
  const newBest = useGameStore((state) => state.newBest);
  const awards = useGameStore((state) => state.awards);
  const trackerHits = useGameStore((state) => state.trackerHits);
  const tipsCollected = useGameStore((state) => state.tipsCollected);
  const retry = useGameStore((state) => state.retry);
  const openBriefing = useGameStore((state) => state.openBriefing);
  const goMenu = useGameStore((state) => state.goMenu);
  const [copyStatus, setCopyStatus] = useState("COPY RESULT");
  const [cardOpen, setCardOpen] = useState(false);
  const success = phase === "success";
  const mission = MISSIONS[missionIndex];
  const cardData = useMemo(
    () => ({
      success,
      receiver: mission.receiver,
      elapsed,
      battery,
      privacy,
      score,
      trackerHits,
      tipsCollected,
    }),
    [
      success,
      mission.receiver,
      elapsed,
      battery,
      privacy,
      score,
      trackerHits,
      tipsCollected,
    ],
  );
  const resultText = `${success ? "MESSAGE DELIVERED" : "SIGNAL LOST"}.\nTo: ${mission.receiver}\nBattery left: ${battery.toFixed(2)}%\nPrivacy: ${Math.round(privacy)}%\nScore: ${score.toLocaleString()}\n\n1% — Last Message\nBuilt by @nxrskyaa\n#LastMessage #DlicomGameJam`;
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopyStatus("COPIED TO CLIPBOARD");
    } catch {
      setCopyStatus("COPY UNAVAILABLE");
    }
  };
  return (
    <section
      className={`results-screen ${success ? "results-screen--success" : "results-screen--failed"}`}
      aria-label="Run result"
    >
      <div className="result-heading">
        <span className="micro-label">1% / LAST MESSAGE</span>
      </div>
      <div className="result-body">
        <div className="result-intro">
          <div className="result-seal" aria-hidden="true">
            {success ? "◇" : "×"}
          </div>
          <div>
            {newBest && (
              <span className="personal-best">✦ NEW PERSONAL BEST</span>
            )}
            <h2>
              {success ? (
                <>
                  MESSAGE
                  <br />
                  <em>DELIVERED.</em>
                </>
              ) : (
                <>
                  SIGNAL
                  <br />
                  <em>LOST.</em>
                </>
              )}
            </h2>
            <p>
              {success
                ? `Your message reached ${mission.receiver}.`
                : `Battery depleted ${Math.ceil(distance)}m from ${mission.receiver}.`}
            </p>
          </div>
        </div>
        <div className="result-score">
          <span>SCORE</span>
          <strong>{score.toLocaleString()}</strong>
          <small>{privacyRank(privacy)}</small>
        </div>
        <div className="result-grid">
          <div>
            <span>TIME</span>
            <strong>{formatTime(elapsed)}</strong>
          </div>
          <div>
            <span>BATTERY</span>
            <strong>{battery.toFixed(2)}%</strong>
          </div>
          <div>
            <span>PRIVACY</span>
            <strong>{Math.round(privacy)}%</strong>
          </div>
          <div>
            <span>TRACKERS</span>
            <strong>{trackerHits}</strong>
          </div>
        </div>
        {awards.length > 0 && (
          <div className="result-awards">
            {awards.map((award) => (
              <span key={award}>✦ {award}</span>
            ))}
          </div>
        )}
        <div className="result-actions">
          <GameButton variant="primary" onClick={retry}>
            RETRY <span aria-hidden="true">↗</span>
          </GameButton>
          <GameButton variant="primary" onClick={() => setCardOpen(true)}>
            DOWNLOAD CARD <span aria-hidden="true">↓</span>
          </GameButton>
          <GameButton variant="menu" onClick={() => openBriefing(true)}>
            NEW MESSAGE <span aria-hidden="true">→</span>
          </GameButton>
        </div>
        <div className="result-secondary">
          <GameButton onClick={goMenu}>MAIN MENU</GameButton>
          <GameButton onClick={copyResult}>{copyStatus}</GameButton>
        </div>
      </div>
      {cardOpen && (
        <ResultCardDialog data={cardData} onClose={() => setCardOpen(false)} />
      )}
    </section>
  );
}

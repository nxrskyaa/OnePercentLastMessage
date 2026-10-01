"use client";

import { useEffect, useRef, useState } from "react";
import { GameApp } from "@/components/ui/GameApp";
import { gameInput } from "@/game/input";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

type Sample = {
  seconds: number;
  battery: number;
  privacy: number;
  elapsed: number;
  distance: number;
  boosting: boolean;
  feedback: string | null;
  phase: string;
};

/** Local film capture, with the production renderer and unmodified gameplay rules. */
export function CaptureSession() {
  const [status, setStatus] = useState("Ready: record a scripted flight");
  const [stage, setStage] = useState(0);
  const [limit, setLimit] = useState(150);
  const [hidden, setHidden] = useState(false);
  const [downloads, setDownloads] = useState<{
    movie: string;
    data: string;
  } | null>(null);
  const running = useRef(false);
  const stop = useRef<() => void>(() => {});
  const urls = useRef<string[]>([]);
  useEffect(
    () => () => {
      stop.current();
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function record() {
    const canvas = document.querySelector<HTMLCanvasElement>(
      ".game-canvas canvas",
    );
    if (!canvas || running.current) return;
    if (!window.MediaRecorder) {
      setStatus("MediaRecorder is unavailable in this browser.");
      return;
    }
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
    setDownloads(null);
    useSettingsStore
      .getState()
      .update({ quality: "medium", mute: true, language: "en" });
    const state = useGameStore.getState();
    state.selectStage(stage);
    state.startRun();
    const stream = canvas.captureStream(30);
    const mimeType = [
      "video/webm;codecs=vp8",
      "video/webm;codecs=vp9",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 12_000_000,
    });
    const chunks: Blob[] = [];
    const samples: Sample[] = [];
    const started = performance.now();
    let nextSample = 0;
    let frame = 0;
    let endedAt: number | null = null;
    running.current = true;
    const finish = () => {
      if (!running.current) return;
      running.current = false;
      cancelAnimationFrame(frame);
      gameInput.clear();
      if (recorder.state !== "inactive") recorder.stop();
    };
    stop.current = finish;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => {
      finish();
      setStatus("Recording failed. Try another browser.");
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const result = useGameStore.getState();
      const movie = URL.createObjectURL(
        new Blob(chunks, { type: mimeType ?? "video/webm" }),
      );
      const data = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              {
                stage,
                scriptedControls: true,
                sampleRate: 10,
                samples,
                result: {
                  phase: result.phase,
                  score: result.score,
                  battery: result.battery,
                  privacy: result.privacy,
                  elapsed: result.elapsed,
                  trackers: result.trackerHits,
                  boosters: result.boostersUsed,
                },
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      );
      urls.current = [movie, data];
      setDownloads({ movie, data });
      setStatus(
        `Finished: ${result.phase} · ${Math.round(result.elapsed)}s · score ${result.score}`,
      );
      result.pause();
    };
    recorder.start(1000);
    function tick() {
      const now = (performance.now() - started) / 1000;
      const game = useGameStore.getState();
      if (now >= nextSample) {
        samples.push({
          seconds: now,
          battery: game.battery,
          privacy: game.privacy,
          elapsed: game.elapsed,
          distance: game.distance,
          boosting: game.boosting,
          feedback: game.feedback?.title ?? null,
          phase: game.phase,
        });
        nextSample = now + 0.1;
        setStatus(
          `Recording stage ${stage + 1}: ${Math.floor(now)}s / ${limit}s`,
        );
      }
      gameInput.clear();
      if (game.phase === "playing") {
        const cue = game.pilotCue;
        gameInput.pressed.current.add("w");
        if (cue?.horizontal)
          gameInput.pressed.current.add(cue.horizontal < 0 ? "a" : "d");
        if (cue?.vertical)
          gameInput.pressed.current.add(cue.vertical > 0 ? "q" : "e");
        // Brief nitro runs in clear stretches; never change the course or collision rules.
        if (
          game.elapsed % 22 > 8 &&
          game.elapsed % 22 < 11 &&
          (cue?.distance ?? 0) > 45
        )
          gameInput.pressed.current.add("shift");
        if (game.elapsed % 18 < 0.15 && game.scanCooldown === 0)
          gameInput.scanQueuedRef.current = true;
      } else if (game.phase === "success" || game.phase === "failed") {
        endedAt ??= now;
      }
      if (now >= limit || (endedAt !== null && now - endedAt > 2)) finish();
      else if (running.current) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  return (
    <>
      <GameApp />
      {!hidden && (
        <aside
          style={{
            position: "fixed",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "#f7efd8",
            color: "#102637",
            padding: "8px 14px",
            font: "13px Arial",
          }}
        >
          <b>LOCAL CAPTURE · SCRIPTED INPUT</b> {status}{" "}
          <label>
            Stage{" "}
            <select
              value={stage}
              onChange={(e) => setStage(Number(e.target.value))}
            >
              <option value={0}>Tidal</option>
              <option value={1}>Prism</option>
              <option value={2}>Solar</option>
            </select>
          </label>{" "}
          <label>
            Seconds{" "}
            <input
              aria-label="Capture seconds"
              type="number"
              min={5}
              max={180}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ width: 50 }}
            />
          </label>{" "}
          <button onClick={record}>Record flight</button>{" "}
          <button onClick={() => stop.current()}>Stop</button>{" "}
          <button onClick={() => setHidden(true)}>Hide capture tools</button>
          {downloads && (
            <>
              {" "}
              <a href={downloads.movie} download={`stage-${stage + 1}.webm`}>
                Download recording
              </a>{" "}
              <a href={downloads.data} download={`stage-${stage + 1}.json`}>
                Download telemetry
              </a>
            </>
          )}
        </aside>
      )}
    </>
  );
}

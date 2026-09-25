"use client";

import { useEffect, useRef, useState } from "react";
import { drawResultCard, type ResultCardData } from "@/game/resultCard";

export function ResultCardDialog({
  data,
  onClose,
}: {
  data: ResultCardData;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const downloadRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [downloadStatus, setDownloadStatus] = useState("DOWNLOAD PNG");

  useEffect(() => {
    let mounted = true;
    const mascot = new Image();
    const logo = new Image();
    mascot.src = "/brand/dili-blue-cutout.png";
    logo.src = "/brand/dlicom-mark-reference.jpg";
    Promise.all([mascot.decode(), logo.decode()])
      .then(() => {
        if (!mounted || !canvasRef.current) return;
        drawResultCard(canvasRef.current, data, mascot, logo);
        setStatus("ready");
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, [data]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (status === "ready") downloadRef.current?.focus();
  }, [status]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || status !== "ready") return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloadStatus("DOWNLOAD UNAVAILABLE");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const receiver = data.receiver.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.href = url;
      link.download = `last-message-${receiver}-${data.score}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setDownloadStatus("PNG SAVED");
    }, "image/png");
  };

  return (
    <div className="result-card-overlay" role="presentation" onClick={onClose}>
      <section
        className="result-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Download your result card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="result-card-preview">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1350}
            role="img"
            aria-label={`${data.success ? "Message delivered" : "Signal lost"} result card preview`}
          />
          {status !== "ready" && (
            <div className="result-card-loading" role="status">
              {status === "loading"
                ? "PREPARING YOUR TRANSMISSION CARD…"
                : "CARD ART FAILED TO LOAD. PLEASE TRY AGAIN."}
            </div>
          )}
        </div>
        <div className="result-card-side">
          <div className="result-card-brand">
            <span className="micro-label">DLICOM AI GAME JAM / NXR</span>
            <button type="button" onClick={onClose} aria-label="Close card">
              ×
            </button>
          </div>
          <div>
            <span className="micro-label">TRANSMISSION RECORD / 01</span>
            <h3>
              Your run,
              <br />
              <em>on record.</em>
            </h3>
            <p>
              A 1080 × 1350 PNG of your actual result, with the Dlicom mark and
              Dili mascot.
            </p>
          </div>
          <div className="result-card-side-actions">
            <button
              ref={downloadRef}
              type="button"
              onClick={download}
              disabled={status !== "ready"}
            >
              {downloadStatus} <span aria-hidden="true">↓</span>
            </button>
            <button type="button" onClick={onClose}>
              BACK TO RESULTS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

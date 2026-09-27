"use client";

import { useEffect, useRef, useState } from "react";
import { drawResultCard, type ResultCardData } from "@/game/resultCard";
import { copyFor } from "@/game/copy";

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
  const [downloadStatus, setDownloadStatus] = useState<
    "ready" | "saved" | "error"
  >("ready");
  const t = copyFor(data.language);

  useEffect(() => {
    let mounted = true;
    const mascot = new Image();
    const logo = new Image();
    const avatar = new Image();
    mascot.src = "/brand/dili-blue-cutout.png";
    logo.src = "/brand/dlicom-mark-reference.jpg";
    if (data.avatarUrl) {
      avatar.crossOrigin = "anonymous";
      avatar.referrerPolicy = "no-referrer";
      avatar.src = data.avatarUrl;
    }
    const avatarReady = data.avatarUrl
      ? Promise.race<HTMLImageElement | null>([
          avatar
            .decode()
            .then(() => avatar)
            .catch(() => null),
          new Promise<null>((resolve) =>
            window.setTimeout(() => resolve(null), 3500),
          ),
        ])
      : Promise.resolve(null);
    Promise.all([mascot.decode(), logo.decode(), avatarReady])
      .then(([, , photo]) => {
        if (!mounted || !canvasRef.current) return;
        drawResultCard(canvasRef.current, data, mascot, logo, photo);
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
        setDownloadStatus("error");
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
      setDownloadStatus("saved");
    }, "image/png");
  };

  return (
    <div className="result-card-overlay" role="presentation" onClick={onClose}>
      <section
        className="result-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t.downloadCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="result-card-preview">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1350}
            role="img"
            aria-label={`${data.success ? t.delivered : t.lost} ${t.downloadCard}`}
          />
          {status !== "ready" && (
            <div className="result-card-loading" role="status">
              {status === "loading" ? t.cardPreparing : t.cardError}
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
            <h3>{t.cardTitle}</h3>
            <p>{t.cardDetail}</p>
          </div>
          <div className="result-card-side-actions">
            <button
              ref={downloadRef}
              type="button"
              onClick={download}
              disabled={status !== "ready"}
            >
              {downloadStatus === "ready"
                ? t.cardReady
                : downloadStatus === "saved"
                  ? t.cardSaved
                  : t.cardUnavailable}{" "}
              <span aria-hidden="true">↓</span>
            </button>
            <button type="button" onClick={onClose}>
              {t.cardBack}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

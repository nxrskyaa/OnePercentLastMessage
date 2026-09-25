"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gameInput } from "@/game/input";
import { useGameStore } from "@/store/gameStore";

function HoldButton({
  input,
  label,
  symbol,
  tone = "neutral",
}: {
  input: string;
  label: string;
  symbol: string;
  tone?: "neutral" | "cyan" | "amber";
}) {
  const pointers = useRef(new Set<number>());
  const [active, setActive] = useState(false);
  useEffect(
    () => () => {
      pointers.current.clear();
      gameInput.pressed.current.delete(input);
    },
    [input],
  );
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      gameInput.pressed.current.delete(input);
      setActive(false);
    }
  };
  return (
    <button
      type="button"
      className={`touch-button touch-button--${tone} ${active ? "is-active" : ""}`}
      aria-label={label}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.add(event.pointerId);
        gameInput.pressed.current.add(input);
        setActive(true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <strong aria-hidden="true">{symbol}</strong>
      <span>{label}</span>
    </button>
  );
}

function ScanButton() {
  const cooldown = useGameStore((state) => state.scanCooldown);
  const ready = cooldown <= 0;
  return (
    <button
      type="button"
      className="touch-button touch-button--scan"
      aria-label={
        ready ? "Scan network" : `Scan ready in ${cooldown.toFixed(1)} seconds`
      }
      disabled={!ready}
      onPointerDown={(event) => {
        event.preventDefault();
        gameInput.scanQueuedRef.current = true;
      }}
      onClick={() => {
        gameInput.scanQueuedRef.current = true;
      }}
    >
      <strong aria-hidden="true">◎</strong>
      <span>{ready ? "SCAN" : `${cooldown.toFixed(0)}s`}</span>
    </button>
  );
}

export function MobileControls() {
  return (
    <div className="mobile-controls" aria-label="Touch flight controls">
      <div className="mobile-control-cluster">
        <span className="mobile-control-caption">STEER</span>
        <div className="mobile-control-row">
          <HoldButton input="a" label="Left" symbol="◀" />
          <HoldButton input="d" label="Right" symbol="▶" />
        </div>
      </div>
      <div className="mobile-control-cluster mobile-control-cluster--drive">
        <span className="mobile-control-caption">FLIGHT</span>
        <div className="mobile-control-row">
          <HoldButton input="s" label="Brake" symbol="−" />
          <ScanButton />
        </div>
        <div className="mobile-control-row">
          <HoldButton input="w" label="Thrust" symbol="↑" tone="cyan" />
          <HoldButton input="shift" label="Boost" symbol="⇧" tone="amber" />
        </div>
      </div>
    </div>
  );
}

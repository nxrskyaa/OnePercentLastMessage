"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gameInput } from "@/game/input";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

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
  const language = useSettingsStore((state) => state.language);
  const ready = cooldown <= 0;
  return (
    <button
      type="button"
      className="touch-button touch-button--scan"
      aria-label={
        ready
          ? language === "id"
            ? "Pindai jaringan"
            : "Scan network"
          : `Scan ready in ${cooldown.toFixed(1)} seconds`
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
      <span>
        {ready
          ? language === "id"
            ? "PINDAI"
            : "SCAN"
          : `${cooldown.toFixed(0)}s`}
      </span>
    </button>
  );
}

function FlightStick({ label }: { label: string }) {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const pointer = useRef<number | null>(null);
  const reset = () => {
    pointer.current = null;
    gameInput.touchAxis.current.x = 0;
    gameInput.touchAxis.current.y = 0;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
    base.current?.classList.remove("is-active");
  };
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, previous) => {
      if (state.phase !== previous.phase) reset();
    });
    window.addEventListener("blur", reset);
    const hidden = () => {
      if (document.hidden) reset();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      unsubscribe();
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", hidden);
      reset();
    };
  }, []);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointer.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = bounds.width * 0.32;
    const dx = event.clientX - bounds.left - bounds.width / 2;
    const dy = event.clientY - bounds.top - bounds.height / 2;
    const distance = Math.hypot(dx, dy);
    const scale = distance > radius ? radius / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    // Small dead zone prevents drift; radial scaling preserves diagonal direction.
    const magnitude = Math.min(1, distance / radius);
    const strength = Math.max(0, (magnitude - 0.12) / 0.88);
    gameInput.touchAxis.current.x = distance ? (dx / distance) * strength : 0;
    gameInput.touchAxis.current.y = distance ? (-dy / distance) * strength : 0;
    if (knob.current)
      knob.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId === pointer.current) reset();
  };
  return (
    <div
      className="flight-stick"
      ref={base}
      role="group"
      aria-label={label}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (pointer.current !== null) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add("is-active");
        move(event);
      }}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <span className="flight-stick-cross" aria-hidden="true" />
      <span className="flight-stick-knob" ref={knob} aria-hidden="true">
        ✦
      </span>
    </div>
  );
}

export function MobileControls() {
  const language = useSettingsStore((state) => state.language);
  const id = language === "id";
  return (
    <div className="mobile-controls" aria-label="Touch flight controls">
      <FlightStick
        label={
          id
            ? "Analog: geser untuk belok, naik atau turun"
            : "Flight stick: drag to steer, climb or dive"
        }
      />
      <div className="touch-actions">
        <div className="mobile-control-row">
          <HoldButton input="s" label={id ? "Rem" : "Brake"} symbol="−" />
          <ScanButton />
        </div>
        <div className="mobile-control-row">
          <HoldButton
            input="w"
            label={id ? "Maju" : "Thrust"}
            symbol="↑"
            tone="cyan"
          />
          <HoldButton input="shift" label="Nitro" symbol="»" tone="amber" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { localAdvisor } from "@/game/advisor";
import { GAME_CONFIG } from "@/game/config";
import type { GameNode } from "@/game/nodes";
import { playSound } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

interface PlayerProps {
  playerRef: RefObject<THREE.Group | null>;
  keys: RefObject<Set<string>>;
  mouseX: RefObject<number>;
  scanQueuedRef: RefObject<boolean>;
  nodes: GameNode[];
}

export function Player({
  playerRef,
  keys,
  mouseX,
  scanQueuedRef,
  nodes,
}: PlayerProps) {
  const visual = useRef<THREE.Group>(null);
  const speed = useRef<number>(GAME_CONFIG.movement.cruiseSpeed);
  const sideSpeed = useRef(0);
  const battery = useRef<number>(GAME_CONFIG.battery.start);
  const privacy = useRef(100);
  const elapsed = useRef(0);
  const hudInterval = useRef(0);
  const scanCooldown = useRef(0);
  const boostHeld = useRef(false);
  const burstUntil = useRef(0);
  const burstSpeed = useRef(0);
  const lastTipAt = useRef(-100);
  const tipCombo = useRef(0);
  const crossed = useRef(new Set<string>());
  const splitAdvised = useRef(false);
  const warningLevel = useRef(0);

  useFrame(({ clock }, frameDelta) => {
    const body = playerRef.current;
    const model = visual.current;
    if (!body || !model) return;
    const state = useGameStore.getState();
    if (state.phase !== "playing") {
      if (
        [
          "loading",
          "ident",
          "title",
          "menu",
          "briefing",
          "tutorial",
          "countdown",
        ].includes(state.phase)
      )
        model.rotation.y += Math.min(frameDelta, 0.05) * 0.55;
      return;
    }

    const delta = Math.min(frameDelta, 0.05);
    const input = keys.current;
    const boosting = input.has("shift");
    const braking = input.has("s") || input.has("arrowdown");
    const accelerating = input.has("w") || input.has("arrowup");
    const burst = elapsed.current < burstUntil.current ? burstSpeed.current : 0;
    const targetSpeed =
      (boosting
        ? GAME_CONFIG.movement.boostSpeed
        : braking
          ? GAME_CONFIG.movement.brakeSpeed
          : accelerating
            ? GAME_CONFIG.movement.accelerateSpeed
            : GAME_CONFIG.movement.cruiseSpeed) + burst;
    speed.current = THREE.MathUtils.damp(
      speed.current,
      targetSpeed,
      GAME_CONFIG.movement.speedResponse,
      delta,
    );

    const keySteer =
      Number(input.has("d") || input.has("arrowright")) -
      Number(input.has("a") || input.has("arrowleft"));
    const steer = THREE.MathUtils.clamp(
      keySteer + mouseX.current * useSettingsStore.getState().mouseSensitivity,
      -1,
      1,
    );
    sideSpeed.current = THREE.MathUtils.damp(
      sideSpeed.current,
      steer * GAME_CONFIG.movement.lateralSpeed,
      GAME_CONFIG.movement.lateralResponse,
      delta,
    );
    body.position.x = THREE.MathUtils.clamp(
      body.position.x + sideSpeed.current * delta,
      -GAME_CONFIG.movement.lateralLimit,
      GAME_CONFIG.movement.lateralLimit,
    );
    const previousZ = body.position.z;
    body.position.z -= speed.current * delta;
    body.position.y = Math.sin(clock.elapsedTime * 4.6) * 0.13;
    model.rotation.z = THREE.MathUtils.damp(
      model.rotation.z,
      (-sideSpeed.current * GAME_CONFIG.movement.bankAmount) /
        GAME_CONFIG.movement.lateralSpeed,
      6,
      delta,
    );
    model.rotation.y += delta * (boosting ? 2.1 : 1.3);
    model.scale.setScalar(
      THREE.MathUtils.damp(model.scale.x, boosting ? 1.17 : 1, 7, delta),
    );

    if (boosting && !boostHeld.current) playSound("boost");
    boostHeld.current = boosting;
    elapsed.current += delta;
    battery.current = Math.max(
      0,
      battery.current -
        delta *
          (GAME_CONFIG.battery.drainPerSecond +
            (boosting ? GAME_CONFIG.battery.boostExtraDrainPerSecond : 0)),
    );
    scanCooldown.current = Math.max(0, scanCooldown.current - delta);

    const scanDown = scanQueuedRef.current;
    scanQueuedRef.current = false;
    if (scanDown && scanCooldown.current <= 0) {
      scanCooldown.current = GAME_CONFIG.scan.cooldown;
      state.triggerScan();
      state.setAdvisor(
        localAdvisor.recommend(
          {
            battery: battery.current,
            privacy: privacy.current,
            distance: Math.max(0, body.position.z - GAME_CONFIG.destination.z),
            playerZ: body.position.z,
          },
          nodes,
        ),
      );
      playSound("scan");
    }

    for (const node of nodes) {
      if (
        crossed.current.has(node.id) ||
        previousZ <= node.z ||
        body.position.z > node.z
      )
        continue;
      crossed.current.add(node.id);
      const gap = Math.abs(body.position.x - node.x);
      if (node.type === "tracker") {
        if (gap <= node.radius) {
          privacy.current = Math.max(
            0,
            privacy.current - GAME_CONFIG.nodes.trackerPrivacyDamage,
          );
          battery.current = Math.max(
            0,
            battery.current - GAME_CONFIG.nodes.trackerBatteryDamage,
          );
          state.recordEvent("tracker");
          state.setAdvisor(
            "Tracker contact. Protect your privacy; steer around the next red ring.",
          );
          playSound("hit");
        } else if (gap <= node.radius + GAME_CONFIG.nodes.nearMissMargin) {
          state.recordEvent("nearMiss");
          playSound("relay");
        }
      } else if (node.type === "relay" && gap <= node.radius) {
        if (gap <= 2.1) {
          state.recordEvent("perfect");
          burstSpeed.current = GAME_CONFIG.nodes.relayBurstSpeed;
          burstUntil.current =
            elapsed.current + GAME_CONFIG.nodes.relayBurstSeconds;
          playSound("relay");
        }
      } else if (node.type === "booster" && gap <= node.radius) {
        battery.current = Math.min(
          1,
          battery.current + GAME_CONFIG.nodes.boosterCharge,
        );
        burstSpeed.current = GAME_CONFIG.nodes.relayBurstSpeed;
        burstUntil.current =
          elapsed.current + GAME_CONFIG.nodes.boosterBurstSeconds;
        state.recordEvent("booster");
        playSound("relay");
      } else if (node.type === "tip" && gap <= node.radius) {
        tipCombo.current =
          elapsed.current - lastTipAt.current <
          GAME_CONFIG.nodes.tipComboWindowSeconds
            ? Math.min(4, tipCombo.current + 1)
            : 1;
        lastTipAt.current = elapsed.current;
        state.recordEvent("tip", tipCombo.current);
        playSound("tip");
      } else if (node.type === "safe" && gap <= node.radius) {
        state.recordEvent("safe");
        playSound("relay");
      } else if (node.type === "public" && gap <= node.radius) {
        privacy.current = Math.max(
          0,
          privacy.current - GAME_CONFIG.nodes.publicPrivacyDamage,
        );
        burstSpeed.current = GAME_CONFIG.nodes.publicBurstSpeed;
        burstUntil.current =
          elapsed.current + GAME_CONFIG.nodes.publicBurstSeconds;
        state.recordEvent("public");
        playSound("relay");
      }
    }

    if (!splitAdvised.current && body.position.z < -215) {
      splitAdvised.current = true;
      state.setAdvisor(
        "Split ahead. Left is secure; right is faster but public.",
      );
    }
    if (battery.current < 0.1 && warningLevel.current < 1) {
      warningLevel.current = 1;
      state.setAdvisor(
        "Critical power. Keep accelerating toward the receiver.",
      );
      playSound("warning");
    }
    if (battery.current < 0.05 && warningLevel.current < 2) {
      warningLevel.current = 2;
      playSound("warning");
    }

    const distance = Math.max(0, body.position.z - GAME_CONFIG.destination.z);
    if (distance <= GAME_CONFIG.destination.radius) {
      state.sample({
        battery: battery.current,
        privacy: privacy.current,
        elapsed: elapsed.current,
        distance: 0,
        speed: speed.current,
        boosting: false,
        scanCooldown: scanCooldown.current,
      });
      state.finish(elapsed.current, battery.current, privacy.current);
      playSound("success");
      return;
    }
    if (battery.current <= 0) {
      state.sample({
        battery: 0,
        privacy: privacy.current,
        elapsed: elapsed.current,
        distance,
        speed: speed.current,
        boosting: false,
        scanCooldown: scanCooldown.current,
      });
      state.fail(elapsed.current, distance, privacy.current);
      playSound("fail");
      return;
    }
    hudInterval.current += delta;
    if (hudInterval.current >= 0.08) {
      state.sample({
        battery: battery.current,
        privacy: privacy.current,
        elapsed: elapsed.current,
        distance,
        speed: speed.current,
        boosting,
        scanCooldown: scanCooldown.current,
      });
      hudInterval.current = 0;
    }
  });

  return (
    <group ref={playerRef}>
      <group ref={visual}>
        <mesh>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshBasicMaterial color="#e6ffff" toneMapped={false} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.94, 1]} />
          <meshBasicMaterial
            color="#51d9ed"
            wireframe
            transparent
            opacity={0.48}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.9, 0, 0]}>
          <torusGeometry args={[1.15, 0.035, 4, 32]} />
          <meshBasicMaterial
            color="#94f8ff"
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>
        {[1.3, 2.3, 3.6, 5.2, 7].map((z, index) => (
          <mesh key={z} position={[0, 0, z]} scale={1 - index * 0.15}>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshBasicMaterial
              color={index < 2 ? "#82f3ff" : "#2786bb"}
              transparent
              opacity={0.52 - index * 0.07}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight color="#34c7ed" intensity={8} distance={22} decay={2} />
    </group>
  );
}

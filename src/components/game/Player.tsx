"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { localAdvisor } from "@/game/advisor";
import { GAME_CONFIG } from "@/game/config";
import {
  axisVelocity,
  flightControls,
  pilotCue,
  pilotTarget,
} from "@/game/pilot";
import { aperture, hitsObstacle, type GameNode } from "@/game/nodes";
import { playSound, setAudioIntensity } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { craftAt } from "@/game/crafts";
import { CourierRocket } from "./CourierRocket";
import { signalState } from "@/rendering/signalState";
import {
  flightCenter,
  flightSlope,
  flightLengthScale,
} from "@/game/flightPath";
import {
  PRESENTATION,
  presentationState,
  easeShot,
  introDistance,
  introIgnition,
} from "@/game/presentation";

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
  const craft = craftAt(useGameStore((state) => state.stageIndex));
  const speed = useRef<number>(GAME_CONFIG.movement.cruiseSpeed);
  const sideSpeed = useRef(0);
  const verticalSpeed = useRef(0);
  const lane = useRef({ x: 0, y: 0 });
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
  const curtainAdvised = useRef(new Set<string>());
  const warningLevel = useRef(0);
  const hitUntil = useRef(0);
  const relayPulseUntil = useRef(0);

  useEffect(() => {
    signalState.boost.value = 0;
    signalState.flightTime = 0;
  }, []);

  useFrame(({ clock, camera }, frameDelta) => {
    const body = playerRef.current;
    const model = visual.current;
    if (!body || !model) return;
    const state = useGameStore.getState();
    if (state.phase !== "playing") {
      const intro = state.phase === "ident" || state.phase === "title";
      const preview = [
        "loading",
        "ident",
        "title",
        "menu",
        "profile",
        "briefing",
        "tutorial",
        "countdown",
      ].includes(state.phase);
      if (preview) {
        const reduced = useSettingsStore.getState().reducedMotion;
        const hero = intro ? easeShot(presentationState.introTime, 4.3, 6) : 1;
        const launch =
          state.phase === "countdown"
            ? easeShot(presentationState.phaseTime, 0, 1.8)
            : 0;
        const z = intro
          ? introDistance(presentationState.introTime)
          : PRESENTATION.previewZ * (1 - launch);
        const center = flightCenter(z, state.stageIndex);
        body.position.set(
          center.x,
          center.y +
            (reduced
              ? 0
              : Math.sin(presentationState.time * 1.8) * 0.18 * hero),
          z,
        );
        body.rotation.set(0, 0, 0);
        const compact =
          camera instanceof THREE.PerspectiveCamera && camera.aspect < 1;
        model.scale.setScalar(
          THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(1.25, compact ? 1.2 : 2.4, hero),
            1,
            launch,
          ),
        );
        model.rotation.set(
          -0.08 * hero * (1 - launch),
          (-0.5 +
            (reduced
              ? 0
              : presentationState.pointer.x * 0.14 +
                Math.sin(presentationState.time * 0.7) * 0.07)) *
            hero *
            (1 - launch),
          -0.1 * hero * (1 - launch),
        );
        signalState.boost.value = intro
          ? introIgnition(presentationState.introTime)
          : state.phase === "countdown"
            ? launch * 0.65
            : 0.06;
        return;
      }
      if (state.phase === "failed") {
        model.scale.setScalar(
          THREE.MathUtils.damp(
            model.scale.x,
            0.2,
            4,
            Math.min(frameDelta, 0.05),
          ),
        );
      } else if (state.phase === "success") {
        model.scale.setScalar(
          THREE.MathUtils.damp(
            model.scale.x,
            1.85,
            3,
            Math.min(frameDelta, 0.05),
          ),
        );
      }
      return;
    }

    const delta = Math.min(frameDelta, 0.05);
    const input = keys.current;
    const controls = flightControls(
      input,
      mouseX.current * useSettingsStore.getState().mouseSensitivity,
    );
    const { boosting, steer, lift } = controls;
    signalState.boost.value = THREE.MathUtils.damp(
      signalState.boost.value,
      boosting ? 1 : 0,
      6,
      delta,
    );
    signalState.critical.value = THREE.MathUtils.damp(
      signalState.critical.value,
      battery.current < 0.15 ? 1 : 0,
      2.6,
      delta,
    );
    const burst = elapsed.current < burstUntil.current ? burstSpeed.current : 0;
    const targetSpeed =
      controls.targetSpeed +
      (input.has("s") || input.has("arrowdown") ? 0 : burst);
    speed.current = THREE.MathUtils.damp(
      speed.current,
      targetSpeed,
      GAME_CONFIG.movement.speedResponse,
      delta,
    );

    sideSpeed.current = axisVelocity(
      sideSpeed.current,
      steer,
      GAME_CONFIG.movement.lateralSpeed,
      GAME_CONFIG.movement.lateralResponse,
      delta,
    );
    lane.current.x = THREE.MathUtils.clamp(
      lane.current.x + sideSpeed.current * delta,
      -GAME_CONFIG.movement.lateralLimit,
      GAME_CONFIG.movement.lateralLimit,
    );
    const previousZ = body.position.z;
    body.position.z = Math.max(
      GAME_CONFIG.destination.z,
      body.position.z -
        (speed.current * delta) /
          flightLengthScale(body.position.z, state.stageIndex),
    );
    verticalSpeed.current = axisVelocity(
      verticalSpeed.current,
      lift,
      GAME_CONFIG.movement.verticalSpeed,
      GAME_CONFIG.movement.verticalResponse,
      delta,
    );
    lane.current.y = THREE.MathUtils.clamp(
      lane.current.y + verticalSpeed.current * delta,
      GAME_CONFIG.movement.minAltitude,
      GAME_CONFIG.movement.maxAltitude,
    );
    const center = flightCenter(body.position.z, state.stageIndex);
    const slope = flightSlope(body.position.z, state.stageIndex);
    body.position.x = center.x + lane.current.x;
    body.position.y = center.y + lane.current.y;
    body.rotation.y = Math.atan(slope.x);
    body.rotation.x = -Math.atan(slope.y / Math.hypot(1, slope.x));
    model.position.y = Math.sin(clock.elapsedTime * 4.6) * 0.1;
    model.rotation.x = THREE.MathUtils.damp(
      model.rotation.x,
      -verticalSpeed.current * 0.025,
      6,
      delta,
    );
    model.rotation.z = THREE.MathUtils.damp(
      model.rotation.z,
      (-sideSpeed.current * GAME_CONFIG.movement.bankAmount) /
        GAME_CONFIG.movement.lateralSpeed +
        THREE.MathUtils.clamp(
          (flightSlope(body.position.z - 10, state.stageIndex).x - slope.x) *
            speed.current *
            0.22,
          -0.18,
          0.18,
        ),
      6,
      delta,
    );
    model.rotation.y = THREE.MathUtils.damp(
      model.rotation.y,
      steer * 0.1 + Math.sin(clock.elapsedTime * 1.8) * 0.025,
      5,
      delta,
    );
    const struck = elapsed.current < hitUntil.current;
    const relayPulse = elapsed.current < relayPulseUntil.current;
    model.scale.setScalar(
      THREE.MathUtils.damp(
        model.scale.x,
        struck ? 1.7 : relayPulse ? 1.5 : boosting ? 1.48 : 1.3,
        7,
        delta,
      ),
    );
    if (boosting && !boostHeld.current) playSound("boost");
    boostHeld.current = boosting;
    elapsed.current += delta;
    signalState.flightTime = elapsed.current;
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
          useSettingsStore.getState().language,
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
      const gap = Math.hypot(lane.current.x - node.x, lane.current.y - node.y);
      if (
        node.type === "curtain" ||
        node.type === "shutter" ||
        node.type === "rotor"
      ) {
        if (
          hitsObstacle(node, lane.current.x, lane.current.y, elapsed.current)
        ) {
          privacy.current = Math.max(
            0,
            privacy.current - GAME_CONFIG.obstacles.damagePrivacy,
          );
          battery.current = Math.max(
            0,
            battery.current - GAME_CONFIG.obstacles.damageBattery,
          );
          state.recordEvent("curtainHit");
          hitUntil.current = elapsed.current + 0.42;
          playSound("hit");
        } else {
          state.recordEvent("curtainClear");
          relayPulseUntil.current = elapsed.current + 0.35;
          playSound("relay");
        }
      } else if (node.type === "tracker") {
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
          hitUntil.current = elapsed.current + 0.42;
          state.setAdvisor(
            useSettingsStore.getState().language === "id"
              ? "Terkena pelacak. Lindungi privasimu; hindari cincin merah berikutnya."
              : "Tracker contact. Protect your privacy; steer around the next red ring.",
          );
          playSound("hit");
        } else if (gap <= node.radius + GAME_CONFIG.nodes.nearMissMargin) {
          state.recordEvent("nearMiss");
          playSound("relay");
        }
      } else if (node.type === "relay" && gap <= node.radius) {
        if (gap <= 2.1) {
          state.recordEvent("perfect");
          relayPulseUntil.current = elapsed.current + 0.4;
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
        relayPulseUntil.current = elapsed.current + 0.55;
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

    const nextCurtain = nodes.find(
      (node) =>
        ["curtain", "shutter", "rotor"].includes(node.type) &&
        !curtainAdvised.current.has(node.id) &&
        body.position.z - node.z > 0 &&
        body.position.z - node.z < 75,
    );
    if (nextCurtain) {
      curtainAdvised.current.add(nextCurtain.id);
      const gap = aperture(nextCurtain, elapsed.current);
      const climb = gap.y > lane.current.y + 1.5;
      const dive = gap.y < lane.current.y - 1.5;
      state.setAdvisor(
        useSettingsStore.getState().language === "id"
          ? nextCurtain.type === "rotor"
            ? "Rotor di depan. Lewati ruang di antara bilah."
            : `${climb ? "Naik (Q)" : dive ? "Turun (E)" : "Jaga ketinggian"}. Tembus celah terang.`
          : nextCurtain.type === "rotor"
            ? "Rotor ahead. Fly between the blades."
            : `${climb ? "Climb (Q)" : dive ? "Dive (E)" : "Hold altitude"}. Thread the bright aperture.`,
      );
    }

    if (
      !splitAdvised.current &&
      body.position.z < GAME_CONFIG.course.splitStart
    ) {
      splitAdvised.current = true;
      state.setAdvisor(
        useSettingsStore.getState().language === "id"
          ? "Persimpangan di depan. Kiri aman; kanan lebih cepat tetapi publik."
          : "Split ahead. Left is secure; right is faster but public.",
      );
    }
    if (battery.current < 0.1 && warningLevel.current < 1) {
      warningLevel.current = 1;
      state.setAdvisor(
        useSettingsStore.getState().language === "id"
          ? "Daya kritis. Terus melaju menuju penerima."
          : "Critical power. Keep accelerating toward the receiver.",
      );
      playSound("warning");
    }
    if (battery.current < 0.05 && warningLevel.current < 2) {
      warningLevel.current = 2;
      playSound("warning");
    }

    const distance = Math.max(0, body.position.z - GAME_CONFIG.destination.z);
    const receiverDistance = Math.hypot(
      body.position.x,
      body.position.y,
      distance,
    );
    if (
      battery.current > 0 &&
      receiverDistance <= GAME_CONFIG.destination.radius
    ) {
      state.sample({
        battery: battery.current,
        privacy: privacy.current,
        elapsed: elapsed.current,
        distance: 0,
        speed: speed.current,
        boosting: false,
        scanCooldown: scanCooldown.current,
        altitude: lane.current.y,
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
        altitude: lane.current.y,
      });
      state.fail(elapsed.current, distance, privacy.current);
      playSound("fail");
      return;
    }
    hudInterval.current += delta;
    if (hudInterval.current >= 0.08) {
      setAudioIntensity(boosting, battery.current);
      state.sample({
        battery: battery.current,
        privacy: privacy.current,
        elapsed: elapsed.current,
        distance,
        speed: speed.current,
        boosting,
        scanCooldown: scanCooldown.current,
        altitude: lane.current.y,
        pilotCue: pilotCue(
          pilotTarget(nodes, body.position.z, elapsed.current),
          lane.current.x,
          lane.current.y,
          distance,
        ),
      });
      hudInterval.current = 0;
    }
  });

  return (
    <group ref={playerRef}>
      <group ref={visual}>
        <CourierRocket craft={craft} />
      </group>
    </group>
  );
}

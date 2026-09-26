"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { localAdvisor } from "@/game/advisor";
import { GAME_CONFIG } from "@/game/config";
import type { GameNode } from "@/game/nodes";
import { playSound, setAudioIntensity } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { energySurface } from "@/rendering/materials";
import { createChatGeometry } from "@/rendering/chatGeometry";
import { signalState } from "@/rendering/signalState";

interface PlayerProps {
  playerRef: RefObject<THREE.Group | null>;
  keys: RefObject<Set<string>>;
  mouseX: RefObject<number>;
  scanQueuedRef: RefObject<boolean>;
  nodes: GameNode[];
}

function createPacketShell() {
  return createChatGeometry(1.75, 1.15, 0.7);
}

export function Player({
  playerRef,
  keys,
  mouseX,
  scanQueuedRef,
  nodes,
}: PlayerProps) {
  const visual = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shellGeometry = useMemo(() => createPacketShell(), []);
  const materials = useMemo(() => {
    const shell = new THREE.MeshPhysicalMaterial({
      color: "#5277cb",
      metalness: 0.12,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: "#3158af",
      emissiveIntensity: 0.18,
    });
    return { core: energySurface("#d6f5ff", 3.2, true), shell };
  }, []);
  useEffect(
    () => () => {
      materials.core.dispose();
      materials.shell.dispose();
      shellGeometry.dispose();
    },
    [materials, shellGeometry],
  );
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
  const hitUntil = useRef(0);
  const relayPulseUntil = useRef(0);

  useFrame(({ clock }, frameDelta) => {
    const body = playerRef.current;
    const model = visual.current;
    if (!body || !model) return;
    const state = useGameStore.getState();
    if (state.phase !== "playing") {
      if (state.phase === "failed") {
        if (trail.current) trail.current.visible = false;
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
      } else if (state.phase !== "paused") {
        if (trail.current) trail.current.visible = true;
        model.scale.setScalar(
          THREE.MathUtils.damp(
            model.scale.x,
            1.3,
            5,
            Math.min(frameDelta, 0.05),
          ),
        );
      }
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
    if (trail.current) {
      const trailScale = boosting
        ? 1.75
        : relayPulse
          ? 1.45
          : battery.current < 0.15
            ? 0.55
            : 1;
      trail.current.scale.z = THREE.MathUtils.damp(
        trail.current.scale.z,
        trailScale,
        6,
        delta,
      );
      trail.current.visible =
        !struck &&
        (battery.current > 0.035 || Math.sin(clock.elapsedTime * 17) > 0);
    }
    if (core.current) {
      const pulse = battery.current < 0.15 ? 0.78 : 1;
      core.current.scale.setScalar(
        pulse + (boosting ? 0.16 : 0) + Math.sin(clock.elapsedTime * 7) * 0.07,
      );
    }

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
          hitUntil.current = elapsed.current + 0.42;
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
      setAudioIntensity(boosting, battery.current);
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
        <mesh position={[0, 0, -0.8]} scale={[1.1, 0.66, 1.4]}>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshPhysicalMaterial
            color="#c2e1f4"
            metalness={0.12}
            roughness={0.28}
            clearcoat={1}
            emissive="#6b9ed0"
            emissiveIntensity={0.1}
            flatShading
          />
        </mesh>
        <mesh position={[0, 0.66, -0.74]} scale={[0.72, 0.24, 1.05]}>
          <icosahedronGeometry args={[1.25, 0]} />
          <meshStandardMaterial
            color="#ecf7ff"
            metalness={0.2}
            roughness={0.3}
            flatShading
          />
        </mesh>
        <mesh
          position={[0, 0, 1.72]}
          geometry={shellGeometry}
          material={materials.shell}
        />
        <mesh position={[0, 0, 0.25]}>
          <sphereGeometry args={[2.05, 20, 14]} />
          <meshPhysicalMaterial
            color="#bde9ff"
            metalness={0.05}
            roughness={0.12}
            clearcoat={1}
            transparent
            opacity={0.11}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.98, -0.75]}>
          <boxGeometry args={[0.14, 0.08, 2.5]} />
          <meshBasicMaterial color="#ffdfa9" toneMapped={false} />
        </mesh>
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * 1.5, -0.18, 0.18]}
            rotation={[0, side * 0.34, side * -0.22]}
          >
            <mesh scale={[0.6, 0.29, 1.8]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#83bee5"
                metalness={0.25}
                roughness={0.3}
                emissive="#356b9c"
                emissiveIntensity={0.13}
                flatShading
              />
            </mesh>
            <mesh position={[0, 0, 1.35]}>
              <sphereGeometry args={[0.2, 8, 6]} />
              <meshBasicMaterial color="#fff1d4" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group
            key={`eye-${side}`}
            position={[side * 0.52, 0.16, 2.15]}
            rotation={[0, 0, side * -0.52]}
          >
            <mesh>
              <boxGeometry args={[0.29, 0.42, 0.08]} />
              <meshBasicMaterial color="#f8f9ed" toneMapped={false} />
            </mesh>
            <mesh position={[side * 0.035, 0, 0.052]}>
              <boxGeometry args={[0.13, 0.27, 0.05]} />
              <meshBasicMaterial color="#19365c" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.25, 2.19]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.17, 0.035, 4, 12, Math.PI]} />
          <meshBasicMaterial color="#19365c" />
        </mesh>
        <mesh ref={core} position={[0, -0.02, 2.3]} material={materials.core}>
          <octahedronGeometry args={[0.18, 0]} />
        </mesh>
      </group>
      <group ref={trail}>
        <mesh position={[0, 0, 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.13, 5, 6, 1, true]} />
          <meshBasicMaterial
            color="#4ac8e9"
            transparent
            opacity={0.18}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.34, 0, 2.4]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[0.045, 3.7, 4, 1, true]} />
            <meshBasicMaterial
              color="#9aeaf9"
              transparent
              opacity={0.42}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight color="#a2e9ff" intensity={17} distance={25} decay={2} />
    </group>
  );
}

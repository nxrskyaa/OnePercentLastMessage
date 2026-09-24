"use client";

import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "@/game/config";
import { useGameStore } from "@/store/gameStore";

interface PlayerProps {
  playerRef: RefObject<THREE.Group | null>;
  keys: RefObject<Set<string>>;
}

export function Player({ playerRef, keys }: PlayerProps) {
  const visual = useRef<THREE.Group>(null);
  const speed = useRef<number>(GAME_CONFIG.movement.cruiseSpeed);
  const sideSpeed = useRef(0);
  const battery = useRef<number>(GAME_CONFIG.battery.start);
  const elapsed = useRef(0);
  const hudInterval = useRef(0);

  useFrame(({ clock }, frameDelta) => {
    const body = playerRef.current;
    const model = visual.current;
    if (!body || !model) return;

    const phase = useGameStore.getState().phase;
    if (phase !== "playing") {
      if (phase === "menu")
        model.rotation.y += Math.min(frameDelta, 0.05) * 0.55;
      return;
    }

    const delta = Math.min(frameDelta, 0.05);
    const input = keys.current;
    const boosting = input.has("shift");
    const braking = input.has("s") || input.has("arrowdown");
    const accelerating = input.has("w") || input.has("arrowup");
    const targetSpeed = boosting
      ? GAME_CONFIG.movement.boostSpeed
      : braking
        ? GAME_CONFIG.movement.brakeSpeed
        : accelerating
          ? GAME_CONFIG.movement.accelerateSpeed
          : GAME_CONFIG.movement.cruiseSpeed;
    speed.current = THREE.MathUtils.damp(
      speed.current,
      targetSpeed,
      GAME_CONFIG.movement.speedResponse,
      delta,
    );

    const steer =
      Number(input.has("d") || input.has("arrowright")) -
      Number(input.has("a") || input.has("arrowleft"));
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

    elapsed.current += delta;
    battery.current = Math.max(
      0,
      battery.current -
        delta *
          (GAME_CONFIG.battery.drainPerSecond +
            (boosting ? GAME_CONFIG.battery.boostExtraDrainPerSecond : 0)),
    );
    const distance = Math.max(0, body.position.z - GAME_CONFIG.destination.z);
    const store = useGameStore.getState();

    if (distance <= GAME_CONFIG.destination.radius) {
      store.sample(battery.current, elapsed.current, 0, speed.current, false);
      store.finish(elapsed.current, battery.current);
      return;
    }
    if (battery.current <= 0) {
      store.sample(0, elapsed.current, distance, speed.current, false);
      store.fail(elapsed.current);
      return;
    }
    hudInterval.current += delta;
    if (hudInterval.current >= 0.08) {
      store.sample(
        battery.current,
        elapsed.current,
        distance,
        speed.current,
        boosting,
      );
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

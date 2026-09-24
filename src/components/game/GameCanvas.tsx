"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ChaseCamera } from "@/components/game/ChaseCamera";
import { Destination } from "@/components/game/Destination";
import { NetworkWorld } from "@/components/game/NetworkWorld";
import { Player } from "@/components/game/Player";
import { GAME_CONFIG } from "@/game/config";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/gameStore";

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useKeyboard();
  const runId = useGameStore((state) => state.runId);

  return (
    <>
      <color attach="background" args={["#030911"]} />
      <fogExp2 attach="fog" args={["#06111c", GAME_CONFIG.world.fogDensity]} />
      <ambientLight color="#6699bb" intensity={0.65} />
      <NetworkWorld />
      <Destination />
      <Player key={`player-${runId}`} playerRef={playerRef} keys={keys} />
      <ChaseCamera key={`camera-${runId}`} playerRef={playerRef} />
    </>
  );
}

export default function GameCanvas() {
  return (
    <Canvas
      className="game-canvas"
      dpr={[1, 1.6]}
      camera={{
        fov: GAME_CONFIG.camera.baseFov,
        near: 0.1,
        far: 1100,
        position: [0, 5, 13],
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <GameScene />
    </Canvas>
  );
}

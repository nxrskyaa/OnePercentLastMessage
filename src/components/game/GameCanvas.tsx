"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ChaseCamera } from "@/components/game/ChaseCamera";
import { Destination } from "@/components/game/Destination";
import { NetworkWorld } from "@/components/game/NetworkWorld";
import { NodeManager } from "@/components/game/NodeManager";
import { Player } from "@/components/game/Player";
import { PostProcessing } from "@/components/game/PostProcessing";
import { QualityMonitor } from "@/components/game/QualityMonitor";
import { ScanPulse } from "@/components/game/ScanPulse";
import { GAME_CONFIG } from "@/game/config";
import { generateNodes } from "@/game/nodes";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  const input = useKeyboard();
  const runId = useGameStore((state) => state.runId);
  const nodes = useMemo(() => generateNodes(runId), [runId]);

  return (
    <>
      <color attach="background" args={["#030911"]} />
      <fogExp2 attach="fog" args={["#06111c", GAME_CONFIG.world.fogDensity]} />
      <ambientLight color="#6699bb" intensity={0.65} />
      <NetworkWorld />
      <NodeManager nodes={nodes} />
      <Destination />
      <Player
        key={`player-${runId}`}
        playerRef={playerRef}
        keys={input.pressed}
        mouseX={input.mouseX}
        scanQueuedRef={input.scanQueuedRef}
        nodes={nodes}
      />
      <ScanPulse playerRef={playerRef} />
      <ChaseCamera key={`camera-${runId}`} playerRef={playerRef} />
      <PostProcessing />
      <QualityMonitor />
    </>
  );
}

export default function GameCanvas({ onReady }: { onReady?: () => void }) {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  return (
    <Canvas
      className="game-canvas"
      dpr={quality === "low" ? 1 : quality === "medium" ? 1.3 : 1.6}
      camera={{
        fov: GAME_CONFIG.camera.baseFov,
        near: 0.1,
        far: 1100,
        position: [0, 5, 13],
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={onReady}
    >
      <GameScene />
    </Canvas>
  );
}

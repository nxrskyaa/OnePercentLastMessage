"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { ChaseCamera } from "@/components/game/ChaseCamera";
import { Destination } from "@/components/game/Destination";
import { NetworkStage } from "@/components/game/NetworkStage";
import { NodeManager } from "@/components/game/NodeManager";
import { Player } from "@/components/game/Player";
import { QualityMonitor } from "@/components/game/QualityMonitor";
import { RouteFork } from "@/components/game/RouteFork";
import { ScanPulse } from "@/components/game/ScanPulse";
import { SkyVault } from "@/components/game/SkyVault";
import { StageMotion } from "@/components/game/StageMotion";
import { StageLighting } from "@/components/game/StageLighting";
import { WorldDetail } from "@/components/game/WorldDetail";
import { budgetedDpr } from "@/rendering/resolution";
import { GAME_CONFIG } from "@/game/config";
import { generateNodes } from "@/game/nodes";
import { stageAt } from "@/game/stages";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  const input = useKeyboard();
  const runId = useGameStore((state) => state.runId);
  const stageIndex = useGameStore((state) => state.stageIndex);
  const stage = stageAt(stageIndex);
  const nodes = useMemo(
    () => generateNodes(runId + stageIndex * 101, stageIndex),
    [runId, stageIndex],
  );

  return (
    <>
      <color attach="background" args={[stage.sky[1]]} />
      <fogExp2
        attach="fog"
        args={[stage.sky[1], GAME_CONFIG.world.fogDensity]}
      />
      <ambientLight color="#8ba5d4" intensity={0.3} />
      <directionalLight
        color="#c4dcf3"
        intensity={1.03}
        position={[-15, 28, 20]}
      />
      <directionalLight
        color={stage.accentSoft}
        intensity={0.48}
        position={[30, -12, -35]}
      />
      <NetworkStage />
      <WorldDetail />
      <SkyVault />
      <StageLighting playerRef={playerRef} />
      <StageMotion />
      <RouteFork />
      <NodeManager nodes={nodes} playerRef={playerRef} />
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
      <QualityMonitor />
    </>
  );
}

function RendererUnavailable() {
  return (
    <div className="renderer-error" role="alert">
      ADVANCED RENDERER UNAVAILABLE
      <br />
      Try updating your browser or graphics driver.
    </div>
  );
}

class RendererBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <RendererUnavailable /> : this.props.children;
  }
}

export default function GameCanvas({ onReady }: { onReady?: () => void }) {
  const quality = useSettingsStore((state) => state.runtimeQuality);
  const [rendererError, setRendererError] = useState(false);
  const createRenderer = useCallback(({ canvas }: { canvas: EventTarget }) => {
    const options = {
      canvas: canvas as HTMLCanvasElement,
      antialias: true,
      alpha: false,
    };
    try {
      return new THREE.WebGLRenderer({
        ...options,
        powerPreference: "high-performance",
      });
    } catch {
      setRendererError(true);
      throw new Error("No compatible graphics renderer is available.");
    }
  }, []);
  if (rendererError) return <RendererUnavailable />;
  return (
    <RendererBoundary>
      <Canvas
        className="game-canvas"
        shadows={{ enabled: false, type: THREE.PCFShadowMap }}
        dpr={budgetedDpr(window.innerWidth, window.innerHeight, quality)}
        camera={{
          fov: GAME_CONFIG.camera.baseFov,
          near: 0.1,
          far: 1100,
          position: [0, 5, 13],
        }}
        gl={createRenderer}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.42;
          gl.domElement.dataset.rendererBackend = "webgl2";
          onReady?.();
        }}
      >
        <GameScene />
      </Canvas>
    </RendererBoundary>
  );
}

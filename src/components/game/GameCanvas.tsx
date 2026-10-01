"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
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
import { FlightGuide } from "@/components/game/FlightGuide";
import { PresentationDirector } from "@/components/game/PresentationDirector";
import { QualityMonitor } from "@/components/game/QualityMonitor";
import { RouteFork } from "@/components/game/RouteFork";
import { ScanPulse } from "@/components/game/ScanPulse";
import { SignalWater } from "@/components/game/SignalWater";
import { HarborLife } from "@/components/game/HarborLife";
import { FlightFeedback } from "@/components/game/FlightFeedback";
import { StageLighting } from "@/components/game/StageLighting";

import { RelayLanterns } from "@/components/game/RelayLanterns";
import { MaterialLighting } from "@/components/game/MaterialLighting";
import { LightBloom } from "@/components/game/LightBloom";
import { budgetedDpr } from "@/rendering/resolution";
import { GAME_CONFIG } from "@/game/config";
import { harborHorizon } from "@/game/harbor";
import { generateNodes } from "@/game/nodes";
import { stageAt } from "@/game/stages";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

function GameScene({ onReady }: { onReady?: () => void }) {
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
      <PresentationDirector onReady={onReady} />
      <color attach="background" args={[stage.sky[1]]} />
      <fogExp2
        attach="fog"
        args={[harborHorizon(stage), GAME_CONFIG.world.fogDensity]}
      />
      <hemisphereLight
        onUpdate={(object) => object.layers.enable(1)}
        color="#b2d7e4"
        groundColor="#303448"
        intensity={0.6}
      />
      <directionalLight
        onUpdate={(object) => object.layers.enable(1)}
        color="#ffe1b5"
        intensity={1.65}
        position={[-60, 80, 30]}
      />
      <directionalLight
        onUpdate={(object) => object.layers.enable(1)}
        color={stage.accentSoft}
        intensity={0.22}
        position={[30, -12, -35]}
      />
      <NetworkStage playerRef={playerRef} />
      <MaterialLighting />
      <RelayLanterns />
      <SignalWater playerRef={playerRef} />
      <HarborLife playerRef={playerRef} />
      <StageLighting playerRef={playerRef} />

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
      <FlightGuide nodes={nodes} playerRef={playerRef} />
      <FlightFeedback key={`feedback-${runId}`} playerRef={playerRef} />
      <ChaseCamera key={`camera-${runId}`} playerRef={playerRef} />
      <QualityMonitor />
      <LightBloom />
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
  const phase = useGameStore((state) => state.phase);
  const [endEffectComplete, setEndEffectComplete] = useState(false);
  useEffect(() => {
    if (phase !== "success" && phase !== "failed") return;
    const timeout = window.setTimeout(
      () => setEndEffectComplete(true),
      phase === "success" ? 1800 : 600,
    );
    return () => {
      window.clearTimeout(timeout);
      setEndEffectComplete(false);
    };
  }, [phase]);
  const staticScene = [
    "ident",
    "title",
    "countdown",
    "menu",
    "paused",
    "profile",
    "briefing",
    "tutorial",
  ].includes(phase);
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
        frameloop={staticScene || endEffectComplete ? "demand" : "always"}
        className="game-canvas"
        shadows={{ enabled: false, type: THREE.PCFShadowMap }}
        dpr={budgetedDpr(window.innerWidth, window.innerHeight, quality)}
        camera={{
          fov: GAME_CONFIG.camera.baseFov,
          near: 0.1,
          far: 2300,
          position: [0, 5, 13],
        }}
        gl={createRenderer}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = GAME_CONFIG.world.exposure;
          gl.info.autoReset = false;
          gl.domElement.dataset.rendererBackend = "webgl2";
        }}
      >
        <GameScene onReady={onReady} />
      </Canvas>
    </RendererBoundary>
  );
}

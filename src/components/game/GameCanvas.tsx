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
import { WebGPURenderer } from "three/webgpu";
import { ChaseCamera } from "@/components/game/ChaseCamera";
import { Destination } from "@/components/game/Destination";
import { NetworkWorld } from "@/components/game/NetworkWorld";
import { NodeManager } from "@/components/game/NodeManager";
import { PacketTraffic } from "@/components/game/PacketTraffic";
import { Player } from "@/components/game/Player";
import { PostProcessing } from "@/components/game/PostProcessing";
import { QualityMonitor } from "@/components/game/QualityMonitor";
import { RouteFork } from "@/components/game/RouteFork";
import { ScanPulse } from "@/components/game/ScanPulse";
import { SignalStructures } from "@/components/game/SignalStructures";
import { SignalLoom } from "@/components/game/SignalLoom";
import { WorldLandmarks } from "@/components/game/WorldLandmarks";
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
      <color attach="background" args={["#07121d"]} />
      <fogExp2 attach="fog" args={["#0c1b29", GAME_CONFIG.world.fogDensity]} />
      <ambientLight color="#7797a8" intensity={0.9} />
      <directionalLight
        color="#a5c8d3"
        intensity={2.8}
        position={[-15, 28, 20]}
      />
      <directionalLight
        color="#517b91"
        intensity={1.15}
        position={[30, -12, -35]}
      />
      <SignalStructures />
      <SignalLoom />
      <RouteFork />
      <WorldLandmarks />
      <NetworkWorld />
      <PacketTraffic />
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
      <PostProcessing />
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
  const createRenderer = useCallback(
    async ({ canvas }: { canvas: EventTarget }) => {
      const options = {
        canvas: canvas as HTMLCanvasElement,
        antialias: true,
        alpha: false,
      };
      try {
        const forceWebGL =
          new URLSearchParams(window.location.search).get("renderer") ===
          "webgl2";
        const renderer = new WebGPURenderer({ ...options, forceWebGL });
        await renderer.init();
        if (
          useSettingsStore.getState().quality === "auto" &&
          "isWebGPUBackend" in renderer.backend === false
        )
          useSettingsStore.getState().setRuntimeQuality("low");
        return renderer;
      } catch {
        try {
          const renderer = new WebGPURenderer({ ...options, forceWebGL: true });
          await renderer.init();
          if (useSettingsStore.getState().quality === "auto")
            useSettingsStore.getState().setRuntimeQuality("low");
          return renderer;
        } catch {
          setRendererError(true);
          throw new Error("No compatible graphics renderer is available.");
        }
      }
    },
    [],
  );
  if (rendererError) return <RendererUnavailable />;
  return (
    <RendererBoundary>
      <Canvas
        className="game-canvas"
        shadows={{ enabled: false, type: THREE.PCFShadowMap }}
        dpr={quality === "low" ? 0.9 : quality === "medium" ? 1 : 1.25}
        camera={{
          fov: GAME_CONFIG.camera.baseFov,
          near: 0.1,
          far: 1100,
          position: [0, 5, 13],
        }}
        gl={createRenderer}
        onCreated={({ gl }) => {
          const renderer = gl as unknown as WebGPURenderer;
          const backend = renderer.backend;
          gl.domElement.dataset.rendererBackend =
            "isWebGPUBackend" in backend ? "webgpu" : "webgl2";
          onReady?.();
        }}
      >
        <GameScene />
      </Canvas>
    </RendererBoundary>
  );
}

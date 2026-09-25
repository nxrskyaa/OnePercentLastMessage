import { MeshBasicNodeMaterial, MeshStandardNodeMaterial } from "three/webgpu";
import {
  color,
  positionLocal,
  positionWorld,
  sin,
  smoothstep,
  time,
} from "three/tsl";
import { signalState } from "@/rendering/signalState";

/** Dark physical infrastructure; animation stays on the embedded signal runs. */
export function dataSurface(base = "#102434", pulse = "#337e9b") {
  const material = new MeshStandardNodeMaterial();
  material.colorNode = color(base).mul(signalState.failure.mul(-0.62).add(1));
  material.emissiveNode = color(pulse)
    .mul(0.055)
    .add(color("#78d8f3").mul(signalState.success.mul(0.34)));
  material.roughness = 0.72;
  material.metalness = 0.38;
  return material;
}

/** Bright component whose luminance pulses without changing React state. */
export function energySurface(tint = "#7bdff0", speed = 2.5, player = false) {
  const material = new MeshBasicNodeMaterial();
  const pulse = sin(time.mul(speed).add(positionLocal.y.mul(1.8)))
    .mul(0.14)
    .add(0.86);
  const scanResponse = smoothstep(
    0,
    3,
    positionWorld
      .sub(signalState.scanOrigin)
      .length()
      .sub(signalState.scanRadius)
      .abs(),
  )
    .oneMinus()
    .mul(signalState.scanStrength)
    .mul(0.7)
    .add(1);
  material.colorNode = color(tint).mul(
    player
      ? pulse
          .mul(signalState.boost.mul(0.55).add(1))
          .mul(signalState.critical.mul(-0.32).add(1))
      : pulse.mul(scanResponse),
  );
  material.toneMapped = false;
  return material;
}

/** Small signal runs travel along cable jackets; the broad hull stays unlit. */
export function flowSurface(tint: string) {
  const material = new MeshBasicNodeMaterial();
  const wave = sin(positionLocal.z.mul(0.18).add(time.mul(3.6)))
    .mul(0.5)
    .add(0.5);
  material.colorNode = color(tint).mul(
    smoothstep(0.75, 0.98, wave).mul(0.85).add(0.25),
  );
  material.toneMapped = false;
  return material;
}

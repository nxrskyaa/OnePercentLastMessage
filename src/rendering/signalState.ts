import * as THREE from "three";
import { uniform } from "three/tsl";

/** Shared GPU uniforms: gameplay updates them directly without rerendering React. */
export const signalState = {
  scanOrigin: uniform(new THREE.Vector3()),
  scanRadius: uniform(-1000),
  scanStrength: uniform(0),
  boost: uniform(0),
  critical: uniform(0),
  success: uniform(0),
  failure: uniform(0),
};

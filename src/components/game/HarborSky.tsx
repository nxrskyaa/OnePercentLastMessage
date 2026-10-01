"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageAt } from "@/game/stages";
import { harborHorizon } from "@/game/harbor";
import { useGameStore } from "@/store/gameStore";

/** Distant atmosphere only; all stations, lamps, water and moving objects are geometry. */
export function HarborSky() {
  const sky = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    sky.current?.position.copy(camera.position);
  });
  const stage = stageAt(useGameStore((s) => s.stageIndex));
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(stage.sky[2]) },
      uHorizon: {
        value: new THREE.Color(harborHorizon(stage)),
      },
      uSun: { value: new THREE.Color("#ffdeb0") },
    }),
    [stage],
  );
  return (
    <mesh
      ref={sky}
      onUpdate={(object) => object.layers.enable(1)}
      position={[0, 0, -320]}
      frustumCulled={false}
      renderOrder={-10}
    >
      <sphereGeometry args={[900, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vDirection;
        void main(){vDirection=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`
        uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSun;
        varying vec3 vDirection;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
        void main(){
          vec3 d=normalize(vDirection);
          float height=max(0.,d.y);
          vec3 color=mix(uHorizon,uZenith,smoothstep(0.,.72,height));
          vec3 sunDirection=normalize(vec3(-.65,.23,-.8));
          float alignment=max(0.,dot(d,sunDirection));
          color+=uSun*pow(alignment,22.)*.18;
          color+=uSun*smoothstep(.9991,.9996,alignment)*1.3;
          vec2 uv=d.xz/max(.12,d.y)*vec2(1.5,4.);
          float n=noise(uv)*.6+noise(uv*2.1)*.28+noise(uv*4.2)*.12;
          float clouds=smoothstep(.46,.73,n)*smoothstep(.05,.23,height)*(1.-smoothstep(.55,.85,height));
          color=mix(color,uHorizon*1.25,clouds*.36);
          color=mix(color,uHorizon*.68,(1.-smoothstep(-.4,0.,d.y)));
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`}
      />
    </mesh>
  );
}

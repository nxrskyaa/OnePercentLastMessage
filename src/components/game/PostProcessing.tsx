"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useSettingsStore } from "@/store/settingsStore";

export function PostProcessing() {
  const bloom = useSettingsStore((state) => state.bloom);
  const screenEffects = useSettingsStore((state) => state.screenEffects);
  const quality = useSettingsStore((state) => state.runtimeQuality);
  if (!bloom || !screenEffects || quality === "low") return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={quality === "high" ? 0.32 : 0.18}
        luminanceThreshold={1.0}
        mipmapBlur
      />
    </EffectComposer>
  );
}

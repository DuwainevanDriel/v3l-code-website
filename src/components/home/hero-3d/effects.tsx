"use client";

import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { StudioEnvironment } from "./studio-env";
import type { Palette } from "./types";

/**
 * Studio lighting baked once into an environment map (no HDR download) and
 * bloom so only emissive parts glow.
 */
export function Effects({
  full,
  palette,
}: {
  full: boolean;
  palette: Palette;
}) {
  return (
    <>
      <StudioEnvironment palette={palette} />
      <EffectComposer
        multisampling={full ? 2 : 0}
        resolutionScale={full ? 1 : 0.6}
      >
        <Bloom
          mipmapBlur
          luminanceThreshold={1.35}
          luminanceSmoothing={0.25}
          intensity={full ? 1.15 : 0.85}
          radius={0.5}
        />
        <Noise
          opacity={full ? 0.035 : 0}
          blendFunction={BlendFunction.OVERLAY}
        />
        <ToneMapping mode={ToneMappingMode.AGX} />
      </EffectComposer>
    </>
  );
}

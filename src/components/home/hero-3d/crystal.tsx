"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  ConeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SphereGeometry,
  TorusGeometry,
  type PointLight,
} from "three";
import {
  BEAT,
  CRYSTAL_POS,
  backOut,
  damp,
  smooth,
  span,
} from "@/lib/hero-story";
import type { Palette, StoryRef } from "./types";

const PULSE_EVERY = 2.4;

function createCrystalAssets(palette: Palette) {
  const lime = new Color(palette.accent);
  const cone = new ConeGeometry(0.42, 0.62, 4, 1);
  const topMat = new MeshPhysicalMaterial({
    color: "#f2f4fb",
    roughness: 0.12,
    clearcoat: 1,
    flatShading: true,
    emissive: new Color(0, 0, 0),
  });
  const bottomMat = new MeshPhysicalMaterial({
    color: palette.accent2,
    roughness: 0.18,
    metalness: 0.2,
    clearcoat: 1,
    flatShading: true,
    emissive: new Color(palette.accent2),
    emissiveIntensity: 0,
  });
  const top = new Mesh(cone, topMat);
  top.position.y = 0.31;
  const bottom = new Mesh(cone, bottomMat);
  bottom.rotation.x = Math.PI;
  bottom.position.y = -0.31;
  const ringGeo = new TorusGeometry(1, 0.006, 6, 128);
  const ringMat = new MeshBasicMaterial({
    color: lime.clone().multiplyScalar(1.8),
    toneMapped: false,
    transparent: true,
    opacity: 0,
  });
  const rings = [0.55, 0.8].map((r) => {
    const m = new Mesh(ringGeo, ringMat);
    m.rotation.x = Math.PI / 2;
    m.scale.setScalar(r);
    return m;
  });
  const beadGeo = new SphereGeometry(0.045, 16, 12);
  const beadMat = new MeshPhysicalMaterial({
    color: "#e9ecf5",
    roughness: 0.2,
    clearcoat: 1,
  });
  const beads = [0, 1, 2].map(() => new Mesh(beadGeo, beadMat));
  const pulseMat = new MeshBasicMaterial({
    color: lime.clone().multiplyScalar(3),
    toneMapped: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const pulse = new Mesh(ringGeo, pulseMat);
  pulse.rotation.x = Math.PI / 2;
  return {
    cone,
    topMat,
    bottomMat,
    top,
    bottom,
    ringGeo,
    ringMat,
    rings,
    beadGeo,
    beadMat,
    beads,
    pulseMat,
    pulse,
  };
}

type CrystalAssets = ReturnType<typeof createCrystalAssets>;

interface CrystalParts {
  gem: Group | null;
  orbit: Group | null;
  light: PointLight | null;
  hovered: boolean;
  spin: { current: number };
}

function animateCrystal(
  assets: CrystalAssets,
  parts: CrystalParts,
  t: number,
  elapsed: number,
  delta: number,
) {
  const pad = smooth(span(t, BEAT.plan + 1.2, 1));
  const arrive = span(t, BEAT.ship + 0.2, 1);
  const live = smooth(span(t, BEAT.live, 1));

  assets.ringMat.opacity = 0.25 * pad + 0.45 * live;
  assets.beads.forEach((bead, i) => {
    const a = elapsed * (0.5 + i * 0.12) + (i * Math.PI * 2) / 3;
    const r = i === 1 ? 0.8 : 0.55;
    bead.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
    bead.scale.setScalar(pad || 0.001);
  });

  parts.spin.current = damp(
    parts.spin.current,
    parts.hovered ? 4 : 0.6 + live * 0.4,
    4,
    delta,
  );
  if (parts.gem) {
    const s = backOut(arrive, 2);
    parts.gem.visible = arrive > 0;
    parts.gem.scale.setScalar(s || 0.001);
    parts.gem.position.y =
      CRYSTAL_POS[1] -
      (1 - smooth(arrive)) * 0.9 +
      Math.sin(elapsed * 1.2) * 0.07 * live;
    parts.gem.rotation.y += parts.spin.current * delta;
  }
  if (parts.orbit) parts.orbit.rotation.y = elapsed * 0.15;

  const sincePulse = live > 0 ? (elapsed % PULSE_EVERY) / PULSE_EVERY : 1;
  const arrivalPulse = span(t, BEAT.ship + 1.9, 0.9);
  const p = live > 0.5 ? sincePulse : arrivalPulse;
  assets.pulse.visible = p > 0 && p < 1;
  assets.pulse.scale.setScalar(0.4 + p * 1.6);
  assets.pulseMat.opacity = (1 - p) * 0.9;

  const glow = 0.4 * smooth(arrive) + 0.6 * live + (parts.hovered ? 0.8 : 0);
  assets.bottomMat.emissiveIntensity = glow;
  if (parts.light) parts.light.intensity = 5 * glow;
}

/** The deploy target: a floating crystal over an orbit pad. It lights up when the build ships. */
export function Crystal({
  story,
  palette,
  interactive,
  onLabel,
}: {
  story: StoryRef;
  palette: Palette;
  interactive: boolean;
  onLabel: (label: string | null) => void;
}) {
  const gem = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const hovered = useRef(false);
  const spin = useRef(0.6);

  const assets = useMemo(() => createCrystalAssets(palette), [palette]);

  useEffect(
    () => () => {
      assets.cone.dispose();
      assets.topMat.dispose();
      assets.bottomMat.dispose();
      assets.ringGeo.dispose();
      assets.ringMat.dispose();
      assets.beadGeo.dispose();
      assets.beadMat.dispose();
      assets.pulseMat.dispose();
    },
    [assets],
  );

  useFrame((state, delta) =>
    animateCrystal(
      assets,
      {
        gem: gem.current,
        orbit: orbit.current,
        light: light.current,
        hovered: hovered.current,
        spin,
      },
      story.current.t,
      state.clock.elapsedTime,
      delta,
    ),
  );

  return (
    <group position={[CRYSTAL_POS[0], 0, CRYSTAL_POS[2]]}>
      <group ref={orbit}>
        {assets.rings.map((m, i) => (
          <primitive key={`r${i}`} object={m} />
        ))}
        {assets.beads.map((m, i) => (
          <primitive key={`b${i}`} object={m} />
        ))}
      </group>
      <primitive object={assets.pulse} />
      <group
        ref={gem}
        onPointerOver={(e) => {
          if (!interactive || story.current.t < BEAT.live) return;
          e.stopPropagation();
          hovered.current = true;
          onLabel("Hosting");
        }}
        onPointerOut={() => {
          if (!hovered.current) return;
          hovered.current = false;
          onLabel(null);
        }}
      >
        <primitive object={assets.top} />
        <primitive object={assets.bottom} />
        <pointLight
          ref={light}
          color={palette.accent2}
          intensity={0}
          distance={4}
          decay={2}
        />
      </group>
    </group>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  TorusGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  BEAT,
  CUBE_GAP,
  CUBE_SIZE,
  FLY_SECONDS,
  backOut,
  buildCluster,
  damp,
  scanHeight,
  smooth,
  span,
  type CubeKind,
  type CubeSpec,
} from "@/lib/hero-story";
import { PORCELAIN, type Palette, type StoryRef } from "./types";

function material(kind: CubeKind, palette: Palette): MeshPhysicalMaterial {
  if (kind === "glass") {
    return new MeshPhysicalMaterial({
      color: "#e4e8ff",
      transmission: 0.88,
      thickness: 0.35,
      roughness: 0.04,
      ior: 1.45,
      attenuationColor: new Color(palette.accent2),
      attenuationDistance: 6,
      specularIntensity: 1,
      envMapIntensity: 1.6,
      clearcoat: 1,
      emissive: new Color(0, 0, 0),
    });
  }
  if (kind === "accent") {
    return new MeshPhysicalMaterial({
      color: palette.accent2,
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: new Color(0, 0, 0),
    });
  }
  return new MeshPhysicalMaterial({
    color: PORCELAIN,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: new Color(0, 0, 0),
  });
}

function createClusterAssets(cubes: readonly CubeSpec[], palette: Palette) {
  const geo = new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 3, 0.07);
  const mats = cubes.map((c) => material(c.kind, palette));
  const meshes = cubes.map((c, i) => {
    const m = new Mesh(geo, mats[i]);
    m.visible = false;
    m.userData.index = i;
    return m;
  });
  const lime = new Color(palette.accent);
  const violet = new Color(palette.accent2);
  const mix = new Color();
  const ringGeo = new TorusGeometry(1.25, 0.012, 8, 96);
  const ringMat = new MeshBasicMaterial({
    color: lime.clone().multiplyScalar(4),
    toneMapped: false,
    transparent: true,
  });
  const ring = new Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  const sheetGeo = new PlaneGeometry(1.9, 1.9);
  const sheetMat = new MeshBasicMaterial({
    color: lime,
    transparent: true,
    opacity: 0.12,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
  const sheet = new Mesh(sheetGeo, sheetMat);
  sheet.rotation.x = -Math.PI / 2;
  return {
    geo,
    mats,
    meshes,
    lime,
    violet,
    mix,
    ringGeo,
    ringMat,
    ring,
    sheetGeo,
    sheetMat,
    sheet,
  };
}

type ClusterAssets = ReturnType<typeof createClusterAssets>;

const easeInOut = (v: number): number =>
  v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;

interface ClusterParts {
  group: Group | null;
  hovered: number;
  lift: number[];
}

function animateCluster(
  assets: ClusterAssets,
  cubes: readonly CubeSpec[],
  top: number,
  parts: ClusterParts,
  t: number,
  elapsed: number,
  delta: number,
) {
  const live = smooth(span(t, BEAT.live, 1.2));
  const scan = scanHeight(t, top);
  const pitch = CUBE_SIZE + CUBE_GAP;
  const hov = parts.hovered;
  const hovSlot = hov >= 0 ? cubes[hov].slot : null;

  if (parts.group) {
    parts.group.position.y = live * Math.sin(elapsed * 0.9) * 0.035;
  }

  assets.ring.visible = scan !== null;
  assets.sheet.visible = scan !== null;
  if (scan !== null) {
    assets.ring.position.y = scan;
    assets.sheet.position.y = scan;
    const p = span(t, BEAT.test, BEAT.ship - BEAT.test - 0.3);
    assets.ringMat.opacity = Math.sin(Math.PI * p);
    assets.sheetMat.opacity = 0.14 * Math.sin(Math.PI * p);
  }

  assets.meshes.forEach((mesh, i) => {
    const spec = cubes[i];
    const born = span(t, spec.bornAt, 0.45);
    mesh.visible = born > 0;
    if (!mesh.visible) return;

    const fly = span(t, spec.flyAt, FLY_SECONDS);
    const e = easeInOut(fly);
    const [ox, oy, oz] = spec.origin;
    const [sx, sy, sz] = spec.slot;
    const bob = (1 - e) * Math.sin(elapsed * 1.7 + i * 0.9) * 0.06;
    let x = ox + (sx - ox) * e;
    let y = oy + (sy - oy) * e + Math.sin(Math.PI * e) * 0.9 + bob;
    let z = oz + (sz - oz) * e;

    // Live: a slow ripple travels across the tower, plus hover lift and neighbour nudge.
    const dist = Math.hypot(sx, sz) + (sy - 0.55) * 0.6;
    const ripple =
      live * Math.max(0, Math.sin(elapsed * 1.4 - dist * 2.4)) ** 10 * 0.09;
    const wantLift = hov === i ? 0.32 : 0;
    parts.lift[i] = damp(parts.lift[i], wantLift, 9, delta);
    y += parts.lift[i] + ripple;
    if (hovSlot && hov !== i) {
      const dx = sx - hovSlot[0];
      const dz = sz - hovSlot[2];
      const d = Math.hypot(dx, dz, (sy - hovSlot[1]) * 0.8);
      if (d > 0 && d < pitch * 1.6) {
        const push = (0.05 * (pitch * 1.6 - d)) / (pitch * 1.6);
        x += (dx / (d || 1)) * push;
        z += (dz / (d || 1)) * push;
      }
    }
    mesh.position.set(x, y, z);

    const spin = 1 - e;
    mesh.rotation.set(
      spin * (elapsed * 0.7 + i),
      spin * (elapsed * 0.9 + i * 0.5) + parts.lift[i] * 0.6,
      spin * 0.4,
    );

    // Pop in with overshoot, then squash and settle on landing.
    const size = backOut(born);
    const land = span(t, spec.flyAt + FLY_SECONDS, 0.4);
    const squash =
      land > 0 && land < 1 ? Math.sin(Math.PI * land) * (1 - land) : 0;
    const shrink = 0.62 + 0.38 * e;
    mesh.scale.set(
      size * shrink * (1 + 0.14 * squash),
      size * shrink * (1 - 0.24 * squash),
      size * shrink * (1 + 0.14 * squash),
    );

    // Test: violet flash as the scan passes, then a lime "passed" glow trailing behind it.
    const mat = assets.mats[i];
    let flash = 0;
    let pass = 0;
    if (scan !== null) {
      flash = Math.exp(-(((scan - sy) / 0.2) ** 2));
      pass = scan > sy ? Math.max(0, 1 - (scan - sy) / 0.9) : 0;
    }
    const hoverGlow = parts.lift[i] * 2.2;
    mat.emissive
      .copy(assets.violet)
      .multiplyScalar(flash * 1.6 + (spec.kind === "glass" ? 0.14 : 0))
      .add(
        assets.mix
          .copy(assets.lime)
          .multiplyScalar(pass * 0.9 + hoverGlow * 0.5 + ripple * 4),
      );
  });
}

export function Cluster({
  story,
  palette,
  layers,
  interactive,
  onLabel,
}: {
  story: StoryRef;
  palette: Palette;
  layers: number;
  interactive: boolean;
  onLabel: (label: string | null) => void;
}) {
  const group = useRef<Group>(null);
  const cubes = useMemo(() => buildCluster(layers), [layers]);
  const top = cubes[cubes.length - 1].slot[1];
  const hovered = useRef(-1);
  const lift = useRef<number[]>(cubes.map(() => 0));

  const assets = useMemo(
    () => createClusterAssets(cubes, palette),
    [cubes, palette],
  );

  useEffect(
    () => () => {
      assets.geo.dispose();
      assets.mats.forEach((m) => m.dispose());
      assets.ringGeo.dispose();
      assets.ringMat.dispose();
      assets.sheetGeo.dispose();
      assets.sheetMat.dispose();
    },
    [assets],
  );

  useFrame((state, delta) =>
    animateCluster(
      assets,
      cubes,
      top,
      { group: group.current, hovered: hovered.current, lift: lift.current },
      story.current.t,
      state.clock.elapsedTime,
      delta,
    ),
  );

  const over = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    const index = e.object.userData.index;
    if (typeof index !== "number") return;
    if (story.current.t < cubes[index].flyAt + FLY_SECONDS) return;
    e.stopPropagation();
    hovered.current = index;
    onLabel(cubes[index].label);
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.userData.index !== hovered.current) return;
    hovered.current = -1;
    onLabel(null);
  };

  return (
    <group ref={group}>
      <primitive object={assets.ring} />
      <primitive object={assets.sheet} />
      {assets.meshes.map((mesh, i) => (
        <primitive
          key={i}
          object={mesh}
          onPointerOver={over}
          onPointerOut={out}
        />
      ))}
    </group>
  );
}

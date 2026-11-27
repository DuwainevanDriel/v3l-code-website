"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
  type ShaderMaterial,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BEAT, CHIP_TOP, smooth, span } from "@/lib/hero-story";
import { COPPER, type Palette, type StoryRef } from "./types";

const CHIP = 3.3;
const PINS_PER_SIDE = 9;
/** z positions of the pipe ports on the +x side, where no pins are drawn. */
const PORT_CLEAR = 0.95;
const UP = new Vector3(0, 1, 0);

interface Pin {
  pos: Vector3;
  /** Where the pin bends down to the floor. */
  tip: Vector3;
  rotY: number;
  delay: number;
}

function buildPins(): Pin[] {
  const pins: Pin[] = [];
  const half = CHIP / 2;
  const step = (CHIP - 0.6) / (PINS_PER_SIDE - 1);
  const sides = [
    { rotY: 0, place: (o: number) => new Vector3(o, 0, half) },
    { rotY: Math.PI, place: (o: number) => new Vector3(o, 0, -half) },
    { rotY: Math.PI / 2, place: (o: number) => new Vector3(half, 0, o) },
    { rotY: -Math.PI / 2, place: (o: number) => new Vector3(-half, 0, o) },
  ];
  sides.forEach((side, s) => {
    for (let i = 0; i < PINS_PER_SIDE; i += 1) {
      const offset = -half + 0.3 + i * step;
      if (s === 2 && Math.abs(offset) < PORT_CLEAR) continue;
      const pos = side.place(offset);
      const out = new Vector3(0, 0, 0.32).applyAxisAngle(UP, side.rotY);
      pins.push({
        pos,
        tip: pos.clone().add(out),
        rotY: side.rotY,
        delay: (s * PINS_PER_SIDE + i) * 0.018,
      });
    }
  });
  return pins;
}

/** Circuit traces on the floor: out from the chip, ending in a square pad. */
const TRACES: readonly (readonly [number, number][])[] = [
  [
    [-1.65, -0.9],
    [-2.5, -0.9],
    [-2.9, -1.3],
    [-3.6, -1.3],
  ],
  [
    [-1.65, 0.7],
    [-2.2, 0.7],
    [-2.7, 1.2],
    [-2.7, 2.3],
  ],
  [
    [0.6, 1.65],
    [0.6, 2.4],
    [1.1, 2.9],
    [1.8, 2.9],
  ],
  [
    [-0.4, -1.65],
    [-0.4, -2.5],
    [0.2, -3.0],
    [1.4, -3.0],
  ],
];

function traceGeometry(points: readonly [number, number][]): BufferGeometry {
  const corners = points.map(([x, z]) => new Vector3(x, 0.006, z));
  const end = corners[corners.length - 1];
  const pad = 0.22;
  const square = [
    new Vector3(end.x - pad, 0.006, end.z - pad),
    new Vector3(end.x + pad, 0.006, end.z - pad),
    new Vector3(end.x + pad, 0.006, end.z + pad),
    new Vector3(end.x - pad, 0.006, end.z + pad),
    new Vector3(end.x - pad, 0.006, end.z - pad),
  ];
  const all = [...corners, ...square];
  const dense: Vector3[] = [];
  for (let i = 0; i < all.length - 1; i += 1) {
    for (let k = 0; k < 24; k += 1) {
      dense.push(all[i].clone().lerp(all[i + 1], k / 24));
    }
  }
  dense.push(all[all.length - 1].clone());
  return new BufferGeometry().setFromPoints(dense);
}

/** A soft, pre-blurred square shadow, so the floor shadow costs nothing per frame. */
function shadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.filter = "blur(18px)";
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();
    ctx.roundRect(52, 52, 152, 152, 18);
    ctx.fill();
  }
  return new CanvasTexture(canvas);
}

function glowTexture(color: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(canvas);
}

function createChipAssets(palette: Palette) {
  const body = new RoundedBoxGeometry(CHIP, 0.3, CHIP, 4, 0.08);
  const bodyMat = new MeshPhysicalMaterial({
    color: "#b9bfcc",
    roughness: 0.38,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  });
  const die = new RoundedBoxGeometry(CHIP - 0.55, 0.04, CHIP - 0.55, 2, 0.02);
  const dieMat = new MeshPhysicalMaterial({
    color: "#161a23",
    roughness: 0.35,
    metalness: 0.4,
    clearcoat: 1,
    emissive: new Color(palette.accent2),
    emissiveIntensity: 0,
  });
  const pinH = new BoxGeometry(0.05, 0.035, 0.34);
  pinH.translate(0, 0, 0.17);
  const pinV = new BoxGeometry(0.05, 0.13, 0.035);
  pinV.translate(0, -0.065, 0);
  const pinMat = new MeshStandardMaterial({
    color: "#c9ced9",
    metalness: 1,
    roughness: 0.22,
  });
  const traceMat = new LineBasicMaterial({
    color: new Color(palette.accent).multiplyScalar(1.6),
    transparent: true,
    opacity: 0.85,
    toneMapped: false,
  });
  const traces = TRACES.map((t) => new Line(traceGeometry(t), traceMat));
  const glowTex = glowTexture(palette.accent2);
  const glowMat = new MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });
  const glowGeo = new PlaneGeometry(7.5, 7.5);
  const shadowTex = shadowTexture();
  const shadowMat = new MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const shadow = new Mesh(glowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  shadow.scale.setScalar(0.74);
  const glow = new Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.002;
  const copper = new MeshStandardMaterial({
    color: COPPER,
    metalness: 1,
    roughness: 0.3,
  });
  return {
    body,
    bodyMat,
    die,
    dieMat,
    pinH,
    pinV,
    pinMat,
    traceMat,
    traces,
    glowTex,
    glowMat,
    glowGeo,
    glow,
    shadowTex,
    shadowMat,
    shadow,
    copper,
  };
}

type ChipAssets = ReturnType<typeof createChipAssets>;

interface ChipParts {
  base: Group | null;
  grid: Mesh | null;
  pinsH: InstancedMesh | null;
  pinsV: InstancedMesh | null;
  pins: readonly Pin[];
  dummy: Object3D;
}

function animateChip(
  assets: ChipAssets,
  parts: ChipParts,
  t: number,
  elapsed: number,
) {
  const rise = smooth(span(t, BEAT.plan + 0.1, 1.1));
  if (parts.base) {
    parts.base.position.y = (1 - rise) * -0.5;
    parts.base.scale.set(0.85 + 0.15 * rise, rise || 0.001, 0.85 + 0.15 * rise);
  }

  parts.pins.forEach((pin, i) => {
    const grow = smooth(span(t, BEAT.plan + 0.6 + pin.delay, 0.35));
    parts.dummy.position.set(pin.pos.x, 0.12, pin.pos.z);
    parts.dummy.rotation.set(0, pin.rotY, 0);
    parts.dummy.scale.set(1, 1, grow || 0.001);
    parts.dummy.updateMatrix();
    parts.pinsH?.setMatrixAt(i, parts.dummy.matrix);
    parts.dummy.position.set(pin.tip.x, 0.12, pin.tip.z);
    parts.dummy.scale.set(1, grow || 0.001, 1);
    parts.dummy.updateMatrix();
    parts.pinsV?.setMatrixAt(i, parts.dummy.matrix);
  });
  if (parts.pinsH) parts.pinsH.instanceMatrix.needsUpdate = true;
  if (parts.pinsV) parts.pinsV.instanceMatrix.needsUpdate = true;

  assets.traces.forEach((line, i) => {
    const total = line.geometry.attributes.position.count;
    const draw = smooth(span(t, BEAT.plan + 0.5 + i * 0.2, 1.2));
    line.geometry.setDrawRange(0, Math.floor(total * draw));
  });
  const live = smooth(span(t, BEAT.live, 1));
  assets.traceMat.opacity =
    0.35 +
    0.5 * (1 - smooth(span(t, BEAT.code, 1))) +
    0.25 * live * (0.5 + 0.5 * Math.sin(elapsed * 2));

  const testGlow = Math.max(
    Math.sin(Math.PI * span(t, BEAT.test, BEAT.ship - BEAT.test)) * 0.35,
    live * (0.08 + 0.06 * Math.sin(elapsed * 1.3)),
  );
  assets.dieMat.emissiveIntensity = testGlow;
  assets.glowMat.opacity = 0.25 * rise + 0.35 * live;
  assets.shadowMat.opacity = rise;

  const g = parts.grid?.material as ShaderMaterial | undefined;
  const fade = g?.uniforms.fadeDistance;
  if (fade) fade.value = 0.01 + 16 * smooth(span(t, BEAT.plan, 1.8));
}

export function Chip({
  story,
  palette,
}: {
  story: StoryRef;
  palette: Palette;
}) {
  const base = useRef<Group>(null);
  const grid = useRef<Mesh>(null);
  const pinsH = useRef<InstancedMesh>(null);
  const pinsV = useRef<InstancedMesh>(null);
  const pins = useMemo(() => buildPins(), []);

  const assets = useMemo(() => createChipAssets(palette), [palette]);

  useEffect(
    () => () => {
      assets.body.dispose();
      assets.bodyMat.dispose();
      assets.die.dispose();
      assets.dieMat.dispose();
      assets.pinH.dispose();
      assets.pinV.dispose();
      assets.pinMat.dispose();
      assets.traceMat.dispose();
      assets.traces.forEach((l) => l.geometry.dispose());
      assets.glowTex.dispose();
      assets.glowMat.dispose();
      assets.shadowTex.dispose();
      assets.shadowMat.dispose();
      assets.glowGeo.dispose();
      assets.copper.dispose();
    },
    [assets],
  );

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state) =>
    animateChip(
      assets,
      {
        base: base.current,
        grid: grid.current,
        pinsH: pinsH.current,
        pinsV: pinsV.current,
        pins,
        dummy,
      },
      story.current.t,
      state.clock.elapsedTime,
    ),
  );

  return (
    <group>
      <Grid
        ref={grid}
        position={[0, 0.001, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.9}
        cellColor="#2c3352"
        sectionSize={2}
        sectionThickness={1.3}
        sectionColor={palette.accent2}
        fadeDistance={0.01}
        fadeStrength={1.3}
        infiniteGrid
      />
      <primitive object={assets.glow} />
      <primitive object={assets.shadow} />
      {assets.traces.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      <group ref={base}>
        <mesh
          geometry={assets.body}
          material={assets.bodyMat}
          position={[0, 0.15, 0]}
        />
        <mesh
          geometry={assets.die}
          material={assets.dieMat}
          position={[0, CHIP_TOP + 0.005, 0]}
        />
        {[-0.6, 0, 0.6].map((z) => (
          <mesh
            key={z}
            position={[CHIP / 2 + 0.04, 0.18, z]}
            rotation={[0, 0, Math.PI / 2]}
            material={assets.copper}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.1, 20]} />
          </mesh>
        ))}
      </group>
      <instancedMesh
        ref={pinsH}
        args={[assets.pinH, assets.pinMat, pins.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={pinsV}
        args={[assets.pinV, assets.pinMat, pins.length]}
        frustumCulled={false}
      />
    </group>
  );
}

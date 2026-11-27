export const STORY_SECONDS = 12;

/** The software lifecycle, told in five beats plus an endless "Live" idle. */
export const BEATS = [
  { key: "plan", num: "01", label: "Plan", start: 0 },
  { key: "code", num: "02", label: "Code", start: 2 },
  { key: "build", num: "03", label: "Build", start: 4.5 },
  { key: "test", num: "04", label: "Test", start: 7 },
  { key: "ship", num: "05", label: "Ship", start: 9 },
  { key: "live", num: "", label: "Live", start: 11.5 },
] as const;

export const BEAT = {
  plan: BEATS[0].start,
  code: BEATS[1].start,
  build: BEATS[2].start,
  test: BEATS[3].start,
  ship: BEATS[4].start,
  live: BEATS[5].start,
} as const;

export const CODE_SNIPPET = `const app = await v3l.build({
  idea: "your product",
  stack: ["web", "mobile"],
  host: "managed",
});
app.ship();`;

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Smoothstep easing, 0 to 1. */
export const smooth = (v: number): number => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Ease out with a small overshoot, like GSAP `back.out(1.6)`. */
export const backOut = (v: number, overshoot = 1.6): number => {
  const t = clamp01(v) - 1;
  return 1 + (overshoot + 1) * t * t * t + overshoot * t * t;
};

/** Ease out, like GSAP `expo.out`. */
export const expoOut = (v: number): number => {
  const t = clamp01(v);
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
};

/** Progress of a window that starts at `start` and lasts `duration` seconds. */
export const span = (t: number, start: number, duration: number): number =>
  clamp01((t - start) / duration);

/**
 * Frame rate independent damping towards `target`.
 * `lambda` is responsiveness: higher reaches the target faster.
 */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number => current + (target - current) * (1 - Math.exp(-lambda * delta));

/** Index of the beat playing at story time `t` (seconds). */
export function beatAt(t: number): number {
  let index = 0;
  BEATS.forEach((beat, i) => {
    if (t >= beat.start) index = i;
  });
  return index;
}

/** Number of code characters visible at story time `t`. Typed during the Code beat. */
export function typedChars(t: number, total = CODE_SNIPPET.length): number {
  return Math.floor(total * span(t, BEAT.code, BEAT.build - BEAT.code - 0.3));
}

export type Vec3 = readonly [number, number, number];

export type CubeKind = "glass" | "gloss" | "accent";

export interface CubeSpec {
  kind: CubeKind;
  /** Where the cube pops out of the code, floating above the chip. */
  origin: Vec3;
  /** Final cell in the cluster on the chip. */
  slot: Vec3;
  /** Story time the cube pops out of the code (Code beat). */
  bornAt: number;
  /** Story time the cube starts flying to its slot (Build beat). */
  flyAt: number;
  /** Decorative label shown on hover. */
  label: string;
}

/** Deterministic pseudo random numbers, so the scene is identical on every load. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CUBE_SIZE = 0.5;
export const CUBE_GAP = 0.07;
/** Top surface of the chip, in world units. */
export const CHIP_TOP = 0.3;
/** Seconds a cube takes to fly from the cloud to its slot. */
export const FLY_SECONDS = 0.75;

const LABELS = ["Web", "Apps", "Domains"] as const;

/**
 * The cube cluster that sits on the chip: 3 × 3 cells per layer.
 * Cubes stack bottom layer first, so the tower visibly grows.
 */
export function buildCluster(layers: number): CubeSpec[] {
  const rand = seeded(20);
  const pitch = CUBE_SIZE + CUBE_GAP;
  const count = layers * 9;
  const codeWindow = BEAT.build - BEAT.code - 0.4;
  const buildWindow = BEAT.test - BEAT.build - FLY_SECONDS - 0.2;
  return Array.from({ length: count }, (_, i) => {
    const layer = Math.floor(i / 9);
    const cell = i % 9;
    const x = (cell % 3) - 1;
    const z = Math.floor(cell / 3) - 1;
    const roll = rand();
    const kind: CubeKind =
      roll < 0.34 ? "glass" : roll < 0.8 ? "gloss" : "accent";
    return {
      kind,
      origin: [
        0.2 + rand() * 1.5,
        1.95 + rand() * 0.7,
        -0.5 + rand() * 0.8,
      ] as const,
      slot: [
        x * pitch,
        CHIP_TOP + CUBE_SIZE / 2 + layer * pitch,
        z * pitch,
      ] as const,
      bornAt: BEAT.code + 0.2 + (i / count) * codeWindow,
      flyAt: BEAT.build + (i / count) * buildWindow,
      label: LABELS[(x + 1 + layer) % LABELS.length],
    };
  });
}

/** Where the deploy crystal floats. */
export const CRYSTAL_POS: Vec3 = [3.75, 1.3, 0.35];

/** Control points for the three pipes from the chip's ports to the crystal pad. */
export const PIPE_PATHS: readonly (readonly Vec3[])[] = [
  [
    [1.75, 0.18, -0.6],
    [2.3, 0.18, -0.75],
    [2.75, 0.95, -0.45],
    [3.05, 0.45, -0.05],
    [3.25, 0.1, 0.08],
  ],
  [
    [1.75, 0.18, 0],
    [2.4, 0.18, 0.02],
    [2.85, 0.22, 0.3],
    [3.18, 0.1, 0.35],
  ],
  [
    [1.75, 0.18, 0.6],
    [2.2, 0.18, 0.95],
    [2.7, 0.5, 1.2],
    [3.1, 0.3, 0.85],
    [3.27, 0.1, 0.63],
  ],
];

/** Height of the scanning ring during the Test beat, or `null` outside it. */
export function scanHeight(t: number, top: number): number | null {
  const p = span(t, BEAT.test, BEAT.ship - BEAT.test - 0.3);
  if (p <= 0 || p >= 1) return null;
  return CHIP_TOP + (top - CHIP_TOP + 0.4) * smooth(p);
}

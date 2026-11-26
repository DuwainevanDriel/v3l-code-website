export const STORY_SECONDS = 10.5;

export const BEATS = [
  { key: "write", label: "01 Write", start: 0 },
  { key: "build", label: "02 Build", start: 3 },
  { key: "flow", label: "03 Flow", start: 5 },
  { key: "ship", label: "04 Ship", start: 7.5 },
  { key: "live", label: "Live", start: 10 },
] as const;

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

/** Index of the beat playing at story time `t` (seconds). */
export function beatAt(t: number): number {
  let index = 0;
  BEATS.forEach((beat, i) => {
    if (t >= beat.start) index = i;
  });
  return index;
}

/** Number of code characters visible at story time `t`. */
export function typedChars(t: number, total = CODE_SNIPPET.length): number {
  return Math.floor(total * clamp01(t / BEATS[1].start));
}

export type Vec3 = readonly [number, number, number];

export interface CubeSlot {
  /** Where the cube spawns, from the code editor. */
  origin: Vec3;
  /** Loose cloud position in the build beat. */
  cloud: Vec3;
  /** Pipe lane, 0 to 2. */
  lane: number;
  /** Final position and size inside the product UI. */
  slot: Vec3;
  slotScale: Vec3;
}

export const CUBE_SIZE = 0.26;

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

interface Panel {
  pos: Vec3;
  scale: Vec3;
}

/** The product UI the cubes unfold into: sidebar, top bar, three stat cards, bar chart. */
const PANELS: readonly Panel[] = [
  { pos: [-1.5, -0.1, 0], scale: [0.7, 3.0, 0.1] },
  { pos: [0.6, 1.25, 0], scale: [3.3, 0.45, 0.1] },
  { pos: [-0.45, 0.45, 0], scale: [1.0, 0.7, 0.1] },
  { pos: [0.7, 0.45, 0], scale: [1.0, 0.7, 0.1] },
  { pos: [1.85, 0.45, 0], scale: [1.0, 0.7, 0.1] },
  { pos: [-0.45, -0.85, 0], scale: [0.35, 0.5, 0.1] },
  { pos: [0.05, -0.75, 0], scale: [0.35, 0.7, 0.1] },
  { pos: [0.55, -0.65, 0], scale: [0.35, 0.9, 0.1] },
  { pos: [1.05, -0.8, 0], scale: [0.35, 0.6, 0.1] },
  { pos: [1.55, -0.55, 0], scale: [0.35, 1.1, 0.1] },
  { pos: [2.05, -0.7, 0], scale: [0.35, 0.8, 0.1] },
  { pos: [2.55, -0.6, 0], scale: [0.35, 1.0, 0.1] },
];

export function buildLayout(count: number): CubeSlot[] {
  const rand = seeded(20);
  return Array.from({ length: count }, (_, i) => {
    const panel = PANELS[i % PANELS.length];
    const layer = Math.floor(i / PANELS.length);
    const row = i % 7;
    return {
      origin: [-3.2 + rand() * 1.2, 1.4 - row * 0.4, 0.2],
      cloud: [-2 + rand() * 4, -1.2 + rand() * 2.8, -1 + rand() * 2],
      lane: i % 3,
      slot: [panel.pos[0], panel.pos[1], panel.pos[2] + layer * 0.14],
      slotScale: panel.scale,
    };
  });
}

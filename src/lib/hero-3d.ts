export type HeroTier = "full" | "lite" | "poster";

export interface HeroEnv {
  reducedMotion: boolean;
  motionPaused: boolean;
  saveData: boolean;
  webgl: boolean;
  coarsePointer: boolean;
  deviceMemory: number | undefined;
}

/**
 * Decides how much of the 3D hero a visitor gets.
 * Poster is the safe default: reduced motion, paused motion, Save-Data, no WebGL,
 * and touch devices that are not known to have at least 4 GB of memory.
 */
export function chooseHeroTier(env: HeroEnv): HeroTier {
  if (env.reducedMotion || env.motionPaused || env.saveData || !env.webgl) {
    return "poster";
  }
  if (env.coarsePointer) {
    return env.deviceMemory !== undefined && env.deviceMemory >= 4
      ? "lite"
      : "poster";
  }
  return "full";
}

/** Next tier down when the frame rate sampler reports a slow device. */
export function downgradeTier(tier: HeroTier): HeroTier {
  return tier === "full" ? "lite" : "poster";
}

export const MIN_MEDIAN_FPS = 45;

/** Median frames per second from frame deltas in seconds. Empty input counts as healthy. */
export function medianFps(deltas: readonly number[]): number {
  const valid = deltas.filter((d) => d > 0);
  if (valid.length === 0) return Infinity;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianDelta =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return 1 / medianDelta;
}

/** True when WebGL2 can create a context. Releases the probe context immediately. */
export function detectWebGL(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function readHeroEnv(
  win: Window = window,
  motionPaused = false,
): HeroEnv {
  const nav = win.navigator as Navigator & NavigatorHints;
  return {
    reducedMotion: win.matchMedia("(prefers-reduced-motion: reduce)").matches,
    motionPaused,
    saveData: nav.connection?.saveData === true,
    webgl: detectWebGL(win.document),
    coarsePointer: win.matchMedia("(pointer: coarse)").matches,
    deviceMemory: nav.deviceMemory,
  };
}

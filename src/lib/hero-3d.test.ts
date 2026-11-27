import { describe, expect, it } from "vitest";
import {
  chooseHeroTier,
  detectWebGL,
  downgradeTier,
  medianFps,
  type HeroEnv,
} from "./hero-3d";
import {
  BEAT,
  BEATS,
  FLY_SECONDS,
  beatAt,
  buildCluster,
  damp,
  scanHeight,
  typedChars,
} from "./hero-story";

const desktop: HeroEnv = {
  reducedMotion: false,
  motionPaused: false,
  saveData: false,
  webgl: true,
  coarsePointer: false,
  deviceMemory: 8,
};

describe("chooseHeroTier", () => {
  it("gives capable desktops the full scene", () => {
    expect(chooseHeroTier(desktop)).toBe("full");
  });

  it.each([
    ["reduced motion", { reducedMotion: true }],
    ["paused motion", { motionPaused: true }],
    ["Save-Data", { saveData: true }],
    ["no WebGL", { webgl: false }],
  ])("falls back to the poster for %s", (_name, patch) => {
    expect(chooseHeroTier({ ...desktop, ...patch })).toBe("poster");
  });

  it("uses lite on touch devices with enough memory, poster otherwise", () => {
    const touch = { ...desktop, coarsePointer: true };
    expect(chooseHeroTier({ ...touch, deviceMemory: 4 })).toBe("lite");
    expect(chooseHeroTier({ ...touch, deviceMemory: 2 })).toBe("poster");
    expect(chooseHeroTier({ ...touch, deviceMemory: undefined })).toBe(
      "poster",
    );
  });

  it("downgrades one step at a time", () => {
    expect(downgradeTier("full")).toBe("lite");
    expect(downgradeTier("lite")).toBe("poster");
    expect(downgradeTier("poster")).toBe("poster");
  });
});

describe("detectWebGL", () => {
  it("is false when the browser cannot create a context", () => {
    const doc = {
      createElement: () => ({ getContext: () => null }),
    } as unknown as Document;
    expect(detectWebGL(doc)).toBe(false);
  });

  it("is false when context creation throws", () => {
    const doc = {
      createElement: () => ({
        getContext: () => {
          throw new Error("blocked");
        },
      }),
    } as unknown as Document;
    expect(detectWebGL(doc)).toBe(false);
  });

  it("is true when a context is available", () => {
    const doc = {
      createElement: () => ({
        getContext: () => ({ getExtension: () => null }),
      }),
    } as unknown as Document;
    expect(detectWebGL(doc)).toBe(true);
  });
});

describe("medianFps", () => {
  it("reports the median, ignoring one slow frame", () => {
    const deltas = [...Array<number>(59).fill(1 / 60), 0.5];
    expect(Math.round(medianFps(deltas))).toBe(60);
  });

  it("detects a slow device", () => {
    expect(medianFps(Array<number>(60).fill(1 / 30))).toBeCloseTo(30);
  });
});

describe("story", () => {
  it("maps time to the lifecycle beats", () => {
    expect(BEATS.map((b) => b.label)).toEqual([
      "Plan",
      "Code",
      "Build",
      "Test",
      "Ship",
      "Live",
    ]);
    expect([0, 2, 4.5, 7, 9, 11.9].map(beatAt)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("types the snippet during the Code beat", () => {
    expect(typedChars(BEAT.code, 100)).toBe(0);
    expect(typedChars(BEAT.plan, 100)).toBe(0);
    expect(typedChars(BEAT.build, 100)).toBe(100);
  });

  it("builds a stable cluster for both quality tiers", () => {
    for (const layers of [2, 3]) {
      const cluster = buildCluster(layers);
      expect(cluster).toHaveLength(layers * 9);
      expect(buildCluster(layers)).toEqual(cluster);
      const slots = new Set(cluster.map((c) => c.slot.join(",")));
      expect(slots.size).toBe(cluster.length);
    }
  });

  it("lands every cube before the Test beat", () => {
    for (const cube of buildCluster(3)) {
      expect(cube.bornAt).toBeGreaterThanOrEqual(BEAT.code);
      expect(cube.bornAt).toBeLessThan(BEAT.build);
      expect(cube.flyAt + FLY_SECONDS).toBeLessThanOrEqual(BEAT.test);
    }
  });

  it("only scans during the Test beat", () => {
    expect(scanHeight(BEAT.build, 2)).toBeNull();
    expect(scanHeight(BEAT.test + 0.5, 2)).not.toBeNull();
    expect(scanHeight(BEAT.live, 2)).toBeNull();
  });

  it("damps towards the target independent of frame rate", () => {
    let fast = 0;
    for (let i = 0; i < 120; i += 1) fast = damp(fast, 1, 4, 1 / 120);
    let slow = 0;
    for (let i = 0; i < 30; i += 1) slow = damp(slow, 1, 4, 1 / 30);
    expect(fast).toBeCloseTo(slow, 5);
  });
});

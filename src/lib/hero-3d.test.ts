import { describe, expect, it } from "vitest";
import {
  chooseHeroTier,
  detectWebGL,
  downgradeTier,
  medianFps,
  type HeroEnv,
} from "./hero-3d";
import { BEATS, buildLayout, beatAt, typedChars } from "./hero-story";

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
  it("maps time to the five beats", () => {
    expect(BEATS).toHaveLength(5);
    expect([0, 3, 5, 7.5, 10.4].map(beatAt)).toEqual([0, 1, 2, 3, 4]);
  });

  it("types the snippet over the first beat", () => {
    expect(typedChars(0, 100)).toBe(0);
    expect(typedChars(1.5, 100)).toBe(50);
    expect(typedChars(9, 100)).toBe(100);
  });

  it("builds a stable layout for both quality tiers", () => {
    for (const count of [12, 24]) {
      const layout = buildLayout(count);
      expect(layout).toHaveLength(count);
      expect(buildLayout(count)).toEqual(layout);
    }
  });
});

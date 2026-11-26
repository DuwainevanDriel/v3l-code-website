import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroScene } from "./hero-scene";

vi.mock("next/dynamic", () => ({
  default: () => () => <canvas data-testid="stage" />,
}));

function stubEnvironment({
  reducedMotion,
  webgl,
}: {
  reducedMotion: boolean;
  webgl: boolean;
}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reducedMotion : false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
    kind: string,
  ) =>
    webgl && kind === "webgl2"
      ? { getExtension: () => null }
      : null) as typeof HTMLCanvasElement.prototype.getContext);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {
        return undefined;
      }
      disconnect() {
        return undefined;
      }
    },
  );
}

describe("HeroScene fallback", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "on";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("always renders the poster as an accessible image", () => {
    stubEnvironment({ reducedMotion: false, webgl: true });
    render(<HeroScene />);
    expect(
      screen.getByRole("img", { name: /^Illustration:/ }),
    ).toBeInTheDocument();
  });

  it("stays on the poster without WebGL", () => {
    stubEnvironment({ reducedMotion: false, webgl: false });
    const { container } = render(<HeroScene />);
    expect(container.querySelector("[data-hero-scene]")).toHaveAttribute(
      "data-hero-scene",
      "poster",
    );
    expect(screen.queryByTestId("stage")).not.toBeInTheDocument();
  });

  it("stays on the poster for reduced motion", () => {
    stubEnvironment({ reducedMotion: true, webgl: true });
    const { container } = render(<HeroScene />);
    expect(container.querySelector("[data-hero-scene]")).toHaveAttribute(
      "data-hero-scene",
      "poster",
    );
    expect(screen.queryByTestId("stage")).not.toBeInTheDocument();
  });

  it("picks the full tier when the device allows it", () => {
    stubEnvironment({ reducedMotion: false, webgl: true });
    const { container } = render(<HeroScene />);
    expect(container.querySelector("[data-hero-scene]")).toHaveAttribute(
      "data-hero-scene",
      "full",
    );
  });
});

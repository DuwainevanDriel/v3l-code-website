import gsap from "gsap";

export const MOTION_STORAGE_KEY = "v3l-motion";

/** True unless the visitor has paused animations via the footer toggle. */
export function motionPaused(): boolean {
  return document.documentElement.dataset.motion === "off";
}

/**
 * Runs `setup` only when the OS allows motion and the footer toggle is not paused.
 * Content stays visible by default; hidden start states are applied here, in JS, only.
 */
export function whenMotionAllowed(
  setup: () => void | (() => void),
): () => void {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (motionPaused()) return undefined;
    return setup();
  });
  return () => mm.revert();
}

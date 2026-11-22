"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Registers GSAP plugins once on the client and, unless the user prefers reduced
 * motion, drives Lenis smooth scroll from the GSAP ticker so ScrollTrigger stays in sync.
 * Component animations should use `useGSAP` from `@gsap/react` and wrap motion in
 * `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      tick = null;
    };
    const start = () => {
      stop();
      if (mq.matches) return;
      const instance = new Lenis({ autoRaf: false });
      lenis = instance;
      instance.on("scroll", ScrollTrigger.update);
      tick = (time) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    start();
    mq.addEventListener("change", start);
    return () => {
      mq.removeEventListener("change", start);
      stop();
    };
  }, []);

  return <>{children}</>;
}

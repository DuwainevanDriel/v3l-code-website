"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { HeroPoster } from "@/components/home/hero-poster";
import {
  chooseHeroTier,
  downgradeTier,
  readHeroEnv,
  type HeroTier,
} from "@/lib/hero-3d";
import { motionPaused } from "@/lib/motion";

const HeroStage = dynamic(() => import("@/components/home/hero-stage"), {
  ssr: false,
});

const READY_TIMEOUT_MS = 4000;

class StageBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The poster is shown only to visitors who do not get the 3D scene (and without JS),
 * so a 3D visitor never sees a static image swap out. It is server-rendered inside a box with a fixed
 * aspect ratio (no layout shift). The 3D chunk is requested only when the browser is
 * idle, the box is visible and the visitor's device and settings allow it.
 */
export function HeroScene() {
  const box = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<HeroTier>("poster");
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  /** False until the client has picked a tier, so a 3D visitor never sees the poster first. */
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      setTier(chooseHeroTier(readHeroEnv(window, motionPaused())));
      setDecided(true);
    };
    evaluate();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", evaluate);
    return () => mq.removeEventListener("change", evaluate);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (tier === "poster" || !el || load) return undefined;
    const hasIdle = typeof window.requestIdleCallback === "function";
    let idle = 0;
    let visible = false;
    let idleDone = false;
    const maybeLoad = () => {
      if (visible && idleDone) setLoad(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        maybeLoad();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    const onIdle = () => {
      idleDone = true;
      maybeLoad();
    };
    if (hasIdle) {
      idle = window.requestIdleCallback(onIdle);
    } else {
      idle = window.setTimeout(onIdle, 1200);
    }
    return () => {
      observer.disconnect();
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [tier, load]);

  useEffect(() => {
    if (!load || ready) return undefined;
    const timer = window.setTimeout(() => {
      setLoad(false);
      setTier("poster");
    }, READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [load, ready]);

  const toPoster = () => {
    setLoad(false);
    setReady(false);
    setTier("poster");
  };

  return (
    <div
      ref={box}
      data-hero-scene={tier}
      className="relative mx-auto mt-12 aspect-4/5 max-h-[60svh] w-full sm:aspect-16/10 sm:max-h-none lg:mt-0 lg:aspect-auto lg:h-full lg:max-h-none"
    >
      <noscript>
        <style>{"[data-hero-poster]{opacity:1!important}"}</style>
      </noscript>
      <div
        data-hero-poster
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: decided && tier === "poster" ? 1 : 0 }}
      >
        <HeroPoster />
      </div>
      {load && tier !== "poster" ? (
        <StageBoundary onError={toPoster}>
          <HeroStage
            key={tier}
            tier={tier}
            onReady={() => setReady(true)}
            onDowngrade={() => {
              setReady(false);
              setTier(downgradeTier(tier));
            }}
            onFail={toPoster}
          />
        </StageBoundary>
      ) : null}
    </div>
  );
}

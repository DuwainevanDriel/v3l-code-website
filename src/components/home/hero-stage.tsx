"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BEAT,
  BEATS,
  CODE_SNIPPET,
  STORY_SECONDS,
  beatAt,
  smooth,
  span,
  typedChars,
} from "@/lib/hero-story";
import { HERO_ART_LABEL } from "@/components/home/hero-poster";
import { MIN_MEDIAN_FPS, medianFps, type HeroTier } from "@/lib/hero-3d";
import { Chip } from "@/components/home/hero-3d/chip";
import { Cluster } from "@/components/home/hero-3d/cluster";
import { Crystal } from "@/components/home/hero-3d/crystal";
import { Effects } from "@/components/home/hero-3d/effects";
import { Pipes } from "@/components/home/hero-3d/pipes";
import { Rig } from "@/components/home/hero-3d/rig";
import type {
  Palette,
  StoryRef,
  StoryState,
} from "@/components/home/hero-3d/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FPS_SAMPLE = 60;
/** Skip the first frames: shader compilation makes them slow on every device. */
const FPS_WARMUP = 20;

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue("--bg").trim() || "#0b0d12",
    accent: style.getPropertyValue("--accent").trim() || "#c6ff3d",
    accent2: style.getPropertyValue("--accent-2").trim() || "#7c5cff",
  };
}

function advance(s: StoryState) {
  s.t = Math.min(STORY_SECONDS, Math.max(s.auto, s.scroll));
}

/** Advances story time once per frame, before anything else reads it, and samples the frame rate. */
function Clock({
  story,
  onBeat,
  onTime,
  onFps,
}: {
  story: StoryRef;
  onBeat: (index: number) => void;
  onTime: (t: number) => void;
  onFps: (fps: number) => void;
}) {
  const lastBeat = useRef(-1);
  const deltas = useRef<number[]>([]);
  const frames = useRef(0);
  const sampled = useRef(false);

  useFrame((_, delta) => {
    const s = story.current;
    advance(s);

    if (!sampled.current) {
      frames.current += 1;
      if (frames.current > FPS_WARMUP) deltas.current.push(delta);
      if (deltas.current.length >= FPS_SAMPLE) {
        sampled.current = true;
        const fps = medianFps(deltas.current);
        if (fps < MIN_MEDIAN_FPS) onFps(fps);
      }
    }

    const beat = beatAt(s.t);
    if (beat !== lastBeat.current) {
      lastBeat.current = beat;
      onBeat(beat);
    }
    onTime(s.t);
  }, -1);

  return null;
}

export interface HeroStageProps {
  tier: Exclude<HeroTier, "poster">;
  onReady: () => void;
  onDowngrade: () => void;
  onFail: () => void;
}

export default function HeroStage({
  tier,
  onReady,
  onDowngrade,
  onFail,
}: HeroStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLPreElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const story = useRef<StoryState>({
    auto: 0,
    scroll: 0,
    t: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const autoplay = useRef<gsap.core.Tween | null>(null);
  const [beat, setBeat] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [palette] = useState(readPalette);
  const full = tier === "full";
  const lastChars = useRef(-1);
  const alive = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.1),
      { threshold: [0, 0.1, 0.5] },
    );
    observer.observe(el);
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(
    () => () => {
      autoplay.current?.kill();
      autoplay.current = null;
    },
    [],
  );

  const startAutoplay = () => {
    autoplay.current?.kill();
    autoplay.current = gsap.to(story.current, {
      auto: STORY_SECONDS,
      duration: STORY_SECONDS,
      ease: "none",
    });
  };

  // Desktop: scrolling past the hero scrubs the story ahead with inertia and drifts the scene out.
  useGSAP(
    () => {
      const el = root.current;
      const section = el?.closest("section");
      if (!el || !section) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          // No pin: the page scrolls normally and the scroll only pushes the story ahead.
          const range = {
            trigger: section,
            start: "top top+=64",
            end: "bottom top",
          };
          gsap.to(story.current, {
            scroll: STORY_SECONDS,
            ease: "none",
            scrollTrigger: { ...range, scrub: 1 },
          });
          gsap.to(el, {
            yPercent: -8,
            scale: 0.96,
            opacity: 0.5,
            ease: "none",
            scrollTrigger: { ...range, scrub: true },
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  useEffect(() => {
    if (!full) return undefined;
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return undefined;
    const section = root.current?.closest("section") ?? window;
    const onMove = (e: Event) => {
      const p = e as PointerEvent;
      story.current.pointerX = (p.clientX / window.innerWidth) * 2 - 1;
      story.current.pointerY = (p.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      gsap.to(story.current, {
        pointerX: 0,
        pointerY: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [full]);

  const writeFrame = (t: number) => {
    const pre = code.current;
    const panel = editor.current;
    if (!pre || !panel) return;
    const chars = typedChars(t);
    if (chars !== lastChars.current) {
      lastChars.current = chars;
      pre.textContent =
        CODE_SNIPPET.slice(0, chars) + (chars < CODE_SNIPPET.length ? "▍" : "");
    }
    const show = smooth(span(t, BEAT.code - 0.4, 0.5));
    const hide = smooth(span(t, BEAT.build + 0.3, 0.7));
    const o = show * (1 - hide);
    panel.style.opacity = String(o);
    panel.style.transform = `translateY(${(1 - show) * 12 - hide * 16}px) scale(${0.97 + 0.03 * show})`;
  };

  const jumpTo = (index: number) => {
    autoplay.current?.kill();
    const s = story.current;
    const start = BEATS[index].start + 0.01;
    autoplay.current = gsap.to(s, {
      auto: start,
      scroll: Math.min(s.scroll, start),
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => {
        autoplay.current = gsap.to(s, {
          auto: STORY_SECONDS,
          duration: Math.max(0.01, STORY_SECONDS - start),
          ease: "none",
        });
      },
    });
  };

  const replayOrSkip = () => {
    const s = story.current;
    autoplay.current?.kill();
    if (s.t >= BEAT.live) {
      autoplay.current = gsap.to(s, {
        auto: 0,
        scroll: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: startAutoplay,
      });
      return;
    }
    autoplay.current = gsap.to(s, {
      auto: BEAT.live,
      duration: 0.9,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={root}
      className="absolute inset-0 will-change-transform"
      role="img"
      aria-label={`Animation: ${HERO_ART_LABEL}`}
    >
      <Canvas
        dpr={[1, full ? 1.75 : 1.4]}
        camera={{ position: [8, 7, 9], fov: 30, near: 0.1, far: 60 }}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          // R3F forces a context loss itself when the canvas unmounts; only a loss
          // on a mounted canvas that is still on the page is a real failure.
          canvas.addEventListener(
            "webglcontextlost",
            () => {
              window.setTimeout(() => {
                if (alive.current && canvas.isConnected) onFail();
              }, 0);
            },
            { once: true },
          );
          startAutoplay();
          onReady();
        }}
        onClick={replayOrSkip}
        style={{
          // Straight fades on the outer few percent only, so nothing ends on a hard edge.
          maskImage:
            "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent), linear-gradient(to bottom, transparent, #000 5%, #000 92%, transparent)",
          maskComposite: "intersect",
        }}
      >
        <Clock
          story={story}
          onBeat={setBeat}
          onTime={writeFrame}
          onFps={onDowngrade}
        />
        <Rig story={story} palette={palette} tilt={full} />
        <Chip story={story} palette={palette} />
        <Pipes story={story} palette={palette} />
        <Cluster
          story={story}
          palette={palette}
          layers={full ? 3 : 2}
          interactive={full}
          onLabel={setLabel}
        />
        <Crystal
          story={story}
          palette={palette}
          interactive={full}
          onLabel={setLabel}
        />
        <Effects full={full} palette={palette} />
      </Canvas>
      <div
        ref={editor}
        aria-hidden="true"
        className="border-border/80 bg-surface/70 pointer-events-none absolute top-[7%] left-[4%] w-[46%] max-w-xs rounded-xl border p-4 opacity-0 shadow-2xl shadow-black/50 backdrop-blur-md lg:top-[12%] lg:left-[36%] lg:w-[26%]"
      >
        <div className="mb-3 flex gap-1.5">
          <span className="bg-border size-2 rounded-full" />
          <span className="bg-border size-2 rounded-full" />
          <span className="bg-accent size-2 rounded-full" />
        </div>
        <pre
          ref={code}
          className="text-text font-mono text-[0.6rem] leading-relaxed whitespace-pre-wrap sm:text-xs"
        />
      </div>
      <p
        aria-hidden="true"
        className="border-border bg-surface/80 text-accent pointer-events-none absolute top-[7%] right-[6%] rounded-full border px-3 py-1 font-mono text-xs backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: label ? 1 : 0 }}
      >
        {label ?? ""}
      </p>
      <ol className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 pb-2 sm:gap-2">
        {BEATS.map((b, i) => (
          <li key={b.key} className="pointer-events-auto">
            <button
              type="button"
              onClick={() => jumpTo(i)}
              aria-current={beat === i ? "step" : undefined}
              aria-label={`${b.num} ${b.label}`.trim()}
              className="text-muted hover:text-text aria-[current=step]:text-accent min-h-11 min-w-11 px-1.5 font-mono text-[0.65rem] transition-colors sm:px-2 sm:text-xs"
            >
              {b.num ? <span className="opacity-60">{b.num} </span> : null}
              <span className={b.num ? "hidden sm:inline" : undefined}>
                {b.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

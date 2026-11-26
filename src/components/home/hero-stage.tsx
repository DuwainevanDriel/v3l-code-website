"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  type Group,
} from "three";
import {
  BEATS,
  CODE_SNIPPET,
  CUBE_SIZE,
  STORY_SECONDS,
  beatAt,
  buildLayout,
  clamp01,
  smooth,
  typedChars,
} from "@/lib/hero-story";
import { HERO_ART_LABEL } from "@/components/home/hero-poster";
import { MIN_MEDIAN_FPS, medianFps, type HeroTier } from "@/lib/hero-3d";

gsap.registerPlugin(ScrollTrigger);

interface StoryState {
  /** Seconds elapsed by autoplay or by jumping to a beat. */
  auto: number;
  /** Seconds implied by scroll position (desktop only). */
  scroll: number;
  pointerX: number;
  pointerY: number;
}

interface Palette {
  accent: string;
  accent2: string;
}

const LANES = [-0.9, 0, 0.9] as const;
const FPS_SAMPLE = 60;

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return {
    accent: style.getPropertyValue("--accent").trim(),
    accent2: style.getPropertyValue("--accent-2").trim(),
  };
}

function Scene({
  count,
  tilt,
  story,
  palette,
  onBeat,
  onTime,
  onFps,
}: {
  count: number;
  tilt: boolean;
  story: { current: StoryState };
  palette: Palette;
  onBeat: (index: number) => void;
  onTime: (t: number) => void;
  onFps: (fps: number) => void;
}) {
  const group = useRef<Group>(null);
  const layout = useMemo(() => buildLayout(count), [count]);

  const assets = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1);
    const edges = new EdgesGeometry(box);
    const fill = new MeshBasicMaterial({
      color: new Color(palette.accent2),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const line = new LineBasicMaterial({
      color: new Color(palette.accent),
      transparent: true,
      opacity: 0.85,
    });
    const pipeMat = new MeshBasicMaterial({
      color: new Color(palette.accent),
      transparent: true,
      opacity: 0.18,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const pulseMat = new MeshBasicMaterial({
      color: new Color(palette.accent),
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
    });
    const pulseGeo = new SphereGeometry(0.07, 12, 12);
    const curves = LANES.map(
      (y) =>
        new CatmullRomCurve3([
          new Vector3(-3.4, y, 0),
          new Vector3(-1.9, y, 0),
          new Vector3(-1.2, y * 0.5, 0),
          new Vector3(0.4, y * 0.5, 0),
          new Vector3(1.6, y * 0.3, 0),
        ]),
    );
    const tubes = curves.map((c) => new TubeGeometry(c, 40, 0.035, 6, false));
    const plate = new BoxGeometry(6.4, 0.1, 2.6);
    const plateEdges = new EdgesGeometry(plate);
    const plateFill = new MeshBasicMaterial({
      color: new Color(palette.accent2),
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const cubes = Array.from({ length: count }, () => {
      const mesh = new Mesh(box, fill);
      mesh.add(new LineSegments(edges, line));
      mesh.visible = false;
      return mesh;
    });
    const pipes = tubes.map((geometry) => new Mesh(geometry, pipeMat));
    const pulses = LANES.map(() => new Mesh(pulseGeo, pulseMat));
    const plateMesh = new Mesh(plate, plateFill);
    plateMesh.add(new LineSegments(plateEdges, line));
    plateMesh.position.set(0, -1.55, 0);
    return {
      box,
      edges,
      fill,
      line,
      pipeMat,
      pulseMat,
      pulseGeo,
      curves,
      tubes,
      plate,
      plateEdges,
      plateFill,
      cubes,
      pipes,
      pulses,
      plateMesh,
    };
  }, [count, palette]);

  useEffect(
    () => () => {
      assets.box.dispose();
      assets.edges.dispose();
      assets.fill.dispose();
      assets.line.dispose();
      assets.pipeMat.dispose();
      assets.pulseMat.dispose();
      assets.pulseGeo.dispose();
      assets.tubes.forEach((t) => t.dispose());
      assets.plate.dispose();
      assets.plateEdges.dispose();
      assets.plateFill.dispose();
    },
    [assets],
  );

  const scratch = useMemo(() => new Vector3(), []);
  const scratchEnd = useMemo(() => new Vector3(), []);
  const lastBeat = useRef(-1);
  const deltas = useRef<number[]>([]);
  const sampled = useRef(false);

  useFrame((state, delta) => {
    const s = story.current;
    const t = Math.min(STORY_SECONDS, Math.max(s.auto, s.scroll));
    const g = group.current;
    if (!g) return;
    g.scale.setScalar(
      Math.min(1.3, state.viewport.width / 7.5, state.viewport.height / 4.6),
    );

    if (!sampled.current) {
      deltas.current.push(delta);
      if (deltas.current.length >= FPS_SAMPLE) {
        sampled.current = true;
        const fps = medianFps(deltas.current);
        if (fps < MIN_MEDIAN_FPS) onFps(fps);
      }
    }

    const beat = beatAt(t);
    if (beat !== lastBeat.current) {
      lastBeat.current = beat;
      onBeat(beat);
    }
    onTime(t);

    const elapsed = state.clock.elapsedTime;
    const live = t >= BEATS[4].start;
    const strength = !tilt ? 0 : live ? 1 : t >= BEATS[2].start ? 0.3 : 0;
    g.rotation.y += (s.pointerX * 0.105 * strength - g.rotation.y) * 0.08;
    g.rotation.x +=
      (-0.3 + s.pointerY * -0.07 * strength - g.rotation.x) * 0.08;
    g.position.y = live ? Math.sin(elapsed * 1.05) * 0.04 : 0;

    const shipStart = BEATS[3].start;
    assets.cubes.forEach((cube, i) => {
      const spec = layout[i];
      const stagger = i * 0.04;
      const born = smooth((t - BEATS[1].start - stagger) / 0.6);
      cube.visible = born > 0;
      if (!cube.visible) return;

      const settle = smooth((t - BEATS[1].start - stagger) / 1.4);
      const flow = clamp01((t - BEATS[2].start - i * 0.03) / 1.8);
      const ship = smooth((t - shipStart - i * 0.04) / 1.6);
      const curve = assets.curves[spec.lane];

      scratch.set(
        spec.origin[0] + (spec.cloud[0] - spec.origin[0]) * settle,
        spec.origin[1] + (spec.cloud[1] - spec.origin[1]) * settle,
        spec.origin[2] + (spec.cloud[2] - spec.origin[2]) * settle,
      );
      if (flow > 0) {
        const lead = smooth(flow / 0.25);
        curve.getPointAt(0, scratchEnd);
        scratch.lerp(scratchEnd, lead);
        if (flow > 0.25) curve.getPointAt((flow - 0.25) / 0.75, scratch);
      }
      if (ship > 0) {
        curve.getPointAt(1, scratchEnd);
        scratch.copy(scratchEnd);
        scratch.x += (spec.slot[0] - scratchEnd.x) * ship;
        scratch.y += (spec.slot[1] - scratchEnd.y) * ship;
        scratch.z += (spec.slot[2] - scratchEnd.z) * ship;
      }
      cube.position.copy(scratch);

      const spin = (1 - smooth((t - BEATS[2].start) / 1.2)) * (1 - ship);
      cube.rotation.set(elapsed * 0.6 * spin + i, elapsed * 0.8 * spin, 0);
      if (spin < 0.001) cube.rotation.set(0, 0, 0);
      const size = CUBE_SIZE * born;
      cube.scale.set(
        size + (spec.slotScale[0] - size) * ship,
        size + (spec.slotScale[1] - size) * ship,
        size + (spec.slotScale[2] - size) * ship,
      );
    });

    const pipesOn = smooth((t - BEATS[2].start + 0.4) / 0.6);
    assets.pipes.forEach((pipe) => {
      pipe.visible = pipesOn > 0.05;
    });
    assets.pulses.forEach((pulse, lane) => {
      pulse.visible = pipesOn > 0;
      assets.curves[lane].getPointAt(
        (elapsed * 0.33 + lane * 0.31) % 1,
        pulse.position,
      );
    });
  });

  return (
    <group ref={group} rotation={[-0.3, 0, 0]}>
      <primitive object={assets.plateMesh} />
      {assets.pipes.map((pipe, lane) => (
        <primitive key={lane} object={pipe} />
      ))}
      {assets.pulses.map((pulse, lane) => (
        <primitive key={lane} object={pulse} />
      ))}
      {assets.cubes.map((cube, i) => (
        <primitive key={i} object={cube} />
      ))}
    </group>
  );
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
    pointerX: 0,
    pointerY: 0,
  });
  const autoplay = useRef<gsap.core.Tween | null>(null);
  const [beat, setBeat] = useState(0);
  const [active, setActive] = useState(true);
  const [palette] = useState(readPalette);
  const full = tier === "full";
  const lastChars = useRef(-1);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.1),
      { threshold: [0, 0.1, 0.5] },
    );
    observer.observe(el);
    const onVisibility = () => {
      if (document.hidden) setActive(false);
    };
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

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 25%",
        onUpdate: (self) => {
          story.current.scroll = self.progress * STORY_SECONDS;
        },
      });
      return () => trigger.kill();
    });
    return () => mm.revert();
  }, []);

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
        duration: 0.6,
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
    panel.style.opacity = String(1 - smooth((t - BEATS[1].start) / 0.6));
  };

  const jumpTo = (index: number) => {
    autoplay.current?.kill();
    autoplay.current = null;
    const s = story.current;
    gsap.to(s, {
      auto: BEATS[index].start + 0.01,
      duration: 0.8,
      ease: "power2.inOut",
    });
  };

  const replayOrSkip = () => {
    const s = story.current;
    autoplay.current?.kill();
    if (s.auto >= BEATS[4].start) {
      gsap.to(s, { auto: 0, scroll: 0, duration: 0.6, ease: "power2.inOut" });
      return;
    }
    gsap.to(s, { auto: BEATS[4].start, duration: 0.8, ease: "power2.inOut" });
  };

  return (
    <div
      ref={root}
      className="absolute inset-0"
      role="img"
      aria-label={`Animation: ${HERO_ART_LABEL}`}
    >
      <Canvas
        dpr={[1, full ? 1.75 : 1.5]}
        camera={{ position: [0, 0, 9], fov: 40 }}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onFail, {
            once: true,
          });
          startAutoplay();
          onReady();
        }}
        onClick={replayOrSkip}
      >
        <Scene
          count={full ? 24 : 12}
          tilt={full}
          story={story}
          palette={palette}
          onBeat={setBeat}
          onTime={writeFrame}
          onFps={onDowngrade}
        />
      </Canvas>
      <div
        ref={editor}
        aria-hidden="true"
        className="border-border bg-surface/80 pointer-events-none absolute top-[8%] left-[4%] w-[52%] max-w-sm rounded-lg border p-4 backdrop-blur-sm"
      >
        <pre
          ref={code}
          className="text-text font-mono text-[0.6rem] leading-relaxed whitespace-pre-wrap sm:text-xs"
        />
      </div>
      <ol className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 pb-2 sm:gap-3">
        {BEATS.map((b, i) => (
          <li key={b.key} className="pointer-events-auto">
            <button
              type="button"
              onClick={() => jumpTo(i)}
              aria-current={beat === i ? "step" : undefined}
              className="text-muted aria-[current=step]:text-accent min-h-11 min-w-11 px-2 font-mono text-[0.65rem] sm:text-xs"
            >
              {b.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

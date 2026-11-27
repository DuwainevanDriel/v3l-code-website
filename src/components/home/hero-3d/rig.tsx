"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Vector3,
  type Camera,
  type PointLight,
} from "three";
import { BEAT, damp, smooth, span } from "@/lib/hero-story";
import type { Palette, StoryRef } from "./types";

/** Overall scene size: larger is further away. */
const DISTANCE = 1.11;

const TARGET = new Vector3(1.45, 0.75, 0.2);

/**
 * On wide canvases (desktop, where the canvas runs behind the headline) shift the
 * frame so the scene sits right of the text, and pull back a little.
 */
function frame(camera: Camera, aspect: number): number {
  const wide = aspect > 1.25;
  if (camera instanceof PerspectiveCamera) {
    const offset = wide ? -0.14 * camera.getFilmWidth() : 0;
    if (camera.filmOffset !== offset) {
      camera.filmOffset = offset;
      camera.updateProjectionMatrix();
    }
  }
  return wide ? 1.12 : 1;
}

/**
 * Camera and lighting rig. The camera dollies in during Plan, orbits slowly as the
 * story advances, pushes in for Test, and leans toward the pointer. Every value is
 * damped, so scroll scrubbing and pointer moves never snap.
 */
export function Rig({
  story,
  palette,
  tilt,
}: {
  story: StoryRef;
  palette: Palette;
  tilt: boolean;
}) {
  const { camera, size } = useThree();
  const follow = useRef<PointLight>(null);
  const cam = useRef({ yaw: 0.95, pitch: 0.62, radius: 15, px: 0, py: 0 });
  const look = useMemo(() => TARGET.clone(), []);

  useFrame((_, delta) => {
    const s = story.current;
    const t = s.t;
    const c = cam.current;
    const strength = tilt ? 0.3 + 0.7 * span(t, BEAT.live, 1) : 0;
    c.px = damp(c.px, s.pointerX * strength, 3, delta);
    c.py = damp(c.py, s.pointerY * strength, 3, delta);

    const progress = t / BEAT.live;
    const testPush = Math.sin(
      Math.PI * span(t, BEAT.test - 0.3, BEAT.ship - BEAT.test + 0.6),
    );
    const aspect = size.width / Math.max(1, size.height);
    const narrow = Math.max(1, 1.3 / aspect) * frame(camera, aspect) * DISTANCE;
    const wantRadius =
      (12.8 - 2.4 * smooth(span(t, BEAT.plan, 2.2)) - 0.9 * testPush) * narrow;
    const wantYaw = 0.92 - 0.3 * smooth(Math.min(1, progress)) + c.px * 0.16;
    const wantPitch = 0.6 - 0.06 * testPush - c.py * 0.07;

    c.yaw = damp(c.yaw, wantYaw, 2.2, delta);
    c.pitch = damp(c.pitch, wantPitch, 2.2, delta);
    c.radius = damp(c.radius, wantRadius, 2, delta);

    const cosP = Math.cos(c.pitch);
    camera.position.set(
      TARGET.x + c.radius * cosP * Math.sin(c.yaw),
      TARGET.y + c.radius * Math.sin(c.pitch),
      TARGET.z + c.radius * cosP * Math.cos(c.yaw),
    );
    look.set(TARGET.x + c.px * 0.25, TARGET.y - c.py * 0.15, TARGET.z);
    camera.lookAt(look);

    if (follow.current) {
      follow.current.position.x = damp(
        follow.current.position.x,
        0.5 + s.pointerX * 3.2,
        5,
        delta,
      );
      follow.current.position.z = damp(
        follow.current.position.z,
        1.6 + s.pointerY * 2.4,
        5,
        delta,
      );
      follow.current.intensity = tilt ? 5 * span(t, BEAT.code, 1) : 0;
    }
  });

  return (
    <>
      <directionalLight position={[4, 9, 5]} intensity={0.9} />
      <directionalLight
        position={[-6, 3, -4]}
        intensity={1.6}
        color={palette.accent2}
      />
      <pointLight
        ref={follow}
        position={[0.5, 2.4, 1.6]}
        color="#f1ffd6"
        intensity={0}
        distance={7}
        decay={1.6}
      />
    </>
  );
}

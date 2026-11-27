"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BEAT, PIPE_PATHS, smooth, span } from "@/lib/hero-story";
import { COPPER, type Palette, type StoryRef } from "./types";

const SEGMENTS = 120;
const RADIAL_OUTER = 18;
const RADIAL_CORE = 8;
const RING_STOPS = [0.18, 0.5, 0.82] as const;
const PACKETS_PER_LANE = 2;
const Z = new Vector3(0, 0, 1);

/** Shows the first `p` (0 to 1) of a tube along its length. */
function reveal(tube: TubeGeometry, radial: number, p: number) {
  const perSegment = radial * 6;
  tube.setDrawRange(0, Math.floor(SEGMENTS * p) * perSegment);
}

export function Pipes({
  story,
  palette,
}: {
  story: StoryRef;
  palette: Palette;
}) {
  const assets = useMemo(() => {
    const curves = PIPE_PATHS.map(
      (pts) =>
        new CatmullRomCurve3(
          pts.map(([x, y, z]) => new Vector3(x, y, z)),
          false,
          "centripetal",
        ),
    );
    const outerMat = new MeshPhysicalMaterial({
      color: "#dfe3ee",
      transparent: true,
      opacity: 0.72,
      roughness: 0.45,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const coreMat = new MeshBasicMaterial({
      color: new Color(palette.accent).multiplyScalar(1.8),
      toneMapped: false,
    });
    const ringMat = new MeshStandardMaterial({
      color: COPPER,
      metalness: 1,
      roughness: 0.28,
    });
    const packetMat = new MeshBasicMaterial({
      color: new Color("#ffffff").multiplyScalar(5),
      toneMapped: false,
    });
    const ringGeo = new TorusGeometry(0.088, 0.022, 10, 28);
    const packetGeo = new RoundedBoxGeometry(0.11, 0.11, 0.11, 2, 0.02);
    const outerGeos = curves.map(
      (c) => new TubeGeometry(c, SEGMENTS, 0.075, RADIAL_OUTER, false),
    );
    const coreGeos = curves.map(
      (c) => new TubeGeometry(c, SEGMENTS, 0.022, RADIAL_CORE, false),
    );
    const outers = outerGeos.map((g) => new Mesh(g, outerMat));
    const cores = coreGeos.map((g) => new Mesh(g, coreMat));
    const tangent = new Vector3();
    const rings = curves.flatMap((c) =>
      RING_STOPS.map((u) => {
        const ring = new Mesh(ringGeo, ringMat);
        c.getPointAt(u, ring.position);
        c.getTangentAt(u, tangent);
        ring.quaternion.setFromUnitVectors(Z, tangent);
        ring.userData.u = u;
        return ring;
      }),
    );
    const packets = curves.flatMap(() =>
      Array.from(
        { length: PACKETS_PER_LANE },
        () => new Mesh(packetGeo, packetMat),
      ),
    );
    return {
      curves,
      outerMat,
      coreMat,
      ringMat,
      packetMat,
      ringGeo,
      packetGeo,
      outerGeos,
      coreGeos,
      outers,
      cores,
      rings,
      packets,
      tangent,
    };
  }, [palette]);

  useEffect(
    () => () => {
      assets.outerMat.dispose();
      assets.coreMat.dispose();
      assets.ringMat.dispose();
      assets.packetMat.dispose();
      assets.ringGeo.dispose();
      assets.packetGeo.dispose();
      assets.outerGeos.forEach((g) => g.dispose());
      assets.coreGeos.forEach((g) => g.dispose());
    },
    [assets],
  );

  useFrame((state) => {
    const t = story.current.t;
    const elapsed = state.clock.elapsedTime;

    assets.outerGeos.forEach((g, lane) => {
      const p = smooth(span(t, BEAT.plan + 0.9 + lane * 0.2, 1.1));
      reveal(g, RADIAL_OUTER, p);
      assets.rings.forEach((ring, r) => {
        if (Math.floor(r / RING_STOPS.length) !== lane) return;
        const u = ring.userData.u as number;
        const on = smooth((p - u) / 0.08);
        ring.visible = on > 0;
        ring.scale.setScalar(on || 0.001);
      });
    });

    assets.coreGeos.forEach((g, lane) => {
      const fill = smooth(span(t, BEAT.ship + lane * 0.22, 1.3));
      reveal(g, RADIAL_CORE, fill);
      assets.cores[lane].visible = fill > 0;
    });
    const live = span(t, BEAT.live, 1);
    const breathe = 1.8 + 1 * live * (0.5 + 0.5 * Math.sin(elapsed * 2.2));
    assets.coreMat.color.set(palette.accent).multiplyScalar(breathe);

    assets.packets.forEach((packet, i) => {
      const lane = Math.floor(i / PACKETS_PER_LANE);
      const k = i % PACKETS_PER_LANE;
      const curve = assets.curves[lane];
      let u: number;
      if (t < BEAT.live) {
        // Ship: one packet per lane rides behind the glowing core.
        u = k === 0 ? smooth(span(t, BEAT.ship + 0.3 + lane * 0.25, 1.8)) : 0;
        packet.visible = k === 0 && u > 0 && u < 1;
      } else {
        u = (elapsed * 0.2 + k / PACKETS_PER_LANE + lane * 0.17) % 1;
        packet.visible = true;
      }
      if (!packet.visible) return;
      curve.getPointAt(u, packet.position);
      curve.getTangentAt(u, assets.tangent);
      packet.quaternion.setFromUnitVectors(Z, assets.tangent);
      const edge = Math.min(u, 1 - u) / 0.06;
      packet.scale.setScalar(Math.min(1, edge));
    });
  });

  return (
    <group>
      {assets.outers.map((m, i) => (
        <primitive key={`o${i}`} object={m} />
      ))}
      {assets.cores.map((m, i) => (
        <primitive key={`c${i}`} object={m} />
      ))}
      {assets.rings.map((m, i) => (
        <primitive key={`r${i}`} object={m} />
      ))}
      {assets.packets.map((m, i) => (
        <primitive key={`p${i}`} object={m} />
      ))}
    </group>
  );
}

"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  RingGeometry,
  Scene,
  type WebGLRenderer,
} from "three";
import type { Palette } from "./types";

interface Softbox {
  color: string;
  intensity: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  ring?: boolean;
}

/**
 * Builds a studio environment map once from a few glowing panels: a top softbox,
 * a white key from the right, a violet rim from the left and a lime ring that
 * shows up as a reflection in the glass. No HDR file is downloaded.
 */
function applyStudio(gl: WebGLRenderer, scene: Scene, palette: Palette) {
  const boxes: Softbox[] = [
    {
      color: "#ffffff",
      intensity: 1.4,
      position: [0, 6, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [10, 10],
    },
    {
      color: "#ffffff",
      intensity: 1,
      position: [6, 2, 4],
      rotation: [0, -Math.PI / 3, 0],
      scale: [5, 3],
    },
    {
      color: palette.accent2,
      intensity: 2,
      position: [-6, 1.5, -2],
      rotation: [0, Math.PI / 2, 0],
      scale: [8, 2],
    },
    {
      color: palette.accent,
      intensity: 2.5,
      position: [2, 3, 7],
      rotation: [0, Math.PI, 0],
      scale: [1.6, 1.6],
      ring: true,
    },
  ];
  const studio = new Scene();
  studio.background = new Color("#05060a");
  const plane = new PlaneGeometry(1, 1);
  const ring = new RingGeometry(0.5, 1, 48);
  const materials = boxes.map((b) => {
    const mat = new MeshBasicMaterial({
      color: new Color(b.color).multiplyScalar(b.intensity),
      side: DoubleSide,
    });
    const mesh = new Mesh(b.ring ? ring : plane, mat);
    mesh.position.set(...b.position);
    mesh.rotation.set(...b.rotation);
    mesh.scale.set(b.scale[0], b.scale[1], 1);
    studio.add(mesh);
    return mat;
  });
  const pmrem = new PMREMGenerator(gl);
  const target = pmrem.fromScene(studio, 0.03);
  scene.environment = target.texture;
  pmrem.dispose();
  plane.dispose();
  ring.dispose();
  materials.forEach((m) => m.dispose());
  return () => {
    if (scene.environment === target.texture) scene.environment = null;
    target.dispose();
  };
}

export function StudioEnvironment({ palette }: { palette: Palette }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => applyStudio(gl, scene, palette), [gl, scene, palette]);
  return null;
}

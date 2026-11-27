/** Mutable state shared by the DOM controls and the 3D scene. Read every frame, never rendered. */
export interface StoryState {
  /** Seconds elapsed by autoplay or by jumping to a beat. */
  auto: number;
  /** Seconds implied by scroll position (desktop only). */
  scroll: number;
  /** Story time used by every object this frame: max(auto, scroll), clamped. */
  t: number;
  /** Pointer over the hero, -1 to 1 on both axes. */
  pointerX: number;
  pointerY: number;
}

export type StoryRef = { readonly current: StoryState };

export interface Palette {
  bg: string;
  accent: string;
  accent2: string;
}

export const COPPER = "#c8834f";
export const PORCELAIN = "#e4e7ef";

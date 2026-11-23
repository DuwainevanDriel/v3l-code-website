"use client";

import { useSyncExternalStore } from "react";
import { MOTION_STORAGE_KEY } from "@/lib/motion";

const subscribe = () => () => undefined;
const getSnapshot = () => document.documentElement.dataset.motion === "off";
const getServerSnapshot = () => false;

/** Footer control for visitors who have not set an OS reduced-motion preference. */
export function MotionToggle() {
  const paused = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = () => {
    if (paused) {
      window.localStorage.removeItem(MOTION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(MOTION_STORAGE_KEY, "off");
    }
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      {paused ? "Resume animations" : "Pause animations"}
    </button>
  );
}

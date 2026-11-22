"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { whenMotionAllowed } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/** Pulls the wrapped element up to 12px toward a fine pointer within 80px. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return undefined;

    return whenMotionAllowed(() => {
      const moveX = gsap.quickTo(el, "x", {
        duration: 0.4,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(el, "y", {
        duration: 0.4,
        ease: "power3.out",
      });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const reach = 80 + Math.max(r.width, r.height) / 2;
        if (Math.hypot(dx, dy) > reach) {
          moveX(0);
          moveY(0);
          return;
        }
        moveX(gsap.utils.clamp(-12, 12, dx * 0.2));
        moveY(gsap.utils.clamp(-12, 12, dy * 0.2));
      };
      const reset = () => {
        moveX(0);
        moveY(0);
      };
      window.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", reset);
      return () => {
        window.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", reset);
      };
    });
  }, []);

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}

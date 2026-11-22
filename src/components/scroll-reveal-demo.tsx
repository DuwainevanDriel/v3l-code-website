"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Demo: cards fade/slide in as they scroll into view. Skipped under reduced motion. */
export function ScrollRevealDemo() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-reveal]", {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: root.current, start: "top 80%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="grid gap-4 sm:grid-cols-3"
      data-testid="scroll-reveal-demo"
    >
      {["Software", "Web & apps", "Hosting & domains"].map((label) => (
        <div
          key={label}
          data-reveal
          className="rounded-2xl border border-white/15 p-8 text-lg font-semibold"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

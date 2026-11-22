"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { whenMotionAllowed } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  {
    title: "Discover",
    text: "We learn your goals, users and constraints, then agree scope and a fixed plan.",
  },
  {
    title: "Design",
    text: "Wireframes and a clickable design you approve before a line of code is written.",
  },
  {
    title: "Build",
    text: "Small, tested releases you can see every week, with no big-bang surprises.",
  },
  {
    title: "Launch & host",
    text: "We deploy, monitor and look after hosting, domains and updates for you.",
  },
] as const;

/**
 * Steps are a normal stacked list (native scroll, keyboard reachable). On desktop with motion
 * allowed, each step dims/brightens as it crosses the viewport centre. No pinning/scroll-jacking.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      whenMotionAllowed(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
            gsap.fromTo(
              step,
              { opacity: 0.3 },
              {
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: step,
                  start: "top 70%",
                  end: "top 40%",
                  scrub: 0.6,
                },
              },
            );
          });
        });
        return () => mm.revert();
      }),
    { scope: root },
  );

  return (
    <section ref={root} className="border-border bg-surface border-y">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 md:py-24 lg:px-12 lg:py-32">
        <p className="text-eyebrow">How we work</p>
        <h2 className="text-h2 mt-3 max-w-2xl">
          From first call to live, in four steps.
        </h2>
        <ol className="mt-12 flex flex-col gap-10 lg:gap-24">
          {steps.map((s, i) => (
            <li
              key={s.title}
              data-step
              className="grid gap-2 lg:grid-cols-[auto_1fr] lg:gap-12"
            >
              <span
                aria-hidden="true"
                className="font-display text-accent-2 text-6xl font-bold lg:text-8xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-h3">{s.title}</h3>
                <p className="text-muted mt-2 max-w-xl text-lg">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

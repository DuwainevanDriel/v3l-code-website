"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/button";
import { HeroScene } from "@/components/home/hero-scene";
import { Magnetic } from "@/components/magnetic";
import { whenMotionAllowed } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

const headline = ["Software,", "sites & apps", "that ship."];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      whenMotionAllowed(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-line]", { yPercent: 100, duration: 0.9, stagger: 0.08 })
          .from(
            "[data-hero-fade]",
            { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 },
            "-=0.4",
          )
          .from("[data-glow]", { scale: 1.2, opacity: 0, duration: 1.2 }, 0);
      }),
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-x-clip px-4 pt-16 pb-20 sm:px-8 lg:flex lg:min-h-[calc(100svh-4rem)] lg:items-center lg:px-12 lg:py-12"
    >
      <div
        data-glow
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-0"
      />
      <div className="mx-auto w-full max-w-360 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="relative z-10 lg:pointer-events-none lg:col-span-5 lg:*:pointer-events-auto">
          <p className="text-eyebrow">
            Software · Web · Apps · Hosting · Domains
          </p>
          <h1 className="text-display mt-6 max-w-5xl lg:text-[clamp(3rem,0.5rem+4.6vw,6rem)]">
            {headline.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span data-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            data-hero-fade
            className="text-muted mt-8 max-w-xl text-lg lg:text-xl"
          >
            V3L Code designs, builds and hosts web, mobile and custom software
            for growing businesses.
          </p>
          <div
            data-hero-fade
            className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center"
          >
            <Magnetic>
              <ButtonLink href="/contact" className="min-h-14 w-full sm:w-auto">
                Get a free quote
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/services" variant="link">
              Explore services →
            </ButtonLink>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:left-[18%]">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}

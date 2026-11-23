"use client";

import Link from "next/link";
import { type PointerEvent } from "react";
import { Reveal } from "@/components/reveal";
import { serviceHref, services } from "@/lib/site";

export function ServicesGrid() {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 md:py-24 lg:px-12 lg:py-32">
      <Reveal>
        <div data-reveal>
          <p className="text-eyebrow">What we do</p>
          <h2 className="text-h2 mt-3 max-w-2xl">
            Everything you need to get online and scale.
          </h2>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-6">
          {services.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              className={i === 0 ? "md:col-span-4" : "md:col-span-2"}
            >
              <Link
                href={serviceHref(s.slug)}
                onPointerMove={onMove}
                className="card-spotlight group border-border hover:border-accent-2 flex h-full min-h-44 flex-col justify-between rounded-lg border p-6 transition-colors"
              >
                <div>
                  <h3 className="text-h3">{s.title}</h3>
                  <p className="text-muted mt-2">{s.blurb}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-accent mt-6 transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

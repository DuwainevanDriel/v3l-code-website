import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-0"
      />
      <div className="relative mx-auto max-w-[1200px] px-4 pt-16 pb-12 sm:px-8 md:pt-24 lg:px-12">
        <p className="text-eyebrow">{eyebrow}</p>
        <h1 className="text-display mt-3 max-w-3xl">{title}</h1>
        <p className="text-muted mt-6 max-w-2xl text-lg">{intro}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

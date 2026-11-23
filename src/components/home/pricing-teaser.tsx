import { ButtonLink } from "@/components/button";
import { Reveal } from "@/components/reveal";
import { plans } from "@/lib/pricing";

export function PricingTeaser() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 md:py-24 lg:px-12 lg:py-32">
      <Reveal>
        <div data-reveal>
          <p className="text-eyebrow">Pricing</p>
          <h2 className="text-h2 mt-3">Simple, honest pricing.</h2>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const featured = Boolean(p.featured);
            return (
              <li
                key={p.name}
                data-reveal
                className={`rounded-lg border p-6 ${
                  featured
                    ? "border-accent-2 bg-surface-2 shadow-[0_0_0_1px_var(--border),0_10px_40px_-10px_#7c5cff55] md:-translate-y-3"
                    : "border-border bg-surface"
                }`}
              >
                <h3 className="text-h3">{p.name}</h3>
                <p className="mt-4 font-mono text-4xl font-medium">
                  <span className="text-muted text-sm">from </span>
                  {p.price}
                  {p.unit}
                </p>
                <p className="text-muted mt-2">{p.note}</p>
              </li>
            );
          })}
        </ul>
        <div data-reveal className="mt-8">
          <ButtonLink href="/pricing" variant="secondary">
            View pricing
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}

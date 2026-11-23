import { ButtonLink } from "@/components/button";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";
import { faqs, plans } from "@/lib/pricing";
import { breadcrumbData, faqData } from "@/lib/structured-data";

export const metadata = pageMetadata(
  "Pricing",
  "Transparent pricing for V3L Code software, web, hosting and domain services.",
  "/pricing",
);

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqData} />
      <JsonLd data={breadcrumbData([{ name: "Pricing", path: "/pricing" }])} />
      <PageHero
        eyebrow="Pricing"
        title="Simple, honest pricing."
        intro="Clear starting points, fixed-scope quotes and no surprise invoices."
      />
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-8 md:pb-24 lg:px-12">
        <Reveal>
          <ul className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <li
                key={p.name}
                data-reveal
                className={`flex flex-col rounded-lg border p-6 ${
                  p.featured
                    ? "border-accent-2 bg-surface-2"
                    : "border-border bg-surface"
                }`}
              >
                <h2 className="text-h3">{p.name}</h2>
                <p className="mt-4 font-mono text-4xl font-medium">
                  <span className="text-muted text-sm">from </span>
                  {p.price}
                  {p.unit ? (
                    <span className="text-muted text-sm">{p.unit}</span>
                  ) : null}
                </p>
                <p className="text-muted mt-2">{p.note}</p>
                <ul className="mt-6 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span aria-hidden="true" className="text-accent">
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/contact"
                  variant={p.featured ? "primary" : "secondary"}
                  className="mt-8"
                >
                  Get a quote
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
      <section className="mx-auto max-w-[800px] px-4 pb-16 sm:px-8 md:pb-24">
        <h2 className="text-h2">Pricing questions</h2>
        <dl className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="text-h3">{f.q}</dt>
              <dd className="text-muted mt-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <CtaBand />
    </>
  );
}

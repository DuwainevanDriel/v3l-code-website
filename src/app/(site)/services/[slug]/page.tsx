import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";
import { serviceHref, services } from "@/lib/site";
import { breadcrumbData, serviceData } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata(service.title, service.intro, serviceHref(slug));
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={serviceData(service)} />
      <JsonLd
        data={breadcrumbData([
          { name: "Services", path: "/services" },
          { name: service.title, path: serviceHref(service.slug) },
        ])}
      />
      <PageHero
        eyebrow={service.title}
        title={service.headline}
        intro={service.intro}
      />
      <section className="mx-auto grid max-w-[1200px] gap-12 px-4 py-12 sm:px-8 md:grid-cols-2 md:py-16 lg:px-12">
        <Reveal>
          <div data-reveal>
            <h2 className="text-h2">What you get</h2>
            <ul className="mt-6 space-y-3">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3">
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <div data-reveal>
            <h2 className="text-h2">How it works</h2>
            <ol className="mt-6 space-y-4">
              {service.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="border-border bg-surface rounded-lg border p-4"
                >
                  <p className="text-eyebrow">Step {i + 1}</p>
                  <h3 className="text-h3 mt-1">{step.title}</h3>
                  <p className="text-muted mt-1">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>
      <nav
        aria-label="Other services"
        className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-8 lg:px-12"
      >
        <ul className="flex flex-wrap gap-3">
          {services
            .filter((s) => s.slug !== slug)
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={serviceHref(s.slug)}
                  className="border-border hover:bg-surface-2 inline-flex min-h-11 items-center rounded-full border px-4"
                >
                  {s.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <CtaBand title={`Talk to us about ${service.title.toLowerCase()}.`} />
    </>
  );
}

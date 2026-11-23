import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";
import { serviceHref, services } from "@/lib/site";

export const metadata = pageMetadata(
  "Services",
  "Software development, websites, apps, hosting and domains from V3L Code.",
  "/services",
);

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Build, launch and run it all in one place."
        intro="From the first domain name to the app in your users' pockets, one team handles design, development and hosting."
      />
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-8 md:pb-24 lg:px-12">
        <Reveal>
          <ul className="grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug} data-reveal>
                <Link
                  href={serviceHref(s.slug)}
                  className="border-border bg-surface hover:border-accent-2 group flex h-full flex-col justify-between rounded-lg border p-6 transition-colors"
                >
                  <div>
                    <h2 className="text-h3">{s.title}</h2>
                    <p className="text-muted mt-2">{s.blurb}</p>
                  </div>
                  <span className="text-accent mt-6 font-semibold">
                    Learn more{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}

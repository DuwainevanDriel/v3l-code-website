import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbData } from "@/lib/structured-data";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata(
  "Contact",
  "Get in touch with V3L Code to start your project.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbData([{ name: "Contact", path: "/contact" }])} />
      <PageHero
        eyebrow="Contact"
        title="Tell us what you're building."
        intro="Send a short note and we will reply with next steps and a free quote."
      />
      <section className="mx-auto grid max-w-[1200px] gap-12 px-4 pb-24 sm:px-8 md:grid-cols-[3fr_2fr] lg:px-12">
        <ContactForm />
        <aside className="text-muted space-y-3">
          <p>
            Prefer email?{" "}
            <a
              className="text-accent underline"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
          </p>
          {siteConfig.phone ? (
            <p>
              Call us:{" "}
              <a
                className="text-accent underline"
                href={`tel:${siteConfig.phone}`}
              >
                {siteConfig.phone}
              </a>
            </p>
          ) : null}
          <p>
            We only use your details to reply to your enquiry. See our{" "}
            <Link className="text-accent underline" href="/privacy">
              privacy page
            </Link>
            .
          </p>
        </aside>
      </section>
    </>
  );
}

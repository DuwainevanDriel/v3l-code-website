import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata(
  "Contact",
  "Get in touch with V3L Code to start your project.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
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

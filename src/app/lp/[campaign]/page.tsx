import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";
import { campaigns } from "@/lib/campaigns";

type Props = { params: Promise<{ campaign: string }> };

export function generateStaticParams() {
  return campaigns.map((c) => ({ campaign: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campaign } = await params;
  const found = campaigns.find((c) => c.slug === campaign);
  if (!found) return {};
  return {
    title: found.title,
    description: found.intro,
    alternates: { canonical: `/lp/${found.slug}` },
    robots: { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: Props) {
  const { campaign } = await params;
  const found = campaigns.find((c) => c.slug === campaign);
  if (!found) notFound();

  return (
    <section className="hero-glow mx-auto grid max-w-[1200px] gap-12 px-4 pt-8 pb-24 sm:px-8 md:grid-cols-2 md:pt-16 lg:px-12">
      <div>
        <h1 className="text-display">{found.headline}</h1>
        <p className="text-muted mt-6 text-lg">{found.intro}</p>
        <ul className="mt-8 space-y-3">
          {found.points.map((p) => (
            <li key={p} className="flex gap-3">
              <span aria-hidden="true" className="text-accent">
                ✓
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <ContactForm source={found.slug} />
    </section>
  );
}

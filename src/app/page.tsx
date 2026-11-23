import { CtaBand } from "@/components/cta-band";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { Process } from "@/components/home/process";
import { ServicesGrid } from "@/components/home/services-grid";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata(
  `${siteConfig.name} | Software, Web, Apps, Hosting & Domains`,
  siteConfig.description,
  "/",
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ServicesGrid />
      <Process />
      <PricingTeaser />
      <CtaBand />
    </>
  );
}

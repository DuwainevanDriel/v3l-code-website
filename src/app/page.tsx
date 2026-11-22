import { PageStub } from "@/components/page-stub";
import { ScrollRevealDemo } from "@/components/scroll-reveal-demo";
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
      <PageStub title={siteConfig.name} />
      <section className="mx-auto max-w-6xl px-6 pt-[60vh] pb-[40vh]">
        <ScrollRevealDemo />
      </section>
    </>
  );
}

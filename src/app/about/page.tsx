import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  "Learn about V3L Code, a software, web, app, hosting and domains company.",
  "/about",
);

const values = [
  {
    title: "Plain talking",
    text: "Clear scopes, clear prices and honest advice, even when it means saying no.",
  },
  {
    title: "Small, tested steps",
    text: "We ship in small releases you can preview, with tests behind every change.",
  },
  {
    title: "Built to last",
    text: "Fast, secure and accessible by default, and hosted by people who care.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A small team that builds and runs your software."
        intro="V3L Code designs and builds websites, apps and custom software, then hosts and looks after them, so you deal with one team from idea to launch and beyond."
      />
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 md:py-16 lg:px-12">
        <Reveal>
          <h2 data-reveal className="text-h2">
            How we work
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map((v) => (
              <li
                key={v.title}
                data-reveal
                className="border-border bg-surface rounded-lg border p-6"
              >
                <h3 className="text-h3">{v.title}</h3>
                <p className="text-muted mt-2">{v.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}

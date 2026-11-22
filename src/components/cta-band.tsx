import { ButtonLink } from "./button";
import { Magnetic } from "./magnetic";

export function CtaBand({
  title = "Tell us what you're building.",
}: {
  title?: string;
}) {
  return (
    <section className="px-4 pb-16 sm:px-8 md:pb-24 lg:px-12 lg:pb-32">
      <div className="hero-glow border-border bg-surface mx-auto flex max-w-[1200px] flex-col items-start gap-6 rounded-lg border p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <h2 className="text-h2 max-w-xl">{title}</h2>
        <Magnetic>
          <ButtonLink href="/contact" className="min-h-14">
            Get a free quote
          </ButtonLink>
        </Magnetic>
      </div>
    </section>
  );
}

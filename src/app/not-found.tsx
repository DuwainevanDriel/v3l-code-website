import { ButtonLink } from "@/components/button";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Page not found",
  "That page doesn't exist.",
  "/404",
);

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-8 lg:px-12 lg:py-40">
      <p className="text-eyebrow">Error 404</p>
      <h1 className="text-display mt-4">404</h1>
      <p className="text-muted mt-6 max-w-md text-lg">
        That page doesn&apos;t exist. Try one of the links above or head back
        home.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </section>
  );
}

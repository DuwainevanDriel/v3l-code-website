import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <h1 className="text-h2">{title}</h1>
      <div className="text-muted mt-8 max-w-[68ch]">{children}</div>
    </section>
  );
}

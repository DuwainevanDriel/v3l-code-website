import type { ReactNode } from "react";

export function PageStub({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-5xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-prose opacity-70">Content coming soon.</p>
      {children}
    </section>
  );
}

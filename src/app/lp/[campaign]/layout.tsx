import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mx-auto flex max-w-[1200px] items-center px-4 py-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display inline-flex min-h-11 items-center text-xl font-bold"
        >
          {siteConfig.name}
        </Link>
      </header>
      <main id="main">{children}</main>
    </>
  );
}

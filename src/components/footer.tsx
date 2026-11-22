import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { MotionToggle } from "./motion-toggle";

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 text-sm sm:px-8 lg:grid-cols-[2fr_1fr_1fr] lg:px-12">
        <div>
          <p className="font-display text-xl font-bold">{siteConfig.name}</p>
          <p className="text-muted mt-3 max-w-xs">
            Software, sites and apps that ship, hosted and looked after.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-accent mt-4 inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            {siteConfig.email}
          </a>
        </div>
        <nav aria-label="Footer">
          <p className="text-eyebrow">Explore</p>
          <ul className="mt-3">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted hover:text-text inline-flex min-h-11 items-center"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-eyebrow">Legal</p>
          <ul className="mt-3">
            <li>
              <Link
                href="/privacy"
                className="text-muted hover:text-text inline-flex min-h-11 items-center"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-muted hover:text-text inline-flex min-h-11 items-center"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-border text-muted mx-auto flex max-w-[1200px] flex-col gap-2 border-t px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>&copy; {siteConfig.name}. All rights reserved.</p>
        <MotionToggle />
      </div>
    </footer>
  );
}

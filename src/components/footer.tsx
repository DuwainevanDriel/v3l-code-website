import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm opacity-80 sm:flex-row sm:justify-between">
        <p>&copy; {siteConfig.name}. All rights reserved.</p>
        <nav aria-label="Footer">
          <ul className="flex gap-6">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

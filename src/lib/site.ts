export const siteConfig = {
  name: "V3L Code",
  description:
    "V3L Code builds software, websites and apps, and provides hosting and domains, for ambitious businesses.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://v3lcode.com").replace(
    /\/$/,
    "",
  ),
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

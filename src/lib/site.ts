export const siteConfig = {
  name: "V3L Code",
  description:
    "V3L Code builds software, websites and apps, and provides hosting and domains, for ambitious businesses.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://v3lcode.com").replace(
    /\/$/,
    "",
  ),
  email: "hello@v3lcode.com",
  nav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  cta: { href: "/contact", label: "Get a free quote" },
} as const;

export const services = [
  {
    title: "Websites",
    blurb: "Fast, SEO-ready sites that turn visitors into customers.",
    href: "/services",
    wide: true,
  },
  {
    title: "Apps",
    blurb: "iOS, Android and web apps your users keep opening.",
    href: "/services",
    wide: false,
  },
  {
    title: "Custom software",
    blurb: "Dashboards, APIs and integrations built around how you work.",
    href: "/services",
    wide: false,
  },
  {
    title: "Hosting",
    blurb: "Managed, monitored and backed up, so you can stop worrying.",
    href: "/services",
    wide: false,
  },
  {
    title: "Domains",
    blurb: "Find, register and manage the right name for your business.",
    href: "/services",
    wide: false,
  },
] as const;

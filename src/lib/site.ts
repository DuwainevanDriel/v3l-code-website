export const siteConfig = {
  name: "V3L Code",
  description:
    "V3L Code builds software, websites and apps, and provides hosting and domains, for ambitious businesses.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://v3lcode.com").replace(
    /\/$/,
    "",
  ),
  email: "hello@v3lcode.com",
  /** Optional, E.164 (e.g. +27211234567). Enables click-to-call links. */
  phone: process.env.NEXT_PUBLIC_PHONE,
  /** Optional Google Tag Manager container id (GTM-XXXXXXX). */
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  /** Optional Search Console HTML-tag verification token. */
  googleVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  nav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  cta: { href: "/contact", label: "Get a free quote" },
} as const;

export type Service = {
  slug: string;
  title: string;
  blurb: string;
  headline: string;
  intro: string;
  deliverables: readonly string[];
  steps: readonly { title: string; text: string }[];
};

export const services: readonly Service[] = [
  {
    slug: "websites",
    title: "Websites",
    blurb: "Fast, SEO-ready sites that turn visitors into customers.",
    headline: "Websites that load fast and get found.",
    intro:
      "Marketing sites and web platforms built for speed, search and conversion, with landing pages ready for your ad campaigns.",
    deliverables: [
      "Responsive design that works on every screen",
      "Technical SEO: metadata, sitemap, structured data",
      "Core Web Vitals focused performance",
      "Landing pages for Google Ads campaigns",
      "Accessible by default: keyboard, focus, contrast",
    ],
    steps: [
      { title: "Discover", text: "We agree goals, audience and scope." },
      { title: "Design", text: "You approve the look before we build." },
      { title: "Build", text: "Small, tested releases you can preview." },
      { title: "Launch", text: "Go live, then measure and improve." },
    ],
  },
  {
    slug: "apps",
    title: "Apps",
    blurb: "iOS, Android and web apps your users keep opening.",
    headline: "Apps your users keep opening.",
    intro:
      "Mobile and web applications designed around a clear job to be done, from first prototype to store release.",
    deliverables: [
      "iOS and Android apps from one codebase",
      "Progressive web apps",
      "Authentication and secure data handling",
      "Store submission and release management",
      "Analytics and crash reporting",
    ],
    steps: [
      { title: "Scope", text: "Define the core flow and what ships first." },
      {
        title: "Prototype",
        text: "Clickable screens to test with real users.",
      },
      { title: "Build", text: "Iterative builds delivered to your device." },
      { title: "Release", text: "Store submission and post-launch support." },
    ],
  },
  {
    slug: "custom-software",
    title: "Custom software",
    blurb: "Dashboards, APIs and integrations built around how you work.",
    headline: "Software built around how you work.",
    intro:
      "Internal tools, dashboards, APIs and integrations that replace spreadsheets and stitch your systems together.",
    deliverables: [
      "Internal tools and admin dashboards",
      "REST APIs and third-party integrations",
      "Workflow automation and reporting",
      "Role-based access and audit trails",
      "Documentation and handover",
    ],
    steps: [
      { title: "Map", text: "We learn your process and where it hurts." },
      { title: "Plan", text: "A written scope, milestones and risks." },
      { title: "Build", text: "Working increments you can try early." },
      { title: "Support", text: "Training, monitoring and ongoing changes." },
    ],
  },
  {
    slug: "hosting",
    title: "Hosting",
    blurb: "Managed, monitored and backed up, so you can stop worrying.",
    headline: "Hosting you can stop worrying about.",
    intro:
      "Managed hosting for the sites and apps we build, and for existing projects that need a safer home.",
    deliverables: [
      "Managed deployments and SSL certificates",
      "Uptime monitoring and alerting",
      "Regular backups with tested restores",
      "Security updates and patching",
      "A named contact when something breaks",
    ],
    steps: [
      { title: "Assess", text: "Review your current setup and needs." },
      { title: "Migrate", text: "Move over with minimal downtime." },
      { title: "Monitor", text: "We watch it so you don't have to." },
      { title: "Maintain", text: "Updates, backups and regular check-ins." },
    ],
  },
  {
    slug: "domains",
    title: "Domains",
    blurb: "Find, register and manage the right name for your business.",
    headline: "The right name, managed properly.",
    intro:
      "Find, register and manage domains and DNS, so your name and email always point to the right place.",
    deliverables: [
      "Domain search and registration",
      "DNS setup and management",
      "Domain transfers with no downtime",
      "Business email configuration",
      "Renewal reminders so nothing lapses",
    ],
    steps: [
      { title: "Choose", text: "Shortlist names that fit your brand." },
      { title: "Register", text: "We register it in your name." },
      { title: "Connect", text: "Point it at your site and email." },
      { title: "Renew", text: "We track renewals and expiry." },
    ],
  },
];

export const serviceHref = (slug: string) => `/services/${slug}`;

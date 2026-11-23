export type Plan = {
  name: string;
  price: string;
  unit?: string;
  note: string;
  features: readonly string[];
  featured?: boolean;
};

/** Prices are placeholders until the owner confirms real figures. */
export const plans: readonly Plan[] = [
  {
    name: "Starter site",
    price: "£X",
    note: "A fast, polished site to get you online.",
    features: [
      "Up to 5 pages",
      "Responsive, accessible design",
      "Basic on-page SEO",
      "Contact form",
    ],
  },
  {
    name: "Growth",
    price: "£X",
    note: "Custom site or app with integrations.",
    features: [
      "Custom design and build",
      "Integrations and automation",
      "Google Ads landing pages",
      "Analytics set up",
    ],
    featured: true,
  },
  {
    name: "Hosting",
    price: "£X",
    unit: "/mo",
    note: "Managed hosting, backups and monitoring.",
    features: [
      "Managed deployments and SSL",
      "Uptime monitoring",
      "Regular backups",
      "Security updates",
    ],
  },
];

export const faqs = [
  {
    q: "How is a project priced?",
    a: "Fixed-scope projects get a fixed quote after a short discovery call. Hosting is billed monthly.",
  },
  {
    q: "Can I pay in stages?",
    a: "Yes. We agree milestones up front and invoice as each one is delivered.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes. Hosting plans include a named contact, and we can agree a support retainer for changes.",
  },
] as const;

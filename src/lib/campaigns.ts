export type Campaign = {
  slug: string;
  title: string;
  headline: string;
  intro: string;
  points: readonly string[];
};

export const campaigns: readonly Campaign[] = [
  {
    slug: "website",
    title: "Get a fast, SEO-ready website",
    headline: "A website that loads fast and gets found.",
    intro:
      "Tell us about your business and get a free quote for a website built for speed, search and conversion.",
    points: [
      "Responsive design for every screen",
      "Technical SEO built in",
      "Small, tested releases you can preview",
    ],
  },
  {
    slug: "app",
    title: "Get an app built",
    headline: "An app your users keep opening.",
    intro:
      "Share your idea and get a free quote for an iOS, Android or web app.",
    points: [
      "iOS and Android from one codebase",
      "Prototype before we build",
      "Store submission handled",
    ],
  },
];

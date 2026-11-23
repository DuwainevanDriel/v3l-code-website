import { faqs } from "./pricing";
import { type Service, serviceHref, siteConfig } from "./site";

const abs = (path: string) => `${siteConfig.url}${path === "/" ? "" : path}`;

export const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  logo: `${siteConfig.url}/icon.svg`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: siteConfig.email,
    ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
  },
};

export function breadcrumbData(
  trail: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function serviceData(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.intro,
    url: abs(serviceHref(service.slug)),
    serviceType: service.title,
    provider: { "@id": `${siteConfig.url}/#organization` },
  };
}

export const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

import type { MetadataRoute } from "next";
import { serviceHref, services, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = siteConfig.nav.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.7,
  }));
  const servicePages = services.map((s) => ({
    url: `${siteConfig.url}${serviceHref(s.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...servicePages];
}

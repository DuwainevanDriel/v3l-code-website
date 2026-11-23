import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { serviceHref, services, siteConfig } from "./site";

describe("services data", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("has content for every service page", () => {
    for (const s of services) {
      expect(s.deliverables.length).toBeGreaterThan(0);
      expect(s.steps.length).toBeGreaterThan(0);
    }
  });

  it("lists every nav page and service page in the sitemap", () => {
    const urls = sitemap().map((e) => e.url);
    for (const item of siteConfig.nav.filter((n) => n.href !== "/")) {
      expect(urls).toContain(`${siteConfig.url}${item.href}`);
    }
    for (const s of services) {
      expect(urls).toContain(`${siteConfig.url}${serviceHref(s.slug)}`);
    }
  });
});

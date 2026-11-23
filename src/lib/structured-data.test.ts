import { describe, expect, it } from "vitest";
import { faqs } from "./pricing";
import { services, siteConfig } from "./site";
import { breadcrumbData, faqData, serviceData } from "./structured-data";

describe("structured data", () => {
  it("builds absolute, ordered breadcrumbs starting at Home", () => {
    const data = breadcrumbData([{ name: "Services", path: "/services" }]);
    expect(data.itemListElement.map((i) => i.item)).toEqual([
      siteConfig.url,
      `${siteConfig.url}/services`,
    ]);
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it("describes each service with an absolute URL", () => {
    for (const s of services)
      expect(serviceData(s).url).toBe(`${siteConfig.url}/services/${s.slug}`);
  });

  it("mirrors every visible FAQ", () => {
    expect(faqData.mainEntity).toHaveLength(faqs.length);
  });
});

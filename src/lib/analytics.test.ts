// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  GCLID_STORAGE_KEY,
  linkEvent,
  readConsent,
  storeConsent,
  track,
} from "./analytics";

beforeEach(() => {
  window.localStorage.clear();
  window.dataLayer = [];
});

describe("analytics", () => {
  it("does not track before consent or after it is declined", () => {
    track({ event: "generate_lead", form_source: "contact" });
    storeConsent("denied");
    track({ event: "generate_lead", form_source: "contact" });
    expect(window.dataLayer).toEqual([]);
  });

  it("tracks after consent and attaches the gclid from the URL", () => {
    storeConsent("granted");
    window.history.pushState({}, "", "/lp/website?gclid=abc123");
    track({ event: "generate_lead", form_source: "website" });
    expect(window.dataLayer).toEqual([
      { event: "generate_lead", form_source: "website", gclid: "abc123" },
    ]);
    expect(window.localStorage.getItem(GCLID_STORAGE_KEY)).toBe("abc123");
  });

  it("reuses the stored gclid on later pages", () => {
    storeConsent("granted");
    window.localStorage.setItem(GCLID_STORAGE_KEY, "old");
    window.history.pushState({}, "", "/contact");
    track({ event: "click_email", link_url: "mailto:a@b.co" });
    expect(window.dataLayer).toEqual([
      { event: "click_email", link_url: "mailto:a@b.co", gclid: "old" },
    ]);
  });

  it("ignores invalid stored consent", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readConsent()).toBeNull();
  });

  it("classifies contact links", () => {
    expect(linkEvent("tel:+27210000000")?.event).toBe("click_to_call");
    expect(linkEvent("mailto:hi@v3lcode.com")?.event).toBe("click_email");
    expect(linkEvent("/contact")).toBeNull();
  });
});

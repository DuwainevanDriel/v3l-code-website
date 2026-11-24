export const CONSENT_STORAGE_KEY = "v3l-consent";
export const CONSENT_EVENT = "v3l-consent-change";
export const GCLID_STORAGE_KEY = "v3l-gclid";

export type Consent = "granted" | "denied";

export type AnalyticsEvent =
  | { event: "generate_lead"; form_source: string }
  | { event: "click_to_call"; link_url: string }
  | { event: "click_email"; link_url: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Inline script run in <head>: defines gtag and denies all consent until the visitor chooses. */
export const consentDefaultsScript = `window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied",wait_for_update:500});`;

export function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(value: Consent): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice only lasts for this page view.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Tells Google tags what the visitor chose. No-op until the defaults script has run. */
export function updateConsent(value: Consent): void {
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

/** Remembers the Google Ads click id from the landing URL (call only with consent). */
export function captureGclid(search: string): string | null {
  const fromUrl = new URLSearchParams(search).get("gclid");
  try {
    if (fromUrl) window.localStorage.setItem(GCLID_STORAGE_KEY, fromUrl);
    return fromUrl ?? window.localStorage.getItem(GCLID_STORAGE_KEY);
  } catch {
    return fromUrl;
  }
}

/** Sends a conversion event to the data layer, only after analytics consent. */
export function track(payload: AnalyticsEvent): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  const gclid = captureGclid(window.location.search);
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(gclid ? { ...payload, gclid } : { ...payload });
}

/** Classifies a clicked href as a trackable contact link. */
export function linkEvent(href: string): AnalyticsEvent | null {
  if (href.startsWith("tel:"))
    return { event: "click_to_call", link_url: href };
  if (href.startsWith("mailto:"))
    return { event: "click_email", link_url: href };
  return null;
}

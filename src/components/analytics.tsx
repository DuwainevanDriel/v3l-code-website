"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import {
  CONSENT_EVENT,
  type Consent,
  captureGclid,
  linkEvent,
  readConsent,
  track,
  updateConsent,
} from "@/lib/analytics";

const subscribe = (onChange: () => void) => {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
};
const getServerSnapshot = (): Consent | null => null;

/**
 * Loads Google Tag Manager only after the visitor accepts, and reports
 * click-to-call and email clicks. Renders nothing without a GTM id.
 */
export function Analytics({ gtmId }: { gtmId?: string }) {
  const consent = useSyncExternalStore(
    subscribe,
    readConsent,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!gtmId) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest("a[href]");
      const payload = link ? linkEvent(link.getAttribute("href") ?? "") : null;
      if (payload) track(payload);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [gtmId]);

  useEffect(() => {
    if (!gtmId || !consent) return;
    if (consent === "granted") captureGclid(window.location.search);
    updateConsent(consent);
  }, [gtmId, consent]);

  if (!gtmId || consent !== "granted") return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":Date.now(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i;f.parentNode.insertBefore(j,f)})(window,document,"script","dataLayer",${JSON.stringify(gtmId)});`}
    </Script>
  );
}

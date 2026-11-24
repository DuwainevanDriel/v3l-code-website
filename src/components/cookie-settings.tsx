"use client";

import { OPEN_CONSENT_EVENT } from "@/components/consent-banner";

export function CookieSettings() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      Cookie settings
    </button>
  );
}

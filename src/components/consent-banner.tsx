"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSENT_EVENT, readConsent, storeConsent } from "@/lib/analytics";

export const OPEN_CONSENT_EVENT = "v3l-consent-open";

const subscribe = (onChange: () => void) => {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
};

const button =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Cookie consent for analytics and advertising. Shown until the visitor chooses. */
export function ConsentBanner({ enabled }: { enabled: boolean }) {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "granted");
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  if (!enabled || (consent !== null && !reopened)) return null;

  const choose = (value: "granted" | "denied") => {
    storeConsent(value);
    setReopened(false);
  };

  return (
    <section
      aria-label="Cookie consent"
      className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm">
          We use cookies for analytics and to measure our advertising. You can
          decline and the site works the same. See our{" "}
          <Link className="text-accent underline" href="/privacy">
            privacy page
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className={`${button} border-border border`}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className={`${button} bg-accent text-on-accent`}
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}

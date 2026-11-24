"use client";

import Script from "next/script";
import { useActionState, useEffect, type ReactNode } from "react";
import { sendContact } from "@/app/(site)/contact/actions";
import {
  type ContactField,
  type ContactState,
  limits,
  serviceOptions,
} from "@/lib/contact";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

const initial: ContactState = { status: "idle" };

const control =
  "border-border bg-surface focus-visible:outline-accent w-full rounded-lg border px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: ContactField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-danger mt-2 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({
  source = "",
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
}: {
  source?: string;
  siteKey?: string;
}) {
  const [state, action, pending] = useActionState(sendContact, initial);

  useEffect(() => {
    if (state.status === "error") window.turnstile?.reset();
    if (state.status === "success")
      track({ event: "generate_lead", form_source: source || "contact" });
  }, [state, source]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-border bg-surface rounded-lg border p-8"
      >
        <h2 className="text-h2">Thanks, we got your message.</h2>
        <p className="text-muted mt-3">
          We will reply to the email address you gave us.
        </p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const values = state.status === "error" ? state.values : undefined;
  const aria = (f: ContactField) => ({
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${f}-error` : undefined,
  });

  return (
    <form action={action} className="space-y-6" aria-label="Contact form">
      <Field id="name" label="Your name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={limits.name}
          defaultValue={values?.name}
          className={control}
          {...aria("name")}
        />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={limits.email}
          defaultValue={values?.email}
          className={control}
          {...aria("email")}
        />
      </Field>
      <Field id="service" label="What do you need?" error={errors.service}>
        <select
          id="service"
          name="service"
          required
          defaultValue={values?.service ?? ""}
          className={control}
          {...aria("service")}
        >
          <option value="" disabled>
            Choose one
          </option>
          {serviceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="message"
        label="Tell us about your project"
        error={errors.message}
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={limits.minMessage}
          maxLength={limits.message}
          defaultValue={values?.message}
          className={control}
          {...aria("message")}
        />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="source" value={source} />
      {siteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile min-h-[65px]"
            data-sitekey={siteKey}
            data-theme="dark"
          />
        </>
      ) : null}
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-danger">
          {state.message} You can also email{" "}
          <a className="underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          .
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-on-accent inline-flex min-h-12 items-center justify-center rounded-full px-8 font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

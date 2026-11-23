"use server";

import { headers } from "next/headers";
import type { ContactState } from "@/lib/contact";
import { submitContact } from "@/lib/contact-submit";
import { emailConfigFromEnv } from "@/lib/email";

export async function sendContact(
  _prev: ContactState,
  data: FormData,
): Promise<ContactState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  return submitContact(data, {
    ip,
    now: Date.now(),
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
    email: emailConfigFromEnv(process.env),
    production: process.env.NODE_ENV === "production",
  });
}

import { type ContactState, parseContact, serviceOptions } from "./contact";
import { type EmailConfig } from "./email";
import { rateLimit } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";

export type SubmitDeps = {
  ip: string | null;
  now: number;
  turnstileSecret: string | undefined;
  email: EmailConfig | null;
  production: boolean;
};

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

/** Core of the contact server action, separated so it can be unit tested. */
export async function submitContact(
  data: FormData,
  deps: SubmitDeps,
): Promise<ContactState> {
  // Honeypot: real users never see or fill this field. Pretend success.
  const trap = data.get("company");
  if (typeof trap === "string" && trap.trim() !== "")
    return { status: "success" };

  const parsed = parseContact(data);
  if (!parsed.ok)
    return { status: "error", errors: parsed.errors, values: parsed.values };

  const allowed = rateLimit(
    `contact:${deps.ip ?? "unknown"}`,
    { limit: 5, windowMs: 10 * 60 * 1000 },
    deps.now,
  );
  if (!allowed)
    return {
      status: "error",
      message: "Too many messages. Please wait a few minutes and try again.",
      values: parsed.value,
    };

  const token = data.get("cf-turnstile-response");
  const check = await verifyTurnstile(
    typeof token === "string" ? token : "",
    deps.turnstileSecret,
    deps.ip,
  );
  if (check === "failed" || (check === "unconfigured" && deps.production))
    return {
      status: "error",
      message: "We could not verify you are human. Please try again.",
      values: parsed.value,
    };

  if (!deps.email)
    return {
      status: "error",
      message: `Sending is unavailable right now. Please email us directly.`,
      values: parsed.value,
    };

  const { name, email, service, message, source } = parsed.value;
  const serviceLabel =
    serviceOptions.find((o) => o.value === service)?.label ?? service;
  try {
    await deps.email.provider.send({
      to: deps.email.to,
      from: deps.email.from,
      replyTo: email,
      subject: `New enquiry from ${oneLine(name)}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Interested in: ${serviceLabel}`,
        `Source: ${source || "contact page"}`,
        "",
        message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Contact email failed", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again.",
      values: parsed.value,
    };
  }
  return { status: "success" };
}

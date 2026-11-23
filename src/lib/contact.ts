import { services } from "./site";

export const contactFields = ["name", "email", "service", "message"] as const;
export type ContactField = (typeof contactFields)[number];

export type ContactInput = Record<ContactField, string> & { source: string };
export type ContactErrors = Partial<Record<ContactField, string>>;

export const serviceOptions: readonly { value: string; label: string }[] = [
  ...services.map((s) => ({ value: s.slug, label: s.title })),
  { value: "other", label: "Something else" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE = /^[a-z0-9-]{0,50}$/;

export const limits = { name: 100, email: 254, message: 2000, minMessage: 10 };

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export function parseContact(
  data: FormData,
):
  | { ok: true; value: ContactInput }
  | { ok: false; errors: ContactErrors; values: ContactInput } {
  const values: ContactInput = {
    name: text(data, "name"),
    email: text(data, "email"),
    service: text(data, "service"),
    message: text(data, "message"),
    source: text(data, "source"),
  };
  const errors: ContactErrors = {};

  if (!values.name) errors.name = "Enter your name.";
  else if (values.name.length > limits.name)
    errors.name = `Keep your name under ${limits.name} characters.`;

  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > limits.email || !EMAIL.test(values.email))
    errors.email = "Enter a valid email address.";

  if (!serviceOptions.some((o) => o.value === values.service))
    errors.service = "Choose what you need.";

  if (values.message.length < limits.minMessage)
    errors.message = `Tell us a little more (at least ${limits.minMessage} characters).`;
  else if (values.message.length > limits.message)
    errors.message = `Keep your message under ${limits.message} characters.`;

  if (!SOURCE.test(values.source)) values.source = "";

  return Object.keys(errors).length > 0
    ? { ok: false, errors, values }
    : { ok: true, value: values };
}

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message?: string;
      errors?: ContactErrors;
      values?: ContactInput;
    };

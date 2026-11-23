import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseContact } from "./contact";
import { submitContact, type SubmitDeps } from "./contact-submit";
import { resetRateLimits } from "./rate-limit";

const form = (over: Record<string, string> = {}) => {
  const data = new FormData();
  const base = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    service: "websites",
    message: "I need a new website for my business.",
    "cf-turnstile-response": "tok",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) data.set(k, v);
  return data;
};

const send = vi.fn();
const deps = (over: Partial<SubmitDeps> = {}): SubmitDeps => ({
  ip: "1.2.3.4",
  now: 1000,
  turnstileSecret: "secret",
  email: { provider: { send }, to: "to@example.com", from: "from@example.com" },
  production: true,
  ...over,
});

beforeEach(() => {
  resetRateLimits();
  send.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("parseContact", () => {
  it("accepts valid input", () => {
    expect(parseContact(form()).ok).toBe(true);
  });

  it("reports each invalid field", () => {
    const r = parseContact(
      form({ name: " ", email: "nope", service: "x", message: "short" }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(Object.keys(r.errors).sort()).toEqual([
        "email",
        "message",
        "name",
        "service",
      ]);
  });

  it("drops an unsafe source value", () => {
    const r = parseContact(form({ source: "Bad Value!" }));
    expect(r.ok && r.value.source).toBe("");
  });
});

describe("submitContact", () => {
  it("sends an email on valid input", async () => {
    const r = await submitContact(form({ source: "website" }), deps());
    expect(r).toEqual({ status: "success" });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toMatchObject({
      replyTo: "ada@example.com",
      to: "to@example.com",
    });
  });

  it("returns field errors and does not send", async () => {
    const r = await submitContact(form({ email: "bad" }), deps());
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("silently ignores honeypot submissions", async () => {
    const r = await submitContact(form({ company: "Spam Inc" }), deps());
    expect(r).toEqual({ status: "success" });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects when Turnstile fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false }),
      }),
    );
    const data = form();
    data.set("cf-turnstile-response", "tok");
    const r = await submitContact(data, deps());
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("fails closed in production without a Turnstile secret", async () => {
    const r = await submitContact(form(), deps({ turnstileSecret: undefined }));
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("allows missing Turnstile secret outside production", async () => {
    const r = await submitContact(
      form(),
      deps({ turnstileSecret: undefined, production: false }),
    );
    expect(r).toEqual({ status: "success" });
  });

  it("rate limits repeated submissions from one IP", async () => {
    const data = () => {
      const d = form();
      d.set("cf-turnstile-response", "tok");
      return d;
    };
    for (let i = 0; i < 5; i++) await submitContact(data(), deps());
    const r = await submitContact(data(), deps());
    expect(r.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(5);
  });

  it("reports provider failures without leaking details", async () => {
    send.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const data = form();
    data.set("cf-turnstile-response", "tok");
    const r = await submitContact(data, deps());
    expect(r.status === "error" && r.message).not.toContain("boom");
  });

  it("errors when email is not configured", async () => {
    const data = form();
    data.set("cf-turnstile-response", "tok");
    const r = await submitContact(data, deps({ email: null }));
    expect(r.status).toBe("error");
  });
});

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = "ok" | "failed" | "unconfigured";

export async function verifyTurnstile(
  token: string,
  secret: string | undefined,
  ip: string | null,
): Promise<TurnstileResult> {
  if (!secret) return "unconfigured";
  if (!token) return "failed";
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return "failed";
    const json: unknown = await res.json();
    const success =
      typeof json === "object" &&
      json !== null &&
      "success" in json &&
      json.success === true;
    return success ? "ok" : "failed";
  } catch {
    return "failed";
  }
}

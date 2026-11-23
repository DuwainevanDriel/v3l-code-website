export type EmailMessage = {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export function resendProvider(apiKey: string): EmailProvider {
  return {
    async send(message) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: message.from,
          to: [message.to],
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
        }),
      });
      if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
    },
  };
}

export type EmailConfig = {
  provider: EmailProvider;
  to: string;
  from: string;
};

export function emailConfigFromEnv(
  env: Record<string, string | undefined>,
): EmailConfig | null {
  const { EMAIL_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env;
  if (!EMAIL_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return null;
  return {
    provider: resendProvider(EMAIL_API_KEY),
    to: CONTACT_TO_EMAIL,
    from: CONTACT_FROM_EMAIL,
  };
}

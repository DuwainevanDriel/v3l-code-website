import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Privacy",
  "Privacy for V3L Code.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        This page is a placeholder. The final text will be supplied by the
        business owner.
      </p>
    </LegalPage>
  );
}

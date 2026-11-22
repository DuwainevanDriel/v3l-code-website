import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Terms", "Terms for V3L Code.", "/terms");

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        This page is a placeholder. The final text will be supplied by the
        business owner.
      </p>
    </LegalPage>
  );
}

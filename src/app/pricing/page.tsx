import { PageStub } from "@/components/page-stub";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Pricing",
  "Transparent pricing for V3L Code software, web, hosting and domain services.",
  "/pricing",
);

export default function PricingPage() {
  return <PageStub title="Pricing" />;
}

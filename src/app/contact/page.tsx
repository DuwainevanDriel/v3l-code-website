import { PageStub } from "@/components/page-stub";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Contact",
  "Get in touch with V3L Code to start your project.",
  "/contact",
);

export default function ContactPage() {
  return <PageStub title="Contact" />;
}

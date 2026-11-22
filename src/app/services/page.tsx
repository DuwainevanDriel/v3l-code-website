import { PageStub } from "@/components/page-stub";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Services",
  "Software development, websites, apps, hosting and domains from V3L Code.",
  "/services",
);

export default function ServicesPage() {
  return <PageStub title="Services" />;
}

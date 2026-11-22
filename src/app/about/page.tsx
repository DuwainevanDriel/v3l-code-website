import { PageStub } from "@/components/page-stub";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  "Learn about V3L Code, a software, web, app, hosting and domains company.",
  "/about",
);

export default function AboutPage() {
  return <PageStub title="About" />;
}

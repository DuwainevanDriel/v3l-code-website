import { organizationData } from "@/lib/structured-data";

/** Renders one JSON-LD block. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return <JsonLd data={organizationData} />;
}

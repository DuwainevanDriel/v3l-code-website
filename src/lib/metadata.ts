import type { Metadata } from "next";
import { siteConfig } from "./site";

/** Per-page metadata with a canonical URL. `path` must start with "/". */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export const absoluteUrl = (path: string) => `${siteConfig.url}${path}`;

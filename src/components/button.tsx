import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "link";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-colors";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-110",
  secondary: "border border-border text-text hover:bg-surface-2",
  link: "min-h-11 px-1 text-accent underline-offset-4 hover:underline",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

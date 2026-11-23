"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { ButtonLink } from "./button";

const links = siteConfig.nav.filter((item) => item.href !== "/");

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    burger.current?.focus();
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        menu.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      );
    focusable()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [burger.current, ...focusable()].filter(
        (el): el is HTMLElement => el !== null,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-300 ${
        hidden && !open ? "-translate-y-full" : ""
      } ${scrolled || open ? "bg-bg/80 backdrop-blur-md" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="text-muted hover:text-text aria-[current=page]:text-text inline-flex min-h-11 items-center transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ButtonLink href={siteConfig.cta.href} className="min-h-11">
              {siteConfig.cta.label}
            </ButtonLink>
          </div>
          <button
            ref={burger}
            type="button"
            className="border-border inline-flex size-11 items-center justify-center rounded-full border lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div
          id="mobile-menu"
          ref={menu}
          className="bg-bg fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col px-4 pb-6 lg:hidden"
        >
          <nav aria-label="Mobile">
            <ul className="mt-6 flex flex-col gap-2">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display flex min-h-14 items-center text-3xl font-bold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto">
            <ButtonLink
              href={siteConfig.cta.href}
              onClick={() => setOpen(false)}
              className="w-full"
            >
              {siteConfig.cta.label}
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}

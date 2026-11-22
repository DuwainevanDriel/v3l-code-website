import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import { Header } from "./header";

describe("Header navigation", () => {
  it("renders every primary link and the quote CTA", () => {
    render(<Header />);
    const primary = screen.getByRole("navigation", { name: "Primary" });
    for (const item of siteConfig.nav.filter((n) => n.href !== "/")) {
      expect(primary).toContainElement(
        screen.getAllByRole("link", { name: item.label })[0],
      );
    }
    expect(
      screen.getByRole("link", { name: siteConfig.cta.label }),
    ).toHaveAttribute("href", siteConfig.cta.href);
  });

  it("marks the current page", () => {
    render(<Header />);
    const primary = screen.getByRole("navigation", { name: "Primary" });
    expect(primary.querySelector("[aria-current=page]")).toHaveTextContent(
      "Services",
    );
  });

  it("opens the mobile menu, moves focus into it, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const burger = screen.getByRole("button", { name: "Open menu" });
    expect(burger).toHaveAttribute("aria-expanded", "false");

    await user.click(burger);
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("traps Tab focus inside the open menu", async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menuLinks = screen
      .getByRole("navigation", { name: "Mobile" })
      .querySelectorAll("a");
    expect(menuLinks[0]).toHaveFocus();
    for (let i = 0; i < 20; i++) await user.tab();
    const menu = document.getElementById("mobile-menu");
    const burgerBtn = screen.getByRole("button", { name: "Close menu" });
    expect(
      menu?.contains(document.activeElement) ||
        document.activeElement === burgerBtn,
    ).toBe(true);
  });
});

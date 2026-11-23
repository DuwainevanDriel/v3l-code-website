import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

const sendContact = vi.hoisted(() => vi.fn());
vi.mock("@/app/(site)/contact/actions", () => ({ sendContact }));

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Your name"), "Ada");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.selectOptions(
    screen.getByLabelText("What do you need?"),
    "websites",
  );
  await user.type(
    screen.getByLabelText("Tell us about your project"),
    "I need a new website please.",
  );
}

describe("ContactForm", () => {
  it("renders labelled, required fields and a submit button", () => {
    render(<ContactForm siteKey="" />);
    for (const label of ["Your name", "Email", "What do you need?"])
      expect(screen.getByLabelText(label)).toBeRequired();
    expect(screen.getByLabelText("Tell us about your project")).toBeRequired();
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("shows server errors against the fields and keeps values", async () => {
    sendContact.mockResolvedValue({
      status: "error",
      errors: { email: "Enter a valid email address." },
      values: { name: "Ada", email: "x", service: "", message: "", source: "" },
    });
    const user = userEvent.setup();
    render(<ContactForm siteKey="" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows a confirmation on success", async () => {
    sendContact.mockResolvedValue({ status: "success" });
    const user = userEvent.setup();
    render(<ContactForm siteKey="" />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks");
  });
});

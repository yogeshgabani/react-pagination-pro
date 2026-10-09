import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ComingSoonProvider, SiteLink } from "../demo/src/links";
import { SiteFooter } from "../demo/src/SiteFooter";

const renderFooter = () =>
  render(
    <ComingSoonProvider>
      <SiteFooter variantCount={136} />
    </ComingSoonProvider>,
  );

describe("<SiteFooter />", () => {
  // The counter hook fetches on mount; keep the suite off the network.
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {}))));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("renders the brand card and the variant count", () => {
    renderFooter();
    expect(screen.getByText("react-next-pagination-pro")).toBeTruthy();
    expect(screen.getByText("136")).toBeTruthy();
    expect(screen.getByText("MIT")).toBeTruthy();
  });

  it("renders the four stat cards", () => {
    renderFooter();
    expect(screen.getByText("Last updated")).toBeTruthy();
    expect(screen.getByText("Total hits")).toBeTruthy();
    expect(screen.getByText("Total visitors")).toBeTruthy();
    expect(screen.getByText("npm downloads")).toBeTruthy();
  });

  it("stamps 'Last updated' from the build date without any env config", () => {
    const { container } = renderFooter();
    const value = container.querySelector(".fstat-value")?.textContent ?? "";
    // e.g. "July 16, 2026" — formatted, never the raw ISO string.
    expect(value).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  it("shows a placeholder rather than a fabricated count until the counter answers", () => {
    const { container } = renderFooter();
    // fetch is stubbed out above, so hits/visitors/downloads never resolve:
    // the cards must show an em dash instead of inventing a number.
    const [, hits, visitors, downloads] = [...container.querySelectorAll(".fstat-value")].map(
      (n) => n.textContent,
    );
    expect([hits, visitors, downloads]).toEqual(["—", "—", "—"]);
  });

  it("opens the Coming soon dialog when a link has no URL configured", () => {
    renderFooter();
    // With VITE_GITHUB_URL blank the action renders as a coming-soon button.
    fireEvent.click(screen.getAllByRole("button", { name: /GitHub — coming soon/ })[0]);

    const dialog = screen.getByRole("dialog", { name: "Coming soon" });
    expect(within(dialog).getByText("Coming soon")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("<SiteLink />", () => {
  it("renders a real anchor when the URL is configured", () => {
    render(
      <ComingSoonProvider>
        <SiteLink url="https://example.com/repo" label="GitHub repo">
          GitHub
        </SiteLink>
      </ComingSoonProvider>,
    );
    const link = screen.getByRole("link", { name: "GitHub repo" });
    expect(link.getAttribute("href")).toBe("https://example.com/repo");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("falls back to a coming-soon button when the URL is missing", () => {
    render(
      <ComingSoonProvider>
        <SiteLink label="npm package">npm</SiteLink>
      </ComingSoonProvider>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /npm package — coming soon/ }));
    expect(screen.getByRole("dialog", { name: "Coming soon" })).toBeTruthy();
  });
});

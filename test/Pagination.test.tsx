import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../src/components/Pagination";

describe("<Pagination />", () => {
  it("renders a labelled navigation landmark", () => {
    render(<Pagination currentPage={1} totalPages={10} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("marks the current page with aria-current", () => {
    render(<Pagination currentPage={3} totalPages={10} />);
    const current = screen.getByRole("button", { name: "Go to page 3" });
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("calls onPageChange with the clicked page", () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables Previous on the first page", () => {
    render(<Pagination currentPage={1} totalPages={10} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveProperty("disabled", true);
  });

  it("navigates with the arrow keys", () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />,
    );
    fireEvent.keyDown(container.querySelector("nav")!, { key: "ArrowRight" });
    expect(onPageChange).toHaveBeenCalledWith(6);
    fireEvent.keyDown(container.querySelector("nav")!, { key: "Home" });
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("does not fire when clicking the already-active page", () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={4} totalPages={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("follows the system preference when dark is 'auto' (default)", () => {
    // Simulate an OS set to dark.
    const mql = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));

    const { container } = render(<Pagination currentPage={1} totalPages={10} />);
    expect(container.querySelector("nav")?.className).toContain("rpp-dark");

    vi.unstubAllGlobals();
  });

  it("an explicit dark boolean overrides the system preference", () => {
    // OS is dark, but dark={false} must force light.
    const mql = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));

    const { container } = render(<Pagination currentPage={1} totalPages={10} dark={false} />);
    expect(container.querySelector("nav")?.className).not.toContain("rpp-dark");

    vi.unstubAllGlobals();
  });
});

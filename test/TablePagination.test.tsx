import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablePagination } from "../src/components/TablePagination";

describe("<TablePagination />", () => {
  it("renders a labelled navigation landmark", () => {
    render(<TablePagination currentPage={1} pageSize={10} totalItems={42} />);
    expect(screen.getByRole("navigation", { name: "Table pagination" })).toBeTruthy();
  });

  it("shows the item range and total", () => {
    render(<TablePagination currentPage={1} pageSize={10} totalItems={4} />);
    expect(screen.getByText("1 - 4 / 4")).toBeTruthy();
  });

  it("shows current page and total pages in the page box", () => {
    render(<TablePagination currentPage={2} pageSize={10} totalItems={42} />);
    const input = screen.getByRole("textbox", { name: "Jump to page" }) as HTMLInputElement;
    expect(input.value).toBe("2");
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("opens the custom dropdown and calls onPageSizeChange with the picked size", () => {
    const onPageSizeChange = vi.fn();
    render(
      <TablePagination
        currentPage={1}
        pageSize={10}
        totalItems={100}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Rows per page" }));
    fireEvent.click(screen.getByRole("option", { name: "25" }));
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("navigates with Prev / Next and disables at the edges", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        currentPage={1}
        pageSize={10}
        totalItems={42}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("applies the theme prop as CSS custom properties on the root", () => {
    const { container } = render(
      <TablePagination
        currentPage={1}
        pageSize={10}
        totalItems={42}
        theme={{ primary: "#0891b2", onPrimary: "#fde047" }}
      />,
    );
    const style = container.querySelector("nav")?.getAttribute("style") ?? "";
    expect(style).toContain("--rpp-primary: #0891b2");
    expect(style).toContain("--rpp-on-primary: #fde047");
  });

  it("jumps to the typed page on Enter, clamped to range", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        currentPage={1}
        pageSize={10}
        totalItems={42}
        onPageChange={onPageChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Jump to page" });
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onPageChange).toHaveBeenCalledWith(5);
  });
});

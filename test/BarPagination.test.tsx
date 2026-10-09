import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BarPagination } from "../src/components/BarPagination";

describe("<BarPagination />", () => {
  it("renders a labelled navigation landmark", () => {
    render(<BarPagination currentPage={1} pageSize={10} totalItems={350} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("shows the range summary by default", () => {
    render(<BarPagination currentPage={1} pageSize={10} totalItems={35} />);
    expect(screen.getByText("1 - 10 / 35")).toBeTruthy();
  });

  it("supports the 'showing' and 'page' summary formats", () => {
    const { rerender } = render(
      <BarPagination currentPage={2} pageSize={10} totalItems={35} totalFormat="showing" />,
    );
    expect(screen.getByText("Showing 11-20 of 35")).toBeTruthy();
    rerender(<BarPagination currentPage={2} pageSize={10} totalItems={35} totalFormat="page" />);
    expect(screen.getByText("Page 2 of 4")).toBeTruthy();
  });

  it("navigates when a page number is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <BarPagination currentPage={1} pageSize={10} totalItems={100} onPageChange={onPageChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("jumps to the typed page via the go-to control, clamped to range", () => {
    const onPageChange = vi.fn();
    render(
      <BarPagination
        currentPage={1}
        pageSize={10}
        totalItems={35}
        showGoto
        onPageChange={onPageChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Go to page" });
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onPageChange).toHaveBeenCalledWith(4); // 35 items / 10 = 4 pages
  });

  it("opens the rows-per-page dropdown and reports the picked size", () => {
    const onPageSizeChange = vi.fn();
    render(
      <BarPagination
        currentPage={1}
        pageSize={10}
        totalItems={350}
        showPageSize
        onPageSizeChange={onPageSizeChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Rows per page" }));
    fireEvent.click(screen.getByRole("option", { name: "20" }));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("applies the theme prop as CSS custom properties on the root", () => {
    const { container } = render(
      <BarPagination
        currentPage={1}
        pageSize={10}
        totalItems={350}
        theme={{ primary: "#0891b2" }}
      />,
    );
    const style = container.querySelector("nav")?.getAttribute("style") ?? "";
    expect(style).toContain("--rpp-primary: #0891b2");
  });
});

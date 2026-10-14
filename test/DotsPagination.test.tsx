import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DotsPagination } from "../src/components/DotsPagination";

const dotPages = () =>
  screen.getAllByRole("button", { name: /^Go to page/ }).map((b) => Number(b.getAttribute("aria-label")!.split(" ").at(-1)));

describe("<DotsPagination />", () => {
  it("renders one dot per page and marks the current one", () => {
    render(<DotsPagination currentPage={2} totalPages={5} />);
    expect(dotPages()).toEqual([1, 2, 3, 4, 5]);
    expect(screen.getByRole("button", { name: "Go to page 2" }).getAttribute("aria-current")).toBe("page");
  });

  it("calls onPageChange with the clicked dot", () => {
    const onPageChange = vi.fn();
    render(<DotsPagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("windows long ranges and shrinks the edge dots", () => {
    render(<DotsPagination currentPage={10} totalPages={20} maxDots={7} />);
    expect(dotPages()).toEqual([7, 8, 9, 10, 11, 12, 13]);
    const cls = (p: number) => screen.getByRole("button", { name: `Go to page ${p}` }).className;
    expect(cls(7)).toContain("rpp-dot-far");
    expect(cls(8)).toContain("rpp-dot-near");
    expect(cls(10)).not.toMatch(/near|far/);
    expect(cls(12)).toContain("rpp-dot-near");
    expect(cls(13)).toContain("rpp-dot-far");
  });

  it("only shrinks the side that has more pages beyond it", () => {
    render(<DotsPagination currentPage={1} totalPages={20} maxDots={7} />);
    expect(dotPages()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(screen.getByRole("button", { name: "Go to page 1" }).className).not.toMatch(/near|far/);
    expect(screen.getByRole("button", { name: "Go to page 7" }).className).toContain("rpp-dot-far");
  });

  it("shows every dot when maxDots is Infinity", () => {
    render(<DotsPagination currentPage={1} totalPages={12} maxDots={Infinity} />);
    expect(dotPages()).toHaveLength(12);
  });

  it("navigates with arrow / Home / End keys, RTL-aware", () => {
    const onPageChange = vi.fn();
    const { container, rerender } = render(
      <DotsPagination currentPage={3} totalPages={8} onPageChange={onPageChange} />,
    );
    const nav = container.querySelector("nav")!;
    fireEvent.keyDown(nav, { key: "ArrowRight" });
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(nav, { key: "End" });
    expect(onPageChange).toHaveBeenLastCalledWith(8);

    rerender(<DotsPagination currentPage={3} totalPages={8} onPageChange={onPageChange} rtl />);
    fireEvent.keyDown(nav, { key: "ArrowRight" });
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it("keeps keyboard focus on the active dot as the window slides", () => {
    function Controlled() {
      const [page, setPage] = useState(3);
      return <DotsPagination currentPage={page} totalPages={20} maxDots={5} onPageChange={setPage} />;
    }
    render(<Controlled />);
    screen.getByRole("button", { name: "Go to page 3" }).focus();
    for (let i = 0; i < 4; i++) fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    // Page 3's dot has left the window by now; focus moved with the active dot.
    expect(screen.queryByRole("button", { name: "Go to page 3" })).toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Go to page 7");
  });

  it("renders the sliding indicator positioned at the active dot", () => {
    const { container } = render(<DotsPagination currentPage={4} totalPages={6} effect="slide" />);
    expect(container.querySelector(".rpp-dots-indicator")).toBeTruthy();
    const track = container.querySelector<HTMLElement>(".rpp-dots-track")!;
    expect(track.style.getPropertyValue("--rpp-dot-i")).toBe("3");
  });

  it("adds optional prev / next arrows that disable at the ends", () => {
    render(<DotsPagination currentPage={1} totalPages={3} showPrevNext />);
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Next page" })).toHaveProperty("disabled", false);
  });
});

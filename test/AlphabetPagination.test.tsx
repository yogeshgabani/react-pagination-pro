import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlphabetPagination } from "../src/components/AlphabetPagination";

describe("<AlphabetPagination />", () => {
  it("renders A–Z inside a labelled nav and marks the active letter", () => {
    render(<AlphabetPagination value="C" />);
    expect(screen.getByRole("navigation", { name: "Alphabetical navigation" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(26);
    expect(screen.getByRole("button", { name: "C" }).getAttribute("aria-current")).toBe("true");
  });

  it("disables letters that have no content", () => {
    render(<AlphabetPagination value={null} available={["a", "M"]} />);
    expect(screen.getByRole("button", { name: "A" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "M" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "B" })).toHaveProperty("disabled", true);
  });

  it("reports clicks, but not on the already-active letter", () => {
    const onChange = vi.fn();
    render(<AlphabetPagination value="B" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "K" }));
    expect(onChange).toHaveBeenCalledWith("K");
  });

  it("offers an All button that clears the filter", () => {
    const onChange = vi.fn();
    render(<AlphabetPagination value="D" onChange={onChange} showAll />);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("arrow keys skip disabled letters; Home / End jump to the ends", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AlphabetPagination value="A" onChange={onChange} available={["A", "D", "Z"]} />,
    );
    const nav = container.querySelector("nav")!;
    fireEvent.keyDown(nav, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("D");
    fireEvent.keyDown(nav, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith("Z");
  });

  it("jumps to a typed letter only when it has content", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AlphabetPagination value="A" onChange={onChange} available={["A", "M"]} />,
    );
    const nav = container.querySelector("nav")!;
    fireEvent.keyDown(nav, { key: "q" });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(nav, { key: "m" });
    expect(onChange).toHaveBeenCalledWith("M");
  });

  it("moves keyboard focus along with the selection", () => {
    function Controlled() {
      const [letter, setLetter] = useState<string | null>("B");
      return <AlphabetPagination value={letter} onChange={setLetter} />;
    }
    render(<Controlled />);
    screen.getByRole("button", { name: "B" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "m" });
    expect(document.activeElement?.textContent).toBe("M");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement?.textContent).toBe("N");
    expect(screen.getByRole("button", { name: "N" }).getAttribute("aria-current")).toBe("true");
  });

  it("supports custom letter sets and any variant", () => {
    const { container } = render(
      <AlphabetPagination value="#" letters={["#", "A", "B"]} variant="glass-neon" />,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["#", "A", "B"]);
    expect(container.querySelector("nav")?.className).toContain("rpp-v-glass-neon");
  });
});

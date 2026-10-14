import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { App } from "../demo/src/App";

// Rendering the whole demo (140+ paginations) in jsdom takes ~6s on a slow
// machine — over vitest's 5s default, though nothing is actually hanging.
describe("demo <App /> smoke", { timeout: 30_000 }, () => {
  it("opens the preview modal from a gallery tile and closes it", () => {
    render(<App />);

    const previewButtons = screen.getAllByRole("button", { name: /Preview/ });
    expect(previewButtons.length).toBeGreaterThan(0);
    fireEvent.click(previewButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close preview" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a live TablePagination preview for table variants", () => {
    render(<App />);

    // Filter the gallery to the table collection, then open the first tile.
    fireEvent.click(screen.getByRole("button", { name: "table" }));
    const tableTile = screen.getAllByRole("button", { name: /Preview/ }).at(0)!;
    fireEvent.click(tableTile);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("navigation", { name: "Table pagination" })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: /Copy/ })).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { InfiniteScroll } from "../src/components/InfiniteScroll";
import { useLoadMore } from "../src/hooks/useLoadMore";

/** Hand-driven IntersectionObserver: tests decide when the sentinel is visible. */
class MockIO {
  static all: MockIO[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    MockIO.all.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
}

/** The observer currently watching the sentinel, if any. */
const liveObserver = () => MockIO.all.filter((o) => !o.disconnected && o.observed.length).at(-1);

/** Reports the sentinel as (in)visible and lets the resulting load settle. */
async function scrollSentinel(isIntersecting = true) {
  const io = liveObserver();
  if (!io) throw new Error("no live observer");
  await act(async () => {
    io.callback([{ isIntersecting } as IntersectionObserverEntry], io as unknown as IntersectionObserver);
  });
}

const DATA = Array.from({ length: 25 }, (_, i) => `Row ${i + 1}`);

function Feed() {
  const { visible, hasMore, loadMore } = useLoadMore({ items: DATA, pageSize: 10 });
  return (
    <>
      <ul>
        {visible.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <InfiniteScroll hasMore={hasMore} onLoadMore={loadMore} />
    </>
  );
}

describe("<InfiniteScroll />", () => {
  beforeEach(() => {
    MockIO.all = [];
    vi.stubGlobal("IntersectionObserver", MockIO);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("loads the next batch each time the sentinel comes into view", async () => {
    render(<Feed />);
    expect(screen.getAllByRole("listitem")).toHaveLength(10);

    await scrollSentinel();
    expect(screen.getAllByRole("listitem")).toHaveLength(20);

    await scrollSentinel();
    expect(screen.getAllByRole("listitem")).toHaveLength(25);
  });

  it("stops observing and shows the end message once hasMore is false", async () => {
    render(<Feed />);
    await scrollSentinel();
    await scrollSentinel();
    expect(liveObserver()).toBeUndefined();
    expect(screen.getByRole("status").textContent).toContain("You’re all caught up");
  });

  it("ignores the sentinel while it is out of view", async () => {
    const onLoadMore = vi.fn();
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />);
    await scrollSentinel(false);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not observe while loading or disabled", () => {
    const { rerender } = render(<InfiniteScroll hasMore loading onLoadMore={vi.fn()} />);
    expect(liveObserver()).toBeUndefined();
    expect(screen.getByRole("status").textContent).toContain("Loading…");

    rerender(<InfiniteScroll hasMore disabled onLoadMore={vi.fn()} />);
    expect(liveObserver()).toBeUndefined();

    rerender(<InfiniteScroll hasMore onLoadMore={vi.fn()} />);
    expect(liveObserver()).toBeDefined();
  });

  it("passes root and rootMargin through to the observer", () => {
    const root = document.createElement("div");
    render(<InfiniteScroll hasMore onLoadMore={vi.fn()} root={root} rootMargin="0px 0px 50px 0px" />);
    expect(liveObserver()?.options).toEqual({ root, rootMargin: "0px 0px 50px 0px" });
  });

  it("pauses on a failed load and resumes on Retry", async () => {
    const onLoadMore = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />);

    await scrollSentinel();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Couldn’t load more items.")).toBeTruthy();
    expect(liveObserver()).toBeUndefined(); // no retry storm against a failing API

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await scrollSentinel();
    expect(onLoadMore).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Couldn’t load more items.")).toBeNull();
  });

  it("renders nothing to observe without IntersectionObserver (SSR / old browsers)", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const onLoadMore = vi.fn();
    render(<InfiniteScroll hasMore onLoadMore={onLoadMore} />);
    expect(MockIO.all).toHaveLength(0);
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});

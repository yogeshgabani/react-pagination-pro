import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Pagination,
  CompactPagination,
  LoadMorePagination,
  CursorPagination,
  TablePagination,
  BarPagination,
  InfiniteScroll,
  DotsPagination,
  AlphabetPagination,
  usePagination,
  useLoadMore,
  useCursorPagination,
  useUrlPagination,
  useSystemDark,
  VARIANT_COLLECTIONS,
  PAGINATION_VARIANTS,
  type PaginationColor,
  type PaginationSize,
  type PaginationShape,
  type PaginationAnimation,
  type DotsEffect,
} from "react-next-pagination-pro";
import "react-next-pagination-pro/styles.css";
import { version } from "../../package.json";
import { SiteFooter } from "./SiteFooter";
import { BrandIcon } from "./BrandIcon";
import { ComingSoonProvider, LINKS, SiteLink } from "./links";

/* App-wide dark mode — demos read this so every pagination gets the `dark` prop. */
const DarkCtx = createContext(false);

const COLORS: PaginationColor[] = [
  "blue", "purple", "green", "orange", "red", "pink", "cyan", "indigo", "emerald", "gray",
];
const COLOR_HEX: [string, string][] = [
  ["blue", "#2563eb"], ["purple", "#7c3aed"], ["green", "#16a34a"], ["orange", "#ea580c"],
  ["red", "#dc2626"], ["pink", "#db2777"], ["cyan", "#0891b2"], ["emerald", "#059669"],
];
// Common active-text colors (theme.onPrimary): white, black, and a few tints.
const TEXT_HEX: [string, string][] = [
  ["white", "#ffffff"], ["black", "#0f172a"], ["yellow", "#fde047"], ["mint", "#a7f3d0"],
  ["sky", "#bae6fd"], ["rose", "#fecdd3"],
];
// Common inactive-text colors (theme.text): darks, grays, and brand tones.
const INACTIVE_HEX: [string, string][] = [
  ["slate", "#0f172a"], ["gray", "#64748b"], ["light", "#94a3b8"], ["white", "#ffffff"],
  ["blue", "#2563eb"], ["purple", "#7c3aed"], ["green", "#16a34a"], ["red", "#dc2626"],
];
const SIZES: PaginationSize[] = ["sm", "md", "lg"];
const SHAPES: PaginationShape[] = ["rounded", "pill", "square", "circle"];
const ANIMS: PaginationAnimation[] = [
  "none", "fade", "scale", "bounce", "slide", "flip", "pulse", "elastic", "ripple",
];

/* ---------- Custom styled dropdown (replaces native <select>) ---------- */
function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close when clicking anywhere outside the dropdown.
  useEffect(() => {
    if (!open) return;
    const onOutside = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open]);

  // Keep the highlighted option visible while navigating a long list.
  useEffect(() => {
    if (open && highlight >= 0) {
      listRef.current?.children[highlight]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlight]);

  const toggle = () => {
    setOpen((o) => !o);
    setHighlight(options.indexOf(value));
  };

  const pick = (v: T) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        toggle();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Home":
        setHighlight(0);
        break;
      case "End":
        setHighlight(options.length - 1);
        break;
      case "Enter":
      case " ":
        if (highlight >= 0) pick(options[highlight]);
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div className="dselect" ref={rootRef}>
      <button
        type="button"
        className={`dselect-btn${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <span className="dselect-value">{value}</span>
        <svg className="dselect-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="dselect-list" role="listbox" ref={listRef}>
          {options.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={`dselect-opt${opt === value ? " is-selected" : ""}${i === highlight ? " is-hi" : ""}`}
              onClick={() => pick(opt)}
              onMouseMove={() => setHighlight(i)}
            >
              <span>{opt}</span>
              {opt === value && <span className="dselect-check">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Code block with a one-click copy button ---------- */
function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for non-secure contexts / older browsers.
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="codewrap">
      <div className="codebar">
        <span className="codelang">{lang}</span>
        <button
          type="button"
          className={`copybtn${copied ? " is-copied" : ""}`}
          onClick={copy}
          aria-live="polite"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre className="codeblock">{code}</pre>
    </div>
  );
}

function Section({
  title,
  desc,
  code,
  wide,
  children,
}: {
  title: string;
  desc?: string;
  /** Optional usage snippet rendered below the demo with a copy button. */
  code?: string;
  /** Span the full row inside a `.grid2`. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "card card-wide" : "card"}>
      <h2>{title}</h2>
      {desc && <p className="desc">{desc}</p>}
      {children}
      {code && <CodeBlock code={code} />}
    </div>
  );
}

/* ---------- Theme-builder playground ---------- */
function Playground() {
  const [page, setPage] = useState(6);
  const [variant, setVariant] = useState("minimal-modern");
  const [size, setSize] = useState<PaginationSize>("md");
  const [shape, setShape] = useState<PaginationShape>("rounded");
  const [animation, setAnimation] = useState<PaginationAnimation>("none");

  // Live theme tokens.
  const [primary, setPrimary] = useState("#2563eb");
  const [onPrimary, setOnPrimary] = useState("#ffffff");
  const [surface, setSurface] = useState("#ffffff");
  const [text, setText] = useState("#0f172a");
  // null = auto: let the variant/shape decide. Set once the slider is dragged.
  const [radius, setRadius] = useState<number | null>(null);
  const [gap, setGap] = useState(6);
  const [gradient, setGradient] = useState(false);
  const [grad2, setGrad2] = useState("#ec4899");

  const theme = {
    primary,
    onPrimary,
    surface,
    text,
    radius: radius === null ? undefined : `${radius}px`,
    gap: `${gap}px`,
    activeBg: gradient ? `linear-gradient(135deg, ${primary}, ${grad2})` : undefined,
  };

  const applyPreset = (c: PaginationColor) => {
    const map: Record<PaginationColor, string> = {
      blue: "#2563eb", purple: "#7c3aed", green: "#16a34a", orange: "#ea580c",
      red: "#dc2626", pink: "#db2777", cyan: "#0891b2", indigo: "#4f46e5",
      emerald: "#059669", gray: "#475569",
    };
    setPrimary(map[c]);
  };

  return (
    <Section title="🎛️ Theme builder" desc="Change colors, gradient, size, shape — the preview updates live.">
      {/* Live preview */}
      <div className="stage stage-preview">
        <Pagination
          currentPage={page}
          totalPages={30}
          onPageChange={setPage}
          variant={variant}
          size={size}
          shape={shape}
          animation={animation}
          theme={theme}
          showFirstLast
          showJumpInput
          showSummary
        />
      </div>
      <p className="count" style={{ textAlign: "center", margin: "8px 0 20px" }}>
        Current page: <b>{page}</b> — click Next/Prev or use ← → · Home · End
      </p>

      {/* Controls */}
      <div className="builder">
        <div className="field">
          <span>Variant</span>
          <Select value={variant} options={PAGINATION_VARIANTS} onChange={setVariant} />
        </div>
        <div className="field">
          <span>Size</span>
          <Select value={size} options={SIZES} onChange={setSize} />
        </div>
        <div className="field">
          <span>Shape</span>
          <Select
            value={shape}
            options={SHAPES}
            onChange={(s) => {
              setShape(s);
              // Shape and an explicit radius fight over border-radius; the
              // last-touched control wins, so reset the slider to auto.
              setRadius(null);
            }}
          />
        </div>
        <div className="field">
          <span>Animation</span>
          <Select value={animation} options={ANIMS} onChange={setAnimation} />
        </div>

        <div className="field">
          <span>Button / active color</span>
          <div className="swatch">
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            <code>{primary}</code>
          </div>
        </div>
        <div className="field">
          <span>Active text color</span>
          <div className="swatch">
            <input type="color" value={onPrimary} onChange={(e) => setOnPrimary(e.target.value)} />
            <code>{onPrimary}</code>
          </div>
        </div>
        <div className="field">
          <span>Button background</span>
          <div className="swatch">
            <input type="color" value={surface} onChange={(e) => setSurface(e.target.value)} />
            <code>{surface}</code>
          </div>
        </div>
        <div className="field">
          <span>Number text color</span>
          <div className="swatch">
            <input type="color" value={text} onChange={(e) => setText(e.target.value)} />
            <code>{text}</code>
          </div>
        </div>

        <div className="field">
          <span>Gradient active
            <input type="checkbox" checked={gradient} onChange={(e) => setGradient(e.target.checked)} style={{ marginLeft: 8 }} />
          </span>
          <div className="swatch" style={{ opacity: gradient ? 1 : 0.4 }}>
            <input type="color" value={grad2} disabled={!gradient} onChange={(e) => setGrad2(e.target.value)} />
            <code>{gradient ? `→ ${grad2}` : "off"}</code>
          </div>
        </div>
        <div className="field">
          <span>Radius · {radius === null ? "auto" : `${radius}px`}</span>
          <input type="range" min={0} max={30} value={radius ?? 10} onChange={(e) => setRadius(+e.target.value)} />
        </div>
        <div className="field">
          <span>Gap · {gap}px</span>
          <input type="range" min={0} max={20} value={gap} onChange={(e) => setGap(+e.target.value)} />
        </div>
        <div className="field">
          <span>Color presets</span>
          <div className="presets">
            {COLORS.map((c) => (
              <button key={c} className="preset-dot" title={c} onClick={() => applyPreset(c)}
                style={{ background: ({
                  blue: "#2563eb", purple: "#7c3aed", green: "#16a34a", orange: "#ea580c",
                  red: "#dc2626", pink: "#db2777", cyan: "#0891b2", indigo: "#4f46e5",
                  emerald: "#059669", gray: "#475569",
                } as Record<string, string>)[c] }} />
            ))}
          </div>
        </div>
      </div>

      {/* Live code */}
      <CodeBlock
        code={`<Pagination
  currentPage={${page}} totalPages={30}
  variant="${variant}" size="${size}" shape="${shape}"${animation !== "none" ? ` animation="${animation}"` : ""}
  theme={{
    primary: "${primary}",${gradient ? `\n    activeBg: "linear-gradient(135deg, ${primary}, ${grad2})",` : ""}
    surface: "${surface}", text: "${text}",
${radius !== null ? `    radius: "${radius}px", ` : "    "}gap: "${gap}px",
  }}
/>`}
      />
    </Section>
  );
}

/* ---------- Feature cards ---------- */
function EllipsisDemo() {
  const dark = useContext(DarkCtx);
  const [p1, setP1] = useState(1);
  const [p2, setP2] = useState(25);
  const [p3, setP3] = useState(50);
  return (
    <Section
      title="… Smart ellipsis logic"
      desc="Boundary + sibling window, no lonely dots. Same engine, three positions."
      code={`<Pagination
  currentPage={page}
  totalPages={50}
  onPageChange={setPage}
  siblingCount={1}   // pages around the current one
  boundaryCount={1}  // pages pinned at each end
  variant="minimal-outline"
/>`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 12 }}>
        <Pagination currentPage={p1} totalPages={50} onPageChange={setP1} variant="minimal-outline" dark={dark} />
        <Pagination currentPage={p2} totalPages={50} onPageChange={setP2} variant="minimal-outline" dark={dark} />
        <Pagination currentPage={p3} totalPages={50} onPageChange={setP3} variant="minimal-outline" dark={dark} />
      </div>
    </Section>
  );
}

function CompactDemo() {
  const dark = useContext(DarkCtx);
  const [page, setPage] = useState(3);
  return (
    <Section
      title="📱 Compact (mobile)"
      desc="Prev / “X of Y” / Next — perfect for small screens."
      code={`<CompactPagination
  currentPage={page}
  totalPages={20}
  onPageChange={setPage}
  variant="mobile-app"
  color="purple"
/>`}
    >
      <div className="stage">
        <CompactPagination currentPage={page} totalPages={20} onPageChange={setPage} variant="mobile-app" color="purple" dark={dark} />
      </div>
    </Section>
  );
}

const DATA = Array.from({ length: 42 }, (_, i) => `Item #${i + 1}`);

function TableDemo() {
  const dark = useContext(DarkCtx);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = DATA.slice((page - 1) * pageSize, page * pageSize);
  return (
    <Section
      title="📊 Table footer"
      desc="Data-grid footer bar: rows-per-page dropdown, range summary, and an editable page box."
      code={`const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<TablePagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={42}
  onPageChange={setPage}
  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
  pageSizeOptions={[10, 25, 50]}
/>`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 0, alignItems: "stretch" }}>
        <ul className="items" style={{ marginBottom: 0 }}>
          {rows.slice(0, 4).map((it) => <li key={it}>{it}</li>)}
        </ul>
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={DATA.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
          dark={dark}
        />
      </div>
    </Section>
  );
}

function LoadMoreDemo() {
  const dark = useContext(DarkCtx);
  const { visible, hasMore, loadMore, count } = useLoadMore({ items: DATA, pageSize: 6 });
  return (
    <Section
      title="⬇️ Load more"
      desc="useLoadMore() slices a local array (or fetches server-side)."
      code={`const { visible, hasMore, loadMore, count } =
  useLoadMore({ items: DATA, pageSize: 6 });

<LoadMorePagination
  hasMore={hasMore}
  onLoadMore={loadMore}
  count={count}
  total={DATA.length}
  variant="gradient-purple"
/>`}
    >
      <div className="stage" style={{ flexDirection: "column" }}>
        <ul className="items">
          {visible.map((it) => <li key={it}>{it}</li>)}
        </ul>
        <LoadMorePagination hasMore={hasMore} onLoadMore={loadMore} count={count} total={DATA.length} variant="gradient-purple" dark={dark} />
      </div>
    </Section>
  );
}

// Fake cursor API over DATA.
async function fakeFetch(cursor: string | undefined): Promise<{ items: string[]; nextCursor?: string | null; prevCursor?: string | null }> {
  const start = cursor ? parseInt(cursor, 10) : 0;
  const pageSize = 5;
  const items = DATA.slice(start, start + pageSize);
  const next = start + pageSize < DATA.length ? String(start + pageSize) : null;
  return new Promise((res) => setTimeout(() => res({ items, nextCursor: next }), 200));
}

function CursorDemo() {
  const { items, loading, hasNext, hasPrev, next, prev, refresh } = useCursorPagination({ fetchPage: fakeFetch });
  useEffect(() => { void refresh(); }, [refresh]);
  return (
    <Section
      title="🔀 Cursor pagination (API)"
      desc="useCursorPagination() tracks a cursor stack so Prev works too."
      code={`const { items, loading, hasNext, hasPrev, next, prev } =
  useCursorPagination({ fetchPage });

<CursorPagination
  hasNext={hasNext}
  hasPrev={hasPrev}
  loading={loading}
  onNext={next}
  onPrev={prev}
  variant="glass-neon"
  dark
/>`}
    >
      <div className="stage" style={{ flexDirection: "column" }}>
        <ul className="items">
          {items.map((it) => <li key={it}>{it}</li>)}
          {loading && <li>Loading…</li>}
        </ul>
        <CursorPagination hasNext={hasNext} hasPrev={hasPrev} loading={loading} onNext={next} onPrev={prev} variant="glass-neon" dark />
      </div>
    </Section>
  );
}

function UrlDemo() {
  const dark = useContext(DarkCtx);
  const { page, setPage } = useUrlPagination({ initialPage: 1 });
  return (
    <Section
      title="🔗 URL sync"
      desc="useUrlPagination() reads/writes ?page= — check the address bar & browser back button."
      code={`const { page, setPage } = useUrlPagination({ initialPage: 1 });

<Pagination
  currentPage={page}
  totalPages={12}
  onPageChange={setPage}
  variant="material"
  color="green"
  showFirstLast
/>`}
    >
      <div className="stage">
        <Pagination currentPage={page} totalPages={12} onPageChange={setPage} variant="material" color="green" showFirstLast dark={dark} />
      </div>
      <p className="count" style={{ textAlign: "center" }}>URL param <code>?page={page}</code></p>
    </Section>
  );
}

function HookDemo() {
  const [page, setPage] = useState(7);
  const { items, startItem, endItem, totalPages } = usePagination({ currentPage: page, totalItems: 235, pageSize: 10 });
  return (
    <Section
      title="🧩 usePagination() headless"
      desc="Bring your own markup — the hook returns the computed range + item window."
      code={`const { items, startItem, endItem, totalPages, hasNext } =
  usePagination({ currentPage: page, totalItems: 235, pageSize: 10 });

// items = [1, "ellipsis", 6, 7, 8, "ellipsis", 24]
// render them with your own buttons / links`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 10 }}>
        <code style={{ fontSize: 13 }}>
          items = [{items.map((i) => (i === "ellipsis" ? "…" : i)).join(", ")}]
        </code>
        <div className="count">Showing items {startItem}–{endItem} of 235 · {totalPages} pages</div>
        <input type="range" min={1} max={totalPages} value={page} onChange={(e) => setPage(+e.target.value)} style={{ width: 260 }} />
      </div>
    </Section>
  );
}

// Fake paged API for the infinite feed: 60 posts, 400ms latency.
const FEED = Array.from({ length: 60 }, (_, i) => `Post #${i + 1}`);
const fetchPosts = (offset: number, size: number) =>
  new Promise<string[]>((res) => setTimeout(() => res(FEED.slice(offset, offset + size)), 400));

function InfiniteDemo() {
  const dark = useContext(DarkCtx);
  // The feed scrolls inside its own box, so that box is the observer's root.
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const { visible, hasMore, loading, loadMore, reset } = useLoadMore({
    fetchMore: fetchPosts,
    total: FEED.length,
    pageSize: 8,
  });
  return (
    <Section
      title="♾️ Infinite scroll"
      desc="Scroll the feed — the next batch loads before you reach the bottom. IntersectionObserver-based, with loading, retry and end states."
      code={`const { visible, hasMore, loading, loadMore } =
  useLoadMore({ fetchMore: fetchPosts, total: 60, pageSize: 8 });

<ul>{visible.map((post) => <li key={post.id}>…</li>)}</ul>
<InfiniteScroll
  hasMore={hasMore}
  loading={loading}
  onLoadMore={loadMore}
/>`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 10 }}>
        <div ref={setBox} className="feed-box">
          <ul className="items">
            {visible.map((it) => <li key={it}>{it}</li>)}
          </ul>
          <InfiniteScroll
            root={box}
            rootMargin="0px 0px 120px 0px"
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
            color="purple"
            dark={dark}
          />
        </div>
        <div className="count">
          {visible.length} of {FEED.length} loaded ·{" "}
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              box?.scrollTo({ top: 0 });
              reset();
            }}
          >
            Start over
          </button>
        </div>
      </div>
    </Section>
  );
}

const SLIDE_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6"];
const DOT_EFFECTS: DotsEffect[] = ["scale", "slide", "line"];

function DotsDemo() {
  const dark = useContext(DarkCtx);
  const [slide, setSlide] = useState(1);
  const [story, setStory] = useState(9);
  const hue = SLIDE_COLORS[slide - 1];
  return (
    <Section
      title="⚪ Dots (carousel)"
      desc="Carousel, slider & onboarding dots with four effects. Long ranges become an Instagram-style window whose edge dots shrink."
      code={`<DotsPagination
  currentPage={slide}
  totalPages={6}
  onPageChange={setSlide}
  effect="expand"   // expand | scale | slide | line
  showPrevNext
/>

// 30 pages → a sliding window of 7 dots
<DotsPagination currentPage={page} totalPages={30} maxDots={7} … />`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="slide" style={{ background: `linear-gradient(135deg, ${hue}, color-mix(in srgb, ${hue} 55%, #0f172a))` }}>
          Slide {slide} / {SLIDE_COLORS.length}
        </div>
        <DotsPagination
          currentPage={slide}
          totalPages={SLIDE_COLORS.length}
          onPageChange={setSlide}
          effect="expand"
          showPrevNext
          color="indigo"
          dark={dark}
          ariaLabel="Slides"
        />
        <div className="dots-rows">
          {DOT_EFFECTS.map((effect) => (
            <div key={effect} className="dots-row">
              <code>{effect}</code>
              <DotsPagination
                currentPage={slide}
                totalPages={SLIDE_COLORS.length}
                onPageChange={setSlide}
                effect={effect}
                color="indigo"
                dark={dark}
                ariaLabel={`Slides (${effect})`}
              />
            </div>
          ))}
          <div className="dots-row">
            <code>30 pages</code>
            <DotsPagination
              currentPage={story}
              totalPages={30}
              onPageChange={setStory}
              color="pink"
              dark={dark}
              ariaLabel="Stories"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

const FRUITS = [
  "Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Coconut", "Date", "Dragon fruit",
  "Elderberry", "Fig", "Grape", "Guava", "Honeydew", "Jackfruit", "Kiwi", "Lemon", "Lime",
  "Mango", "Melon", "Nectarine", "Orange", "Papaya", "Peach", "Pear", "Pineapple", "Plum",
  "Raspberry", "Strawberry", "Tangerine", "Watermelon",
];
const FRUIT_LETTERS = [...new Set(FRUITS.map((f) => f[0]))];

function AlphabetDemo() {
  const dark = useContext(DarkCtx);
  const [letter, setLetter] = useState<string | null>("P");
  const shown = letter ? FRUITS.filter((f) => f.startsWith(letter)) : FRUITS;
  return (
    <Section
      wide
      title="🔤 A–Z index"
      desc="Alphabetical navigation for directories, glossaries and contacts. Empty letters are disabled — and you can type a letter to jump to it. Works with every variant."
      code={`const letters = [...new Set(items.map((i) => i.name[0]))];

<AlphabetPagination
  value={letter}          // null = "All"
  onChange={setLetter}
  available={letters}     // the rest render disabled
  showAll
  size="sm"
  variant="minimal-outline"
/>`}
    >
      <div className="stage" style={{ flexDirection: "column", gap: 12 }}>
        <AlphabetPagination
          value={letter}
          onChange={setLetter}
          available={FRUIT_LETTERS}
          showAll
          size="sm"
          variant="minimal-outline"
          color="emerald"
          dark={dark}
        />
        <div className="count">
          {shown.length} {letter ? `starting with “${letter}”` : "fruits"}
        </div>
        <ul className="items chips">
          {shown.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
    </Section>
  );
}

/* ---------- Live preview modal: try every prop on any variant + copy the code ---------- */
function PreviewModal({ variant: initialVariant, onClose }: { variant: string; onClose: () => void }) {
  const appDark = useContext(DarkCtx);
  const [variant, setVariant] = useState(initialVariant);
  const [page, setPage] = useState(4);
  const [pageSize, setPageSize] = useState(10);
  const [size, setSize] = useState<PaginationSize>("md");
  const [shape, setShape] = useState<PaginationShape>("rounded");
  const [animation, setAnimation] = useState<PaginationAnimation>("none");
  const [dark, setDark] = useState(appDark);
  const [showFirstLast, setShowFirstLast] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showJumpInput, setShowJumpInput] = useState(false);
  // Bar-only toggles.
  const [showTotal, setShowTotal] = useState(true);
  const [showPageSize, setShowPageSize] = useState(true);
  const [showGoto, setShowGoto] = useState(true);
  const [navLabels, setNavLabels] = useState(false);
  // null = use the color preset; a hex string = custom via theme.
  const [customColor, setCustomColor] = useState<string | null>(null); // active background
  const [customText, setCustomText] = useState<string | null>(null); // active text (onPrimary)
  const [customInactive, setCustomInactive] = useState<string | null>(null); // inactive text (text)

  // Table variants render the TablePagination component instead.
  const isTable = variant.startsWith("table-");
  // Bar variants render the BarPagination toolbar.
  const isBar = variant.startsWith("bar-");

  const theme =
    customColor || customText || customInactive
      ? {
          ...(customColor ? { primary: customColor } : {}),
          ...(customText ? { onPrimary: customText } : {}),
          ...(customInactive ? { text: customInactive } : {}),
        }
      : undefined;

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const themeProps = [
    customColor ? `primary: "${customColor}"` : "",
    customText ? `onPrimary: "${customText}"` : "",
    customInactive ? `text: "${customInactive}"` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const themeLine = themeProps ? `\n  theme={{ ${themeProps} }}` : "";

  const code = isBar
    ? `const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<BarPagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={350}
  onPageChange={setPage}
  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
  variant="${variant}"
  size="${size}"${dark ? "\n  dark" : ""}${showTotal ? "\n  showTotal" : ""}${showPageSize ? "\n  showPageSize" : ""}${showFirstLast ? "\n  showFirstLast" : ""}${navLabels ? "\n  navLabels" : ""}${showGoto ? "\n  showGoto" : ""}${themeLine}
/>`
    : isTable
    ? `const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<TablePagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={65}
  onPageChange={setPage}
  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
  variant="${variant}"
  size="${size}"${dark ? "\n  dark" : ""}${themeLine}
/>`
    : `const [page, setPage] = useState(1);

<Pagination
  currentPage={page}
  totalPages={30}
  onPageChange={setPage}
  variant="${variant}"
  size="${size}"
  shape="${shape}"${animation !== "none" ? `\n  animation="${animation}"` : ""}${dark ? "\n  dark" : ""}${showFirstLast ? "\n  showFirstLast" : ""}${showSummary ? "\n  showSummary" : ""}${showJumpInput ? "\n  showJumpInput" : ""}${themeLine}
/>`;

  // Render into <body> via a portal so no parent's overflow/transform/stacking
  // context can clip or hide the modal.
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>
            <span className="modal-mark" aria-hidden="true">👁</span>
            Live preview <code>{variant}</code>
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close preview">
            ✕
          </button>
        </div>
        <p className="desc">
          Props badlo — preview aur code live update honge. Neeche se code copy karke seedha use karo.
        </p>

        {/* Live stage */}
        <div className={`stage stage-preview${dark ? " stage-dark" : ""}`}>
          {isBar ? (
            <BarPagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={350}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              variant={variant}
              size={size}
              dark={dark}
              showTotal={showTotal}
              showPageSize={showPageSize}
              showFirstLast={showFirstLast}
              navLabels={navLabels}
              showGoto={showGoto}
              theme={theme}
            />
          ) : isTable ? (
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={65}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              variant={variant}
              size={size}
              dark={dark}
              theme={theme}
            />
          ) : (
            <Pagination
              currentPage={page}
              totalPages={30}
              onPageChange={setPage}
              variant={variant}
              size={size}
              shape={shape}
              animation={animation}
              dark={dark}
              showFirstLast={showFirstLast}
              showSummary={showSummary}
              showJumpInput={showJumpInput}
              theme={theme}
            />
          )}
        </div>

        {/* ⚙️ Props panel: selects + toggle chips */}
        <div className="modal-panel">
          <div className="panel-title">⚙️ Props</div>
          <div className="builder">
            <div className="field">
              <span>variant</span>
              <Select value={variant} options={PAGINATION_VARIANTS} onChange={setVariant} />
            </div>
            <div className="field">
              <span>size</span>
              <Select value={size} options={SIZES} onChange={setSize} />
            </div>
            {!isTable && !isBar && (
              <>
                <div className="field">
                  <span>shape</span>
                  <Select value={shape} options={SHAPES} onChange={setShape} />
                </div>
                <div className="field">
                  <span>animation</span>
                  <Select value={animation} options={ANIMS} onChange={setAnimation} />
                </div>
              </>
            )}
          </div>
          <div className="chips">
            <button
              type="button"
              className={`chip${dark ? " is-on" : ""}`}
              aria-pressed={dark}
              onClick={() => setDark((d) => !d)}
            >
              🌙 dark
            </button>
            {isBar && (
              <>
                <button
                  type="button"
                  className={`chip${showTotal ? " is-on" : ""}`}
                  aria-pressed={showTotal}
                  onClick={() => setShowTotal((v) => !v)}
                >
                  📊 showTotal
                </button>
                <button
                  type="button"
                  className={`chip${showPageSize ? " is-on" : ""}`}
                  aria-pressed={showPageSize}
                  onClick={() => setShowPageSize((v) => !v)}
                >
                  ▾ showPageSize
                </button>
                <button
                  type="button"
                  className={`chip${showFirstLast ? " is-on" : ""}`}
                  aria-pressed={showFirstLast}
                  onClick={() => setShowFirstLast((v) => !v)}
                >
                  « showFirstLast »
                </button>
                <button
                  type="button"
                  className={`chip${navLabels ? " is-on" : ""}`}
                  aria-pressed={navLabels}
                  onClick={() => setNavLabels((v) => !v)}
                >
                  🔤 navLabels
                </button>
                <button
                  type="button"
                  className={`chip${showGoto ? " is-on" : ""}`}
                  aria-pressed={showGoto}
                  onClick={() => setShowGoto((v) => !v)}
                >
                  ⤴ showGoto
                </button>
              </>
            )}
            {!isTable && !isBar && (
              <>
                <button
                  type="button"
                  className={`chip${showFirstLast ? " is-on" : ""}`}
                  aria-pressed={showFirstLast}
                  onClick={() => setShowFirstLast((v) => !v)}
                >
                  « showFirstLast »
                </button>
                <button
                  type="button"
                  className={`chip${showSummary ? " is-on" : ""}`}
                  aria-pressed={showSummary}
                  onClick={() => setShowSummary((v) => !v)}
                >
                  📄 showSummary
                </button>
                <button
                  type="button"
                  className={`chip${showJumpInput ? " is-on" : ""}`}
                  aria-pressed={showJumpInput}
                  onClick={() => setShowJumpInput((v) => !v)}
                >
                  ⤴ showJumpInput
                </button>
              </>
            )}
          </div>
        </div>

        {/* 🎨 Colors panel */}
        <div className="modal-panel">
        <div className="panel-title">🎨 Colors</div>
        {/* Custom active background color (theme.primary) */}
        <div className="colorpick">
          <span className="colorpick-label">Active bg</span>
          <div className="colorpick-dots">
            {COLOR_HEX.map(([name, hex]) => (
              <button
                key={name}
                type="button"
                title={name}
                className={`colordot${customColor === hex ? " is-on" : ""}`}
                style={{ background: hex }}
                onClick={() => setCustomColor(hex)}
              />
            ))}
            <label className="colordot colordot-custom" title="Custom background">
              🎨
              <input
                type="color"
                value={customColor ?? "#2563eb"}
                onChange={(e) => setCustomColor(e.target.value)}
              />
            </label>
            {customColor && (
              <button type="button" className="colorpick-reset" onClick={() => setCustomColor(null)}>
                reset
              </button>
            )}
          </div>
        </div>

        {/* Custom active text color (theme.onPrimary) */}
        <div className="colorpick">
          <span className="colorpick-label">Active text</span>
          <div className="colorpick-dots">
            {TEXT_HEX.map(([name, hex]) => (
              <button
                key={name}
                type="button"
                title={name}
                className={`colordot${customText === hex ? " is-on" : ""}`}
                style={{ background: hex }}
                onClick={() => setCustomText(hex)}
              />
            ))}
            <label className="colordot colordot-custom" title="Custom text color">
              🎨
              <input
                type="color"
                value={customText ?? "#ffffff"}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </label>
            {customText && (
              <button type="button" className="colorpick-reset" onClick={() => setCustomText(null)}>
                reset
              </button>
            )}
          </div>
        </div>

        {/* Custom inactive text color (theme.text) — the non-active page numbers */}
        <div className="colorpick">
          <span className="colorpick-label">Inactive text</span>
          <div className="colorpick-dots">
            {INACTIVE_HEX.map(([name, hex]) => (
              <button
                key={name}
                type="button"
                title={name}
                className={`colordot${customInactive === hex ? " is-on" : ""}`}
                style={{ background: hex }}
                onClick={() => setCustomInactive(hex)}
              />
            ))}
            <label className="colordot colordot-custom" title="Custom inactive text color">
              🎨
              <input
                type="color"
                value={customInactive ?? "#0f172a"}
                onChange={(e) => setCustomInactive(e.target.value)}
              />
            </label>
            {customInactive && (
              <button
                type="button"
                className="colorpick-reset"
                onClick={() => setCustomInactive(null)}
              >
                reset
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Copy-ready code with the exact props above */}
        <CodeBlock code={code} />
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Full variant gallery (110+) ---------- */
function Gallery() {
  const dark = useContext(DarkCtx);
  const [page, setPage] = useState(4);
  const [filter, setFilter] = useState<string>("all");
  const [preview, setPreview] = useState<string | null>(null);
  const collections = useMemo(() => {
    const all = Object.entries(VARIANT_COLLECTIONS);
    return filter === "all" ? all : all.filter(([name]) => name === filter);
  }, [filter]);
  return (
    <Section title={`🎨 All ${PAGINATION_VARIANTS.length} variants`} desc="One shared page state — every variant reacts. Pick a collection to filter.">
      <div className="tabs" style={{ justifyContent: "flex-start", marginBottom: 4 }}>
        {["all", ...Object.keys(VARIANT_COLLECTIONS)].map((name) => (
          <button
            key={name}
            type="button"
            className={`tab tab-sm${filter === name ? " is-active" : ""}`}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {collections.map(([name, variants]) => (
        <div key={name}>
          <div className="collection-title">{name} · {variants.length}</div>
          <div className="gallery">
            {variants.map((v) => (
              <div className="tile" key={v}>
                <div className="tile-head">
                  <div className="name">{v}</div>
                  <button
                    type="button"
                    className="preview-btn"
                    onClick={() => setPreview(v)}
                    title={`Preview ${v} with all props`}
                  >
                    👁 Preview
                  </button>
                </div>
                <div className="stage">
                  {name === "bar" ? (
                    <BarPagination
                      currentPage={page}
                      pageSize={10}
                      totalItems={350}
                      onPageChange={setPage}
                      variant={v}
                      size="sm"
                      dark={dark}
                      showTotal
                      showPageSize
                      showGoto
                    />
                  ) : name === "table" ? (
                    <TablePagination
                      currentPage={page}
                      pageSize={10}
                      totalItems={65}
                      onPageChange={setPage}
                      variant={v}
                      size="sm"
                      dark={dark}
                    />
                  ) : (
                    <Pagination
                      currentPage={page}
                      totalPages={7}
                      onPageChange={setPage}
                      variant={v}
                      size="sm"
                      siblingCount={0}
                      dark={dark || (name === "glass" && v.includes("dark"))}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {preview && <PreviewModal variant={preview} onClose={() => setPreview(null)} />}
    </Section>
  );
}

/* ---------- 💻 How-to-use code guide (each snippet has a copy button) ---------- */
const USAGE_SNIPPETS: { title: string; desc: string; lang?: string; code: string }[] = [
  {
    title: "1. Install",
    desc: "Add the package to your project.",
    lang: "bash",
    code: "npm install react-next-pagination-pro",
  },
  {
    title: "2. Import components + styles (styles only once)",
    desc: "Import the CSS a single time — e.g. in main.tsx / App.tsx / layout.tsx.",
    code: `import { Pagination, TablePagination } from "react-next-pagination-pro";
import "react-next-pagination-pro/styles.css";`,
  },
  {
    title: "3. Basic pagination",
    desc: "Keep the page in state, pass it in, update it in onPageChange. Done.",
    code: `import { useState } from "react";
import { Pagination } from "react-next-pagination-pro";
import "react-next-pagination-pro/styles.css";

function ProductList() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      currentPage={page}
      totalPages={20}
      onPageChange={setPage}
    />
  );
}`,
  },
  {
    title: "4. Table footer pagination (data-grid style)",
    desc: "Rows-per-page dropdown + \"1 - 10 / 42\" range + editable \"1 OF 5\" page box.",
    code: `const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<TablePagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={42}
  onPageChange={setPage}
  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
  pageSizeOptions={[10, 25, 50, 100]}
/>`,
  },
  {
    title: "5. Pick a design — 130 built-in variants",
    desc: "Just change the variant name. Combine with color / size / shape / animation.",
    code: `<Pagination variant="glass-neon" dark ... />
<Pagination variant="gradient-purple" ... />
<Pagination variant="segmented" ... />
<Pagination variant="brutalist" color="orange" ... />
<TablePagination variant="table-mui" ... />

// color:  blue | purple | green | orange | red | pink | ...
// size:   sm | md | lg
// shape:  rounded | pill | square | circle
// animation: fade | scale | bounce | slide | flip | ...`,
  },
  {
    title: "6. Custom theme (your brand colors)",
    desc: "Override any design token inline — solid colors or gradients.",
    code: `<Pagination
  currentPage={page}
  totalPages={30}
  onPageChange={setPage}
  theme={{
    primary: "#7c3aed",
    activeBg: "linear-gradient(135deg, #7c3aed, #ec4899)",
    radius: "12px",
    gap: "8px",
  }}
/>`,
  },
  {
    title: "7. Headless — bring your own UI",
    desc: "usePagination() gives you the computed page range; render anything you like.",
    code: `import { usePagination, ELLIPSIS } from "react-next-pagination-pro";

const { items, hasPrev, hasNext, startItem, endItem } = usePagination({
  currentPage: page,
  totalItems: 235,
  pageSize: 10,
});

return (
  <div>
    {items.map((item, i) =>
      item === ELLIPSIS
        ? <span key={i}>…</span>
        : <button key={item} onClick={() => setPage(item)}>{item}</button>
    )}
  </div>
);`,
  },
  {
    title: "8. Infinite scroll",
    desc: "Put <InfiniteScroll /> after your list — it loads the next batch as it scrolls into view.",
    code: `import { InfiniteScroll, useLoadMore } from "react-next-pagination-pro";

const { visible, hasMore, loading, loadMore } = useLoadMore({
  fetchMore: (offset, size) => fetch(\`/api/posts?offset=\${offset}&limit=\${size}\`).then((r) => r.json()),
  total: 500,
  pageSize: 20,
});

return (
  <>
    {visible.map((post) => <PostCard key={post.id} post={post} />)}
    <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
  </>
);`,
  },
  {
    title: "9. Carousel dots & A–Z index",
    desc: "Dots for sliders / onboarding; a letter bar for directories and glossaries.",
    code: `import { DotsPagination, AlphabetPagination } from "react-next-pagination-pro";

<DotsPagination currentPage={slide} totalPages={5} onPageChange={setSlide} effect="expand" />

<AlphabetPagination value={letter} onChange={setLetter} available={["A", "B", "M"]} showAll />`,
  },
];

function UsageGuide() {
  return (
    <Section
      title="💻 How to use — copy & paste"
      desc="Step-by-step usage. Har snippet ke right-top par Copy button hai."
    >
      {USAGE_SNIPPETS.map((s) => (
        <div className="snippet" key={s.title}>
          <h3>{s.title}</h3>
          <p className="desc">{s.desc}</p>
          <CodeBlock code={s.code} lang={s.lang} />
        </div>
      ))}
    </Section>
  );
}

/* ---------- Section tabs ---------- */
const TABS = [
  { id: "all", label: "✨ All" },
  { id: "playground", label: "🎛️ Playground" },
  { id: "table", label: "📊 Table" },
  { id: "ellipsis", label: "… Ellipsis" },
  { id: "compact", label: "📱 Compact" },
  { id: "dots", label: "⚪ Dots" },
  { id: "alpha", label: "🔤 A–Z" },
  { id: "loadmore", label: "⬇️ Load more" },
  { id: "infinite", label: "♾️ Infinite" },
  { id: "cursor", label: "🔀 Cursor" },
  { id: "url", label: "🔗 URL sync" },
  { id: "hook", label: "🧩 Hook" },
  { id: "gallery", label: "🎨 Gallery" },
  { id: "code", label: "💻 Code" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ---------- Scroll-to-top floating button ---------- */
function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="scrolltop"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function App() {
  // Follow the OS/browser theme on load and whenever it changes; a manual
  // toggle pins the choice for the rest of the session (null = still auto).
  const systemDark = useSystemDark();
  const [override, setOverride] = useState<boolean | null>(null);
  const dark = override ?? systemDark;
  const setDark = (next: boolean | ((d: boolean) => boolean)) =>
    setOverride(typeof next === "function" ? next(dark) : next);

  const [tab, setTab] = useState<TabId>("all");
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  // On phones the tab bar is one swipeable row; keep the active tab in view
  // (e.g. after the hero's "Browse variants" jumps to the last tabs).
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = tabsRef.current;
    const active = bar?.querySelector<HTMLElement>(".tab.is-active");
    if (!bar || !active || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollTo({ left: active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [tab]);

  // "all" shows everything; any other tab shows only that section.
  const show = (id: TabId) => tab === "all" || tab === id;

  const changeTab = (id: TabId) => {
    setTab(id);
    // Jump back to the top of the content when switching sections.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DarkCtx.Provider value={dark}>
      <ComingSoonProvider>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">⏭</span>
            <span className="brand-name">react-next-pagination-pro</span>
          </a>
          <nav className="site-links" aria-label="Resources">
            <SiteLink url={LINKS.npm} label="npm package" className="site-link-npm">
              <BrandIcon name="npm" /> <span className="site-link-label">npm</span>
            </SiteLink>
            <SiteLink url={LINKS.github} label="GitHub repo">
              <BrandIcon name="github" /> <span className="site-link-label">GitHub</span>
            </SiteLink>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      </header>

      <div className="wrap" id="top">
        <div className="hero">
          <span className="badge">{PAGINATION_VARIANTS.length}+ variants · v{version}</span>
          <h1>The ultimate React pagination</h1>
          <p>
            {PAGINATION_VARIANTS.length}+ UI variants · headless hooks · infinite scroll · cursor / load-more /
            URL sync · carousel dots · A–Z index · keyboard &amp; ARIA accessible · dark mode · RTL · TypeScript.
            Everything below is live.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => changeTab("gallery")}>🎨 Browse variants</button>
            <button className="btn-ghost" onClick={() => changeTab("code")}>💻 How to use</button>
          </div>
        </div>

        <div ref={tabsRef} className="tabs tabs-sticky" role="tablist" aria-label="Demo sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`tab${tab === t.id ? " is-active" : ""}`}
              onClick={() => changeTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {show("playground") && <Playground />}

        <div className="grid2">
          {show("ellipsis") && <EllipsisDemo />}
          {show("table") && <TableDemo />}
          {show("compact") && <CompactDemo />}
          {show("dots") && <DotsDemo />}
          {show("loadmore") && <LoadMoreDemo />}
          {show("infinite") && <InfiniteDemo />}
          {show("cursor") && <CursorDemo />}
          {show("url") && <UrlDemo />}
          {show("hook") && <HookDemo />}
          {show("alpha") && <AlphabetDemo />}
        </div>

        {show("gallery") && <Gallery />}
        {show("code") && <UsageGuide />}
      </div>

      <SiteFooter variantCount={PAGINATION_VARIANTS.length} />

      <ScrollTop />
      </ComingSoonProvider>
    </DarkCtx.Provider>
  );
}

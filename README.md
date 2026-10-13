# react-next-pagination-pro

**[Live demo](https://rreact-pagination.netlify.app/)** · [npm](https://www.npmjs.com/package/react-next-pagination-pro) · [GitHub](https://github.com/yogeshgabani/react-pagination-pro)

> The ultimate all-in-one React pagination package — **130+ UI variants**, headless hooks, cursor / load-more / URL-sync, full keyboard & ARIA accessibility, dark mode, RTL, and first-class TypeScript. Works with React 18/19, Next.js (App & Pages Router), Vite, CRA, Remix, Gatsby — SSR & CSR.

## Install

```bash
npm i react-next-pagination-pro
```

```tsx
import { Pagination } from "react-next-pagination-pro";
import "react-next-pagination-pro/styles.css"; // once, in your app root
```

## Quick start

```tsx
import { useState } from "react";
import { Pagination } from "react-next-pagination-pro";
import "react-next-pagination-pro/styles.css";

export default function Example() {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      currentPage={page}
      totalPages={50}
      onPageChange={setPage}
      variant="glass-premium"
      color="indigo"
      showFirstLast
      showJumpInput
    />
  );
}
```

## Components

| Component | Use case |
| --- | --- |
| `<Pagination />` | Full-featured: first/prev/next/last, numbers + ellipsis, jump input, summary |
| `<TablePagination />` | Data-grid footer: rows-per-page dropdown, "1–10 / 42" range, editable page box |
| `<BarPagination />` | Toolbar / footer **bar**: range summary + rows-per-page + numbers + "Go to page" input, in one responsive row |
| `<CompactPagination />` | Mobile "‹ 5 of 50 ›" control |
| `<LoadMorePagination />` | "Load more" button with loading / done states |
| `<CursorPagination />` | Prev/Next for cursor-based APIs (unknown totals) |

### `<BarPagination />` — toolbar footer

Every piece is a toggle, so one component reproduces the common data-table footer
layouts (summary + page-size on one side, numbers + go-to on the other):

```tsx
import { useState } from "react";
import { BarPagination } from "react-next-pagination-pro";

function TableFooter() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <BarPagination
      currentPage={page}
      pageSize={pageSize}
      totalItems={350}
      onPageChange={setPage}
      onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      variant="bar-clean"      // bar-clean | bar-bordered | bar-pill | bar-minimal | bar-soft | bar-dark
      showTotal                // "1 - 10 / 350"  (totalFormat="range" | "showing" | "page")
      showPageSize             // rows-per-page dropdown
      showGoto                 // "Go to page [ ] Go"
      navLabels                // "‹ Previous" / "Next ›" text buttons
      layout="split"           // split | spread | center | end
    />
  );
}
```

## Hooks (headless — bring your own markup)

| Hook | Returns |
| --- | --- |
| `usePagination()` | computed `items` (pages + ellipsis), flags, item window |
| `useLoadMore()` | `visible`, `hasMore`, `loadMore()` (client array **or** server `fetchMore`) |
| `useCursorPagination()` | `items`, `next()`, `prev()`, `hasNext/hasPrev` with a cursor stack |
| `useUrlPagination()` | two-way `?page=` sync (History API or your router's `navigate`) |

```tsx
const { items, startItem, endItem } = usePagination({
  currentPage: page,
  totalItems: 2350,
  pageSize: 25,
});
```

## 130+ variants

Every variant is a CSS class you select with the `variant` prop — preview them all
in the [live demo](https://rreact-pagination.netlify.app/). Grouped into
collections — import `VARIANT_COLLECTIONS` / `PAGINATION_VARIANTS` to enumerate them:

`minimal` · `modern` (material, fluent, apple…) · `glass` · `soft` (neumorphism) ·
`gradient` · `professional` · `premium` · `animated` · `social` · `ecommerce` · `mobile`

```tsx
import { PAGINATION_VARIANTS, VARIANT_COLLECTIONS } from "react-next-pagination-pro";
```

## Theming

Presets **and** runtime token overrides:

```tsx
<Pagination
  currentPage={page}
  totalPages={20}
  color="emerald"      // 10 color presets
  size="lg"            // sm | md | lg
  shape="pill"         // rounded | pill | square | circle
  animation="bounce"   // fade | scale | slide | flip | pulse | elastic | ripple
  dark="auto"          // "auto" (default) follows the OS · true / false to force
  rtl                  // right-to-left
  theme={{ primary: "#2563eb", radius: "14px", gap: "8px" }}
/>
```

## Dark mode

**Zero config — it just works.** By default (`dark="auto"`) every component reads
the visitor's `prefers-color-scheme` and renders light or dark to match their OS,
switching live if they change their system theme. This is exactly what you see in
the [live demo](https://rreact-pagination.netlify.app/), and what you'll get on install:

```tsx
<Pagination currentPage={page} totalPages={50} onPageChange={setPage} />
// ^ light on a light OS, dark on a dark OS — automatically
```

Need to pin a theme (e.g. your app has its own toggle)? Pass an explicit boolean:

```tsx
<Pagination /* … */ dark={isDark} />   // true = always dark, false = always light
```

Wiring your own toggle? The same system-preference hook the library uses is exported:

```tsx
import { useSystemDark } from "react-next-pagination-pro";
const systemDark = useSystemDark(); // boolean, updates on OS theme change
```

## Accessibility

- `<nav aria-label>` landmark, `aria-current="page"` on the active page.
- Full keyboard nav: **← →** (RTL-aware), **Home**, **End**, **Enter** to jump.
- Visible focus rings, disabled-state semantics, screen-reader labels (overridable via `labels`).
- Respects `prefers-reduced-motion`.

## Next.js

Components are client components (they use hooks). In the App Router either add
`"use client"` in the file that renders them, or import into an existing client component.
`useUrlPagination` accepts a `navigate` callback so you can defer to the Next router:

```tsx
const router = useRouter();
const { page, setPage } = useUrlPagination({
  navigate: (url) => router.push(url),
});
```

## Live demo

**https://rreact-pagination.netlify.app/** — every component and all variants,
in light & dark. To run it locally:

```bash
npm install
npm run demo      # Vite dev server with every component & all variants
```

The demo site is configured through `demo/.env` (copy `demo/.env.example`):

| Variable | Purpose |
| --- | --- |
| `VITE_GITHUB_URL`, `VITE_NPM_URL`, `VITE_AUTHOR_URL` | Header / footer links |
| `VITE_WHATSAPP_URL`, `VITE_INSTAGRAM_URL`, `VITE_FACEBOOK_URL`, `VITE_YOUTUBE_URL`, `VITE_X_URL`, `VITE_LINKEDIN_URL` | Social row |
| `VITE_AUTHOR_NAME` | "Built by" name |
| `VITE_COUNTER_NAMESPACE` | Turns the live hit/visitor counters on |
| `VITE_COUNTER_API` | Counter backend (default [Abacus](https://abacus.jasoncameron.dev) — free, no signup, no PII) |
| `VITE_LAST_UPDATED` | Pins "Last updated"; otherwise it's stamped at build time |

Any link left blank opens a **"Coming soon"** dialog instead of dead-ending.
The footer's **Total hits** counts every page view and **Total visitors** counts
once per browser (remembered in `localStorage`). Every visit counts, local dev
included — point `VITE_COUNTER_NAMESPACE` at a throwaway namespace while
developing if you want to keep the real numbers clean.

## Develop / build / test

```bash
npm run build      # tsup → ESM + CJS + .d.ts + styles.css
npm run typecheck  # tsc --noEmit
npm test           # vitest (range logic + component a11y)
```

## License

MIT

# Changelog

## 0.2.0

### New

- **`<InfiniteScroll />` + `useInfiniteScroll()`** — load the next batch as the user
  scrolls. IntersectionObserver-based, fills the viewport, supports a custom scroll
  container (`root`) and trigger distance (`rootMargin`), and shows loading, end and
  error/**Retry** states. A failed load pauses instead of retrying in a loop.
- **`<DotsPagination />`** — carousel / slider / onboarding dots with four effects
  (`expand`, `scale`, `slide`, `line`) and an Instagram-style shrinking window for
  long ranges (`maxDots`). Keyboard focus follows the active dot.
- **`<AlphabetPagination />`** — A–Z index for directories and glossaries. Empty
  letters are disabled and skipped by the arrow keys; typing a letter jumps to it.
  Works with every variant. Exports `ALPHABET`.

### Docs

- README: live-demo preview, "Why this one?", migration guide from react-paginate.
- Live demo moved to https://react-next-pagination.netlify.app/.

## 0.1.1

### Fixed

- Ship the `"use client"` directive in the bundle, so components work in the
  Next.js App Router without a wrapper.
- `<BarPagination />`: the "Go to page" input and **Go** button wrap together on
  narrow bars instead of stranding **Go** on its own line.

### Docs

- Added the live demo, npm and GitHub links (`homepage`, `repository`, `bugs`).

## 0.1.0

- Initial release.

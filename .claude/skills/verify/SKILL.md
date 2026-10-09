---
name: verify
description: Build, run and drive the react-next-pagination-pro demo site to observe a change working end-to-end (library components, demo UI, footer, theming).
---

# Verifying react-next-pagination-pro

Single package: the library lives in `src/`, the showcase site in `demo/`.
The surface for almost every change is **the demo site in a browser**.

## Key fact: the demo runs the library from source

`vite.config.ts` aliases `react-next-pagination-pro` → `src/index.ts` and
`react-next-pagination-pro/styles.css` → `src/styles/pagination.css`.

**You do not need `npm run build` to see a `src/` change in the demo.** Vite
HMR picks up both TSX and CSS edits immediately. Only build (`npm run build`,
tsup → `dist/`) when verifying the *packaged* output itself.

## Launch

```bash
npm run demo          # vite dev server, port 5188 (root: "demo")
curl -s -o /dev/null -w "%{http_code}" http://localhost:5188/   # expect 200
```

Run it with `run_in_background: true`; it never exits on its own.

## Drive it with Playwright

Playwright is **not** a dependency. Install it ad hoc:

```bash
npm i -D playwright --no-save
npx playwright install chromium
```

**Gotcha:** run your script from the project root (`node verify-tmp.mjs`), not
from the scratchpad — `playwright` resolves out of the project `node_modules`
and `ERR_MODULE_NOT_FOUND`s from anywhere else. Delete the temp script after.

Useful selectors: `.fcard` (footer card), `.fstat-value`, `.soon-overlay` /
`[role="dialog"][aria-label="Coming soon"]`, `.theme-toggle`, `nav.rpp`
(every pagination instance), `.rpp-dark`, `.tile` + `.preview-btn` (gallery).

## Theming — emulate the OS, don't click

`dark` defaults to `"auto"` (`src/hooks/useSystemDark.ts`) and the demo's own
theme follows `useSystemDark()` until the user clicks the toggle. So verify it
by loading a **fresh context per scheme** and asserting *without* interacting:

```js
const ctx = await browser.newContext({ colorScheme: "dark" });  // or "light"
// expect: document.body.classList.contains("dark") === true
// expect: every `nav.rpp` also carries `.rpp-dark`
```

Note ~2 of the ~144 gallery paginations stay dark under a light OS on purpose —
variants whose *name* contains "dark" (e.g. `glass-dark`) force it.

## Env-driven links (`demo/.env`)

Footer/header URLs come from `demo/.env` (see `.env.example`). A blank value
renders a "Coming soon" button instead of an `<a>`.

**Gotcha: Vite does not hot-reload `.env` — restart the dev server** after
editing it. To verify the configured path, back the file up, set values,
restart, observe, then restore:

```bash
cp demo/.env demo/.env.bak
# …edit, restart server, drive…
mv demo/.env.bak demo/.env      # always restore
```

## Footer counters

`useSiteStats.ts` counts hits/visitors via Abacus, on **every** visit including
dev. **Point `VITE_COUNTER_NAMESPACE` at a throwaway namespace before driving
the site, and restore it after** — otherwise your verification inflates the real
counter. Restart the dev server for the change to take (Vite won't reload
`.env`).

Prove the dedupe with three visits: new browser context (hits+1, visitors+1) →
`reload()` of the *same* context (hits+1, visitors unchanged, via the
`rpp:visited` localStorage key) → a second fresh context (both +1).

**Abacus gotcha:** `GET /get/<ns>/<key>` **404s** (`{"error":"Key not found"}`)
until something has `hit` that key — it isn't an error, it means zero. The hook
maps 404→0; a regression here strands the cards on "—" forever, because only
`hit` creates the key.

**npm downloads card** (`useNpmDownloads.ts`) reads api.npmjs.org — read-only,
so no throwaway namespace needed. The API caps a query at 18 months and
*silently clamps* longer ranges (no error), so the hook sums back-to-back
540-day windows until one returns `downloads: 0`. Expect exactly two requests
for a package younger than 18 months; four means StrictMode de-dupe broke.

## Open Graph card

`scripts/og-image.ts` (Satori → resvg, 1200×630) + `scripts/vite-plugin-og.ts`.
Neither is in tsconfig's `include` (same as vite.config.ts) — `test/ogImage.test.ts`
is what exercises them. Preview in dev at `http://localhost:5188/og-image.png`;
editing the template restarts the dev server (it's a config dependency).

Build with a fake Netlify URL to check the tags come out absolute:

```bash
URL=https://x.netlify.app CONTEXT=production npm run demo:build
grep -o '<meta property="og:image"[^>]*>' demo/dist/index.html   # absolute, ?v=<hash>
```

Satori is pinned exactly (it shipped ~15 releases in one week of Oct 2026) and
reads only TTF/OTF/**WOFF** — not woff2.

**Look at the PNG after any satori / fflate change** — `ogImage.test.ts` only
checks dimensions, so a card where every glyph renders as a "NO GLYPH" box
still passes. `package.json` overrides fflate to `~0.7.5` (patched backport of
an `npm audit` advisory; satori pins the vulnerable 0.7.3). Don't move it to
0.8: its `inflateSync` signature changed and every glyph breaks exactly that way.

To verify the packaged build rather than dev:

```bash
npm run demo:build
npx vite preview --port 4173     # NOT --outDir demo/dist: outDir resolves
                                 # against root:"demo", so that looks for demo/demo/dist
```

"Last updated" is `__BUILD_DATE__`, injected by `define` in vite.config.ts
(mirrored in vitest.config.ts so tests can render the footer).

## Flows worth driving

- **Gallery + preview modal** — click `.preview-btn`, toggle chips/colors,
  confirm the generated code block matches the live preview.
- **Coming soon dialog** — close via "Got it", backdrop click, **and Escape**
  (Escape regressed once; it's handled in `ComingSoonProvider`).
- **Manual theme toggle** — must override the emulated OS scheme.
- **Active page contrast** — variants that set a light `.rpp-item` background
  out-specify the base `.rpp-active` rule; the active number has repeatedly
  gone white-on-white. Eyeball the gallery in *both* schemes after CSS edits.
  Same trap for filled buttons (`.rpp-goto-btn`, jump, load-more): check them
  **hovered** too — the generic `.rpp-item:hover…` is (0,4,0), so a filled
  button's own hover needs the `.rpp-item.rpp-x-btn:hover` doubling.
- **Bar variants on a phone** — at 320/375px, assert nothing inside
  `nav.rpp-bar` paints outside its box. The narrow layout is a container
  query (≤520px); it must stay `flex-wrap: nowrap` + `align-items: stretch`,
  because a *wrapping* column flexbox doesn't cap item width and the page
  list / Go spill out.

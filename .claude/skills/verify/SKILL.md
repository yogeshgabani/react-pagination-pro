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

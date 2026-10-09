import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

/**
 * Renders the demo site's Open Graph card (the image WhatsApp, X, LinkedIn,
 * Slack, Facebook … show when the link is shared) as a 1200×630 PNG.
 *
 * Satori lays the card out from a tiny HTML/CSS tree into SVG, then resvg
 * rasterises it. No browser and no network: the font ships with
 * @fontsource/inter (as .woff — Satori can't read .woff2).
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgCard {
  /** Shown as "136+ UI variants" — pass the live catalog size. */
  variantCount: number;
  /** Package version, e.g. "0.1.0". */
  version: string;
}

const require = createRequire(import.meta.url);
const inter = (weight: 400 | 600 | 800) => ({
  name: "Inter",
  weight,
  style: "normal" as const,
  data: readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`)),
});

/* Satori takes React-element-shaped objects, so a 3-line `h` keeps the
   template readable without dragging JSX into the Vite config. */
type Style = Record<string, string | number>;
type Child = El | string;
type El = { type: string; props: { style: Style; children?: Child[] } };
const h = (style: Style, ...children: Child[]): El => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

// Same palette as the demo's dark theme (demo/src/demo.css).
const C = {
  bg: "#070b16",
  card: "#111a2e",
  line: "#22304d",
  ink: "#e6edf7",
  sub: "#94a3b8",
  brand: "#3b82f6",
  violet: "#a855f7",
  sky: "#38bdf8",
};

/** The three-dot mark from the footer brand card, scaled up. */
const logo = () =>
  h(
    {
      width: 64, height: 64, borderRadius: 18, gap: 6,
      alignItems: "center", justifyContent: "center",
      background: "rgba(59,130,246,0.16)",
    },
    ...[C.brand, C.violet, C.sky].map((c) => h({ width: 9, height: 9, borderRadius: 9, background: c })),
  );

/** A pagination row — what the library is, in one glance. */
const pager = () =>
  h(
    { gap: 10 },
    ...["‹", "1", "2", "3", "4", "5", "…", "12", "›"].map((label) => {
      const active = label === "3";
      return h(
        {
          width: 54, height: 54, borderRadius: 14,
          alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 600,
          ...(active
            ? {
                color: "#fff",
                backgroundImage: `linear-gradient(135deg, ${C.brand}, #7c3aed)`,
                boxShadow: "0 12px 30px rgba(59,130,246,0.45)",
              }
            : { color: C.sub, background: C.card, border: `1px solid ${C.line}` }),
        },
        label,
      );
    }),
  );

const template = ({ variantCount, version }: OgCard) =>
  h(
    {
      width: OG_WIDTH, height: OG_HEIGHT, padding: "64px 80px",
      flexDirection: "column", justifyContent: "space-between",
      fontFamily: "Inter", color: C.ink, backgroundColor: C.bg,
      backgroundImage:
        "radial-gradient(circle at 12% 0%, rgba(59,130,246,0.32), transparent 48%), " +
        "radial-gradient(circle at 100% 100%, rgba(168,85,247,0.28), transparent 52%)",
    },
    // Brand row
    h(
      { alignItems: "center", justifyContent: "space-between" },
      h(
        { alignItems: "center", gap: 20 },
        logo(),
        h({ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }, "react-next-pagination-pro"),
      ),
      h(
        {
          padding: "8px 18px", borderRadius: 999, fontSize: 22, fontWeight: 600,
          color: C.sub, border: `1px solid ${C.line}`, background: "rgba(17,26,46,0.7)",
        },
        `v${version}`,
      ),
    ),
    // Headline
    h(
      { flexDirection: "column", gap: 22 },
      h(
        {
          flexDirection: "column", alignItems: "flex-start", // so the gradient spans the text, not the row
          fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.035em",
        },
        h({}, "Pagination for"),
        h(
          {
            backgroundImage: `linear-gradient(90deg, ${C.violet}, #6366f1 45%, ${C.sky})`,
            backgroundClip: "text",
            color: "transparent",
          },
          "React & Next.js",
        ),
      ),
      h(
        { fontSize: 27, color: C.sub, lineHeight: 1.4 },
        `${variantCount}+ UI variants · headless hooks · cursor & load-more · a11y · dark mode · RTL`,
      ),
    ),
    // Footer row
    h(
      { alignItems: "center", justifyContent: "space-between" },
      pager(),
      h(
        {
          padding: "14px 22px", borderRadius: 14, fontSize: 20, fontWeight: 600,
          color: C.ink, background: C.card, border: `1px solid ${C.line}`,
        },
        "npm i react-next-pagination-pro",
      ),
    ),
  );

export async function renderOgImage(card: OgCard): Promise<Buffer> {
  // Satori's types want a ReactNode; our element objects are exactly that shape.
  const svg = await satori(template(card) as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [inter(400), inter(600), inter(800)],
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}

// @vitest-environment node
import { describe, it, expect } from "vitest";
import type { HtmlTagDescriptor, IndexHtmlTransformContext } from "vite";
import { OG_HEIGHT, OG_WIDTH, renderOgImage } from "../scripts/og-image";
import { ogImage, type OgPluginOptions } from "../scripts/vite-plugin-og";

const card = { variantCount: 136, version: "0.1.0" };

const opts: OgPluginOptions = {
  title: "Title",
  description: "Description",
  alt: "Alt",
  card,
};

/** Runs the plugin's HTML hook the way a production build does. */
const buildTags = async (o: OgPluginOptions) => {
  const hook = ogImage(o).transformIndexHtml as (
    html: string,
    ctx: IndexHtmlTransformContext,
  ) => Promise<HtmlTagDescriptor[]>;
  const tags = await hook("", { path: "/index.html", filename: "index.html" });
  return Object.fromEntries(
    tags.map((t) => [String(t.attrs?.property ?? t.attrs?.name), String(t.attrs?.content)]),
  );
};

describe("Open Graph image", () => {
  it("renders a 1200×630 PNG", async () => {
    const png = await renderOgImage(card);
    // PNG signature, then the IHDR chunk's width/height.
    expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_HEIGHT);
  }, 20_000);

  it("points og:image at an absolute, content-hashed URL when the site URL is known", async () => {
    const meta = await buildTags({ ...opts, siteUrl: "https://demo.example.com/" });
    expect(meta["og:image"]).toMatch(/^https:\/\/demo\.example\.com\/og-image\.png\?v=[0-9a-f]{8}$/);
    expect(meta["twitter:image"]).toBe(meta["og:image"]);
    expect(meta["og:url"]).toBe("https://demo.example.com/");
    expect(meta["twitter:card"]).toBe("summary_large_image");
    expect([meta["og:image:width"], meta["og:image:height"]]).toEqual(["1200", "630"]);
  }, 20_000);

  it("falls back to a relative image and no og:url without a site URL", async () => {
    const meta = await buildTags(opts);
    expect(meta["og:image"]).toMatch(/^\/og-image\.png\?v=/);
    expect(meta["og:url"]).toBeUndefined();
  }, 20_000);
});

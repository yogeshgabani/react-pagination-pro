import { createHash } from "node:crypto";
import type { HtmlTagDescriptor, Plugin } from "vite";
import { OG_HEIGHT, OG_WIDTH, renderOgImage, type OgCard } from "./og-image";

export const OG_FILE = "og-image.png";

export interface OgPluginOptions {
  title: string;
  description: string;
  /** Alt text for the card. */
  alt: string;
  /** Public origin, e.g. "https://example.com". Crawlers (Facebook, LinkedIn,
   *  WhatsApp) ignore relative og:image URLs, so leave this unset only locally. */
  siteUrl?: string;
  card: OgCard;
}

/**
 * Preview & generate the Open Graph card.
 *
 *   dev   → http://localhost:5188/og-image.png renders the card (preview). The
 *           template and variant count are config dependencies, so editing
 *           either restarts the server and the next refresh shows the change.
 *   build → emits demo/dist/og-image.png and injects og:* / twitter:* tags.
 *           The image URL carries a content hash so platforms that cache
 *           previews (they all do) pick up a changed card.
 */
export function ogImage({ title, description, alt, siteUrl, card }: OgPluginOptions): Plugin {
  let png: Promise<Buffer> | undefined;
  const render = () => (png ??= renderOgImage(card));
  const origin = siteUrl?.replace(/\/+$/, "") ?? "";

  return {
    name: "rpp-og-image",

    configResolved(config) {
      if (config.command === "build" && !origin) {
        config.logger.warn(
          `[og-image] No site URL — og:image will be relative and most platforms won't show the card. ` +
            `Set VITE_SITE_URL (Netlify sets URL automatically).`,
        );
      }
    },

    configureServer(server) {
      server.middlewares.use(`/${OG_FILE}`, (_req, res, next) => {
        render().then((buf) => {
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "no-store");
          res.end(buf);
        }, next);
      });
    },

    async transformIndexHtml(_html, ctx) {
      // Hashing means rendering, so skip it in dev to keep page loads instant.
      const version = ctx.server
        ? ""
        : `?v=${createHash("sha1").update(await render()).digest("hex").slice(0, 8)}`;
      const image = `${origin}/${OG_FILE}${version}`;

      const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({
        tag: "meta",
        attrs,
        injectTo: "head",
      });
      const og = (property: string, content: string) => meta({ property, content });
      const tw = (name: string, content: string) => meta({ name, content });

      return [
        tw("description", description),
        og("og:type", "website"),
        og("og:site_name", "react-next-pagination-pro"),
        og("og:title", title),
        og("og:description", description),
        ...(origin ? [og("og:url", `${origin}/`)] : []),
        og("og:image", image),
        og("og:image:type", "image/png"),
        og("og:image:width", String(OG_WIDTH)),
        og("og:image:height", String(OG_HEIGHT)),
        og("og:image:alt", alt),
        tw("twitter:card", "summary_large_image"),
        tw("twitter:title", title),
        tw("twitter:description", description),
        tw("twitter:image", image),
        tw("twitter:image:alt", alt),
      ];
    },

    async generateBundle() {
      this.emitFile({ type: "asset", fileName: OG_FILE, source: await render() });
    },
  };
}

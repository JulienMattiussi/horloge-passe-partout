#!/usr/bin/env node
/**
 * Rasterize public/og.svg to public/og.png (1200x630).
 *
 * SVG is fine for og:image on Twitter, but Facebook/LinkedIn reject it, so we
 * ship a PNG. Regenerate whenever the SVG source changes.
 *
 * Uses @resvg/resvg-js (Rust-based SVG renderer) — produces correct text
 * rendering unlike ImageMagick's internal MSVG parser.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../public/og.svg");
const out = resolve(here, "../public/og.png");

const svg = readFileSync(src, "utf8");
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: "Liberation Sans",
  },
});
const png = resvg.render().asPng();
writeFileSync(out, png);

console.log(`Wrote ${out} (${png.byteLength} bytes)`);

#!/bin/bash
# Rasterize public/og.svg to public/og.png (1200x630).
#
# SVG is fine for og:image on Twitter, but Facebook/LinkedIn reject it, so we
# ship a PNG. Regenerate whenever the SVG source changes.
#
# Requires ImageMagick (`convert`).

set -euo pipefail

if ! command -v convert >/dev/null 2>&1; then
  echo "error: ImageMagick ('convert') is required" >&2
  exit 1
fi

repo_root=$(cd "$(dirname "$0")/.." && pwd)
src="${repo_root}/public/og.svg"
out="${repo_root}/public/og.png"

convert -density 150 -background '#f3f1ec' "$src" -resize 1200x630 -flatten "$out"

echo "Wrote $out ($(stat -c%s "$out") bytes)"

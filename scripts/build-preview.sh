#!/bin/bash
# Build public/preview.svg from the passe-partout images.
#
# The README preview is an animated SVG with the passe-partout images inlined
# as JPEG data URIs (since GitHub renders SVGs in sandboxed <img> mode, external
# image references don't load).
#
# Requires ImageMagick (`convert`).

set -euo pipefail

if ! command -v convert >/dev/null 2>&1; then
  echo "error: ImageMagick ('convert') is required" >&2
  exit 1
fi

repo_root=$(cd "$(dirname "$0")/.." && pwd)
src_dir="${repo_root}/public/images"
out="${repo_root}/public/preview.svg"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

for i in 0 1 2 3 4 5 6 7 8 9; do
  convert "${src_dir}/${i}_circle_200.png" -resize 100x100 -quality 75 "${tmp}/${i}.jpg"
  b64=$(base64 -w0 "${tmp}/${i}.jpg")
  eval "URI_${i}='data:image/jpeg;base64,${b64}'"
done

cat > "$out" <<'SVG_HEADER'
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 700 140" width="700" height="140" role="img" aria-label="Horloge Passe-Partout preview">
  <defs>
    <clipPath id="pp-round" clipPathUnits="objectBoundingBox">
      <rect width="1" height="1" rx="0.06" ry="0.06"/>
    </clipPath>
  </defs>
  <style>
    .panel-bg { fill: #111; }
    .panel-crease { stroke: rgba(0, 0, 0, 0.55); stroke-width: 1; }
    .sep {
      fill: #1a1a1a;
      font-family: "Helvetica Neue", Arial, sans-serif;
      font-weight: 800;
      font-size: 90px;
      text-anchor: middle;
      dominant-baseline: central;
    }
    image { clip-path: url(#pp-round); }
    .cycle image { opacity: 0; animation: pp-swap 10s infinite; }
    .cycle image:nth-of-type(1)  { animation-delay: 0s; }
    .cycle image:nth-of-type(2)  { animation-delay: 1s; }
    .cycle image:nth-of-type(3)  { animation-delay: 2s; }
    .cycle image:nth-of-type(4)  { animation-delay: 3s; }
    .cycle image:nth-of-type(5)  { animation-delay: 4s; }
    .cycle image:nth-of-type(6)  { animation-delay: 5s; }
    .cycle image:nth-of-type(7)  { animation-delay: 6s; }
    .cycle image:nth-of-type(8)  { animation-delay: 7s; }
    .cycle image:nth-of-type(9)  { animation-delay: 8s; }
    .cycle image:nth-of-type(10) { animation-delay: 9s; }
    @keyframes pp-swap {
      0%, 9.9% { opacity: 1; }
      10%, 100% { opacity: 0; }
    }
  </style>

SVG_HEADER

emit_static() {
  local x=$1
  local digit=$2
  local uri_var="URI_${digit}"
  local uri=${!uri_var}
  cat >> "$out" <<PANEL
  <g transform="translate(${x} 20)">
    <rect class="panel-bg" width="100" height="100" rx="6"/>
    <image href="${uri}" x="0" y="0" width="100" height="100"/>
    <line class="panel-crease" x1="0" y1="50" x2="100" y2="50"/>
  </g>
PANEL
}

emit_sep() {
  local x=$1
  cat >> "$out" <<SEP

  <text class="sep" x="${x}" y="72">:</text>
SEP
}

emit_static 5   1
emit_static 111 0
emit_sep    229
emit_static 247 2
emit_static 353 8
emit_sep    471
emit_static 489 3

cat >> "$out" <<'CYCLE_OPEN'

  <g class="cycle" transform="translate(595 20)">
    <rect class="panel-bg" width="100" height="100" rx="6"/>
CYCLE_OPEN

for i in 0 1 2 3 4 5 6 7 8 9; do
  uri_var="URI_${i}"
  uri=${!uri_var}
  cat >> "$out" <<IMG
    <image href="${uri}" x="0" y="0" width="100" height="100"/>
IMG
done

cat >> "$out" <<'CYCLE_CLOSE'
    <line class="panel-crease" x1="0" y1="50" x2="100" y2="50"/>
  </g>
</svg>
CYCLE_CLOSE

echo "Wrote $out ($(stat -c%s "$out") bytes)"

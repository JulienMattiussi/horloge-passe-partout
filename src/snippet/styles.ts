/**
 * Flip-clock styles, injected by the snippet at first mount.
 *
 * All visual knobs (size, gap, colors, flip duration) are exposed as CSS
 * variables so the host page can override them without patching the JS.
 */
export const CSS = `
.pp-clock {
  --pp-size: clamp(36px, 11vw, 140px);
  --pp-gap: calc(var(--pp-size) * 0.045);
  --pp-bg: #111;
  --pp-sep-color: #111;
  --pp-flip-duration: 280ms;
  display: inline-flex;
  align-items: stretch;
  gap: var(--pp-gap);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;
  user-select: none;
}
.pp-panel {
  position: relative;
  width: var(--pp-size);
  height: var(--pp-size);
  perspective: calc(var(--pp-size) * 4);
  background: var(--pp-bg);
  border-radius: calc(var(--pp-size) * 0.06);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.pp-panel--sep {
  background: transparent;
  box-shadow: none;
  width: calc(var(--pp-size) * 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pp-sep-color);
  font-size: calc(var(--pp-size) * 0.6);
  font-weight: 800;
  overflow: visible;
}
.pp-half,
.pp-flap {
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
  overflow: hidden;
  backface-visibility: hidden;
  background: var(--pp-bg);
}
.pp-half--top,
.pp-flap--top {
  top: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);
}
.pp-half--bottom,
.pp-flap--bottom {
  bottom: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
.pp-half img,
.pp-flap img {
  position: absolute;
  left: 0;
  width: 100%;
  height: 200%;
  display: block;
  user-select: none;
  pointer-events: none;
}
.pp-half--top img,
.pp-flap--top img {
  top: 0;
}
.pp-half--bottom img,
.pp-flap--bottom img {
  top: -100%;
}
.pp-flap {
  z-index: 2;
}
.pp-flap--top {
  transform-origin: center bottom;
  animation: pp-flip-top var(--pp-flip-duration) cubic-bezier(0.55, 0, 0.72, 0.3) forwards;
}
.pp-flap--bottom {
  transform-origin: center top;
  animation: pp-flip-bottom var(--pp-flip-duration) cubic-bezier(0.3, 0.4, 0.3, 1) var(--pp-flip-duration) both;
}
@keyframes pp-flip-top {
  from { transform: rotateX(0deg); }
  to   { transform: rotateX(-90deg); }
}
@keyframes pp-flip-bottom {
  from { transform: rotateX(90deg); }
  to   { transform: rotateX(0deg); }
}
@media (prefers-reduced-motion: reduce) {
  .pp-flap--top,
  .pp-flap--bottom {
    animation-duration: 1ms;
    animation-delay: 0ms;
  }
}
`;

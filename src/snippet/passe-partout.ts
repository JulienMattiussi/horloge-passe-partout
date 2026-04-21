/**
 * Passe-Partout flip-clock snippet.
 *
 * Usage (in any remote HTML page):
 *
 *   <div data-passe-partout data-format="HH:MM"></div>
 *   <script src="https://<host>/passe-partout.js"></script>
 *
 * Supported attributes on [data-passe-partout]:
 *   - data-format : tokens HH, MM, SS; any other char is a literal separator.
 *                   Default "HH:MM".
 *   - data-time   : fixed time like "07:30" or "07:30:45". Absent = live clock.
 *
 * Imperative API (exposed on window.PassePartout):
 *   - scan()                : re-scan the DOM for new [data-passe-partout] nodes
 *   - mount(el, options?)   : mount explicitly on an element
 */

import {
  formatHasSeconds,
  getDigit,
  getSourceValue,
  msUntilNextTick,
  nowSnapshot,
  parseFormat,
  type Slot,
} from "./format";
import {
  createDigitPanel,
  createSeparatorPanel,
  type DigitPanel,
} from "./panel";
import { CSS } from "./styles";

type MountOptions = {
  format?: string;
  time?: string | null;
  imageBase?: string;
};

type Instance = {
  element: HTMLElement;
  destroy: () => void;
};

type PassePartoutApi = {
  mount: (el: HTMLElement, options?: MountOptions) => Instance;
  scan: () => void;
};

declare global {
  interface Window {
    PassePartout?: PassePartoutApi;
  }
}

type DigitUpdater = {
  slot: Extract<Slot, { kind: "digit" }>;
  panel: DigitPanel;
};

const mounted = new WeakMap<HTMLElement, Instance>();

const defaultImageBase = `${detectScriptOrigin()}/images`;

function detectScriptOrigin(): string {
  const fromCurrent = document.currentScript as HTMLScriptElement | null;
  const fromLookup = Array.from(document.scripts).find((s) =>
    /passe-partout\.js/.test(s.src),
  );
  const src = fromCurrent?.src ?? fromLookup?.src;
  return src
    ? new URL(src, window.location.href).origin
    : window.location.origin;
}

function injectCss(): void {
  if (document.querySelector("style[data-passe-partout-styles]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-passe-partout-styles", "");
  style.textContent = CSS;
  document.head.appendChild(style);
}

function resolveOptions(
  container: HTMLElement,
  options: MountOptions,
): { format: string; fixedTime: string | null; imageBase: string } {
  const format =
    options.format ?? container.getAttribute("data-format") ?? "HH:MM";
  const rawTime = options.time ?? container.getAttribute("data-time");
  const fixedTime = rawTime && rawTime.trim() !== "" ? rawTime : null;
  const imageBase = options.imageBase ?? defaultImageBase;
  return { format, fixedTime, imageBase };
}

function buildPanels(
  container: HTMLElement,
  slots: Slot[],
  imageBase: string,
  initial: { h: number; m: number; s: number },
): DigitUpdater[] {
  const updaters: DigitUpdater[] = [];
  for (const slot of slots) {
    if (slot.kind === "literal") {
      container.appendChild(createSeparatorPanel(slot.char));
    } else {
      const digit = getDigit(
        getSourceValue(initial, slot.source),
        slot.position,
      );
      const panel = createDigitPanel(digit, imageBase);
      container.appendChild(panel.el);
      updaters.push({ slot, panel });
    }
  }
  return updaters;
}

function startClock(needsSeconds: boolean, tick: () => void): () => void {
  const wait = msUntilNextTick(new Date(), needsSeconds);
  let intervalId: number | null = null;
  const alignTimeout = window.setTimeout(() => {
    tick();
    intervalId = window.setInterval(tick, needsSeconds ? 1000 : 60_000);
  }, wait);
  return () => {
    window.clearTimeout(alignTimeout);
    if (intervalId != null) window.clearInterval(intervalId);
  };
}

export function mount(
  container: HTMLElement,
  options: MountOptions = {},
): Instance {
  const existing = mounted.get(container);
  if (existing) return existing;

  injectCss();

  const { format, fixedTime, imageBase } = resolveOptions(container, options);
  const slots = parseFormat(format);
  const needsSeconds = formatHasSeconds(slots);
  const initial = nowSnapshot(fixedTime);

  container.replaceChildren();
  container.classList.add("pp-clock");
  const updaters = buildPanels(container, slots, imageBase, initial);

  function tick(): void {
    const now = nowSnapshot(fixedTime);
    for (const { slot, panel } of updaters) {
      panel.update(getDigit(getSourceValue(now, slot.source), slot.position));
    }
  }

  const stopClock = fixedTime ? null : startClock(needsSeconds, tick);

  const instance: Instance = {
    element: container,
    destroy() {
      stopClock?.();
      for (const u of updaters) u.panel.destroy();
      container.replaceChildren();
      container.classList.remove("pp-clock");
      mounted.delete(container);
    },
  };

  mounted.set(container, instance);
  return instance;
}

export function scan(): void {
  const nodes = document.querySelectorAll<HTMLElement>("[data-passe-partout]");
  nodes.forEach((el) => {
    if (!mounted.has(el)) mount(el);
  });
}

if (!window.PassePartout) {
  window.PassePartout = { mount, scan };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan, { once: true });
  } else {
    scan();
  }
}

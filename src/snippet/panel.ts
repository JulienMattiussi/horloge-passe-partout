/**
 * DOM primitives used by the snippet: image nodes, static separator panels,
 * and animated digit panels that flip between numbers.
 */

import { imageUrl } from "./format";

export type DigitPanel = {
  el: HTMLElement;
  update: (digit: string) => void;
  destroy: () => void;
};

function makeImg(src: string, alt: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.draggable = false;
  return img;
}

function makeHalf(
  side: "top" | "bottom",
  digit: string,
  imageBase: string,
): { el: HTMLDivElement; img: HTMLImageElement } {
  const el = document.createElement("div");
  el.className = `pp-half pp-half--${side}`;
  const img = makeImg(imageUrl(imageBase, digit), digit);
  el.appendChild(img);
  return { el, img };
}

function makeFlap(
  side: "top" | "bottom",
  digit: string,
  imageBase: string,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `pp-flap pp-flap--${side}`;
  el.appendChild(makeImg(imageUrl(imageBase, digit), digit));
  return el;
}

export function createSeparatorPanel(char: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "pp-panel pp-panel--sep";
  el.setAttribute("aria-hidden", "true");
  el.textContent = char;
  return el;
}

export function createDigitPanel(
  initial: string,
  imageBase: string,
): DigitPanel {
  const el = document.createElement("div");
  el.className = "pp-panel";
  el.setAttribute("aria-hidden", "true");

  const top = makeHalf("top", initial, imageBase);
  const bottom = makeHalf("bottom", initial, imageBase);
  el.appendChild(top.el);
  el.appendChild(bottom.el);

  const activeFlaps = new Set<HTMLElement>();
  let current = initial;
  let latestRequested = initial;
  let animating = false;
  let destroyed = false;

  function setImage(img: HTMLImageElement, digit: string): void {
    img.src = imageUrl(imageBase, digit);
    img.alt = digit;
  }

  function runFlipTo(target: string): void {
    const from = current;
    current = target;
    animating = true;

    // Top static already shows the new digit, hidden behind the falling flap.
    setImage(top.img, target);

    const topFlap = makeFlap("top", from, imageBase);
    const bottomFlap = makeFlap("bottom", target, imageBase);
    activeFlaps.add(topFlap);
    activeFlaps.add(bottomFlap);
    el.appendChild(topFlap);
    el.appendChild(bottomFlap);

    bottomFlap.addEventListener(
      "animationend",
      () => {
        if (destroyed) return;
        setImage(bottom.img, target);
        topFlap.remove();
        bottomFlap.remove();
        activeFlaps.delete(topFlap);
        activeFlaps.delete(bottomFlap);
        animating = false;
        if (current !== latestRequested) runFlipTo(latestRequested);
      },
      { once: true },
    );
  }

  function update(digit: string): void {
    latestRequested = digit;
    if (animating || digit === current) return;
    runFlipTo(digit);
  }

  function destroy(): void {
    destroyed = true;
    activeFlaps.forEach((f) => f.remove());
    activeFlaps.clear();
  }

  return { el, update, destroy };
}

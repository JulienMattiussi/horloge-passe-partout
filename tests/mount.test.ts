import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "../src/snippet/passe-partout";

function makeContainer(): HTMLDivElement {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return div;
}

describe("mount", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document
      .querySelectorAll("style[data-passe-partout-styles]")
      .forEach((n) => n.remove());
  });

  it("injects its stylesheet exactly once", () => {
    mount(makeContainer(), { time: "07:30" });
    mount(makeContainer(), { time: "08:30" });
    expect(
      document.querySelectorAll("style[data-passe-partout-styles]").length,
    ).toBe(1);
  });

  it("renders the expected panels for a fixed HH:MM time", () => {
    const container = makeContainer();
    mount(container, { format: "HH:MM", time: "07:30" });

    expect(container.classList.contains("pp-clock")).toBe(true);
    const panels = container.querySelectorAll(".pp-panel");
    expect(panels).toHaveLength(5);
    expect(
      container.querySelectorAll(".pp-panel:not(.pp-panel--sep)"),
    ).toHaveLength(4);

    const sep = container.querySelector(".pp-panel--sep");
    expect(sep?.textContent).toBe(":");
  });

  it("uses the correct image URL for each digit position", () => {
    const container = makeContainer();
    mount(container, {
      format: "HH:MM",
      time: "07:30",
      imageBase: "http://cdn.test/img",
    });

    const digitPanels = container.querySelectorAll(
      ".pp-panel:not(.pp-panel--sep)",
    );
    const srcs = Array.from(digitPanels).map((p) =>
      p.querySelector(".pp-half--top img")?.getAttribute("src"),
    );
    expect(srcs).toEqual([
      "http://cdn.test/img/0_circle_200.png",
      "http://cdn.test/img/7_circle_200.png",
      "http://cdn.test/img/3_circle_200.png",
      "http://cdn.test/img/0_circle_200.png",
    ]);
  });

  it("is idempotent on the same container", () => {
    const container = makeContainer();
    const first = mount(container, { time: "10:00" });
    const second = mount(container, { time: "22:00" });
    expect(second).toBe(first);
  });

  it("destroys cleanly", () => {
    const container = makeContainer();
    const instance = mount(container, { time: "10:00" });
    instance.destroy();
    expect(container.children).toHaveLength(0);
    expect(container.classList.contains("pp-clock")).toBe(false);
    expect(container.getAttribute("role")).toBeNull();
    expect(container.getAttribute("aria-label")).toBeNull();
  });

  it("exposes the time to assistive tech via role + aria-label", () => {
    const container = makeContainer();
    mount(container, { format: "HH:MM", time: "07:30" });
    expect(container.getAttribute("role")).toBe("img");
    expect(container.getAttribute("aria-label")).toBe("07:30");
  });

  it("hides decorative panels from assistive tech", () => {
    const container = makeContainer();
    mount(container, { format: "HH:MM", time: "07:30" });
    const panels = container.querySelectorAll(".pp-panel");
    expect(panels.length).toBeGreaterThan(0);
    panels.forEach((p) => {
      expect(p.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("renders six digit panels for HH:MM:SS", () => {
    const container = makeContainer();
    mount(container, { format: "HH:MM:SS", time: "12:34:56" });
    expect(
      container.querySelectorAll(".pp-panel:not(.pp-panel--sep)"),
    ).toHaveLength(6);
    expect(container.querySelectorAll(".pp-panel--sep")).toHaveLength(2);
  });

  it("uses HH:MM as the default format when nothing is given", () => {
    const container = makeContainer();
    mount(container, { time: "09:15" });
    expect(
      container.querySelectorAll(".pp-panel:not(.pp-panel--sep)"),
    ).toHaveLength(4);
  });

  it("reads data-format and data-time attributes as a fallback", () => {
    const container = makeContainer();
    container.setAttribute("data-format", "HH-MM");
    container.setAttribute("data-time", "08:15");
    mount(container);

    const sep = container.querySelector(".pp-panel--sep");
    expect(sep?.textContent).toBe("-");
    const tops = container.querySelectorAll(
      ".pp-panel:not(.pp-panel--sep) .pp-half--top img",
    );
    expect(tops[0].getAttribute("alt")).toBe("0");
    expect(tops[1].getAttribute("alt")).toBe("8");
    expect(tops[2].getAttribute("alt")).toBe("1");
    expect(tops[3].getAttribute("alt")).toBe("5");
  });
});

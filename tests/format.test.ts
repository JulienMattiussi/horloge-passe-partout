import { describe, it, expect } from "vitest";
import {
  formatHasSeconds,
  getDigit,
  getSourceValue,
  imageUrl,
  msUntilNextTick,
  nowSnapshot,
  parseFixedTime,
  parseFormat,
  renderFormat,
} from "../src/snippet/format";

describe("parseFormat", () => {
  it("expands HH into two digit slots (tens, ones)", () => {
    expect(parseFormat("HH")).toEqual([
      { kind: "digit", source: "H", position: "tens" },
      { kind: "digit", source: "H", position: "ones" },
    ]);
  });

  it("handles HH:MM", () => {
    expect(parseFormat("HH:MM")).toEqual([
      { kind: "digit", source: "H", position: "tens" },
      { kind: "digit", source: "H", position: "ones" },
      { kind: "literal", char: ":" },
      { kind: "digit", source: "M", position: "tens" },
      { kind: "digit", source: "M", position: "ones" },
    ]);
  });

  it("handles HH:MM:SS", () => {
    const slots = parseFormat("HH:MM:SS");
    expect(slots).toHaveLength(8);
    expect(slots.filter((s) => s.kind === "digit")).toHaveLength(6);
    expect(slots.filter((s) => s.kind === "literal")).toHaveLength(2);
  });

  it("treats unknown characters as literals", () => {
    const slots = parseFormat("HH-MM");
    expect(slots[2]).toEqual({ kind: "literal", char: "-" });
  });

  it("returns an empty array for an empty format", () => {
    expect(parseFormat("")).toEqual([]);
  });
});

describe("parseFixedTime", () => {
  it("parses HH:MM", () => {
    expect(parseFixedTime("07:30")).toEqual({ h: 7, m: 30, s: 0 });
  });

  it("parses HH:MM:SS", () => {
    expect(parseFixedTime("23:59:58")).toEqual({ h: 23, m: 59, s: 58 });
  });

  it("accepts short forms like 7:5", () => {
    expect(parseFixedTime("7:5")).toEqual({ h: 7, m: 5, s: 0 });
  });

  it("ignores surrounding whitespace", () => {
    expect(parseFixedTime("  07:30  ")).toEqual({ h: 7, m: 30, s: 0 });
  });

  it("returns null for out-of-range values", () => {
    expect(parseFixedTime("25:00")).toBeNull();
    expect(parseFixedTime("12:60")).toBeNull();
    expect(parseFixedTime("12:30:60")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(parseFixedTime("hello")).toBeNull();
    expect(parseFixedTime("12")).toBeNull();
    expect(parseFixedTime("")).toBeNull();
  });
});

describe("getDigit", () => {
  it("returns the tens digit, padded with zero when needed", () => {
    expect(getDigit(7, "tens")).toBe("0");
    expect(getDigit(42, "tens")).toBe("4");
  });

  it("returns the ones digit", () => {
    expect(getDigit(7, "ones")).toBe("7");
    expect(getDigit(42, "ones")).toBe("2");
    expect(getDigit(0, "ones")).toBe("0");
  });
});

describe("getSourceValue", () => {
  const now = { h: 9, m: 17, s: 42 };
  it("returns the hours", () => {
    expect(getSourceValue(now, "H")).toBe(9);
  });
  it("returns the minutes", () => {
    expect(getSourceValue(now, "M")).toBe(17);
  });
  it("returns the seconds", () => {
    expect(getSourceValue(now, "S")).toBe(42);
  });
});

describe("formatHasSeconds", () => {
  it("is true when any slot reads seconds", () => {
    expect(formatHasSeconds(parseFormat("HH:MM:SS"))).toBe(true);
  });
  it("is false when no slot reads seconds", () => {
    expect(formatHasSeconds(parseFormat("HH:MM"))).toBe(false);
    expect(formatHasSeconds(parseFormat("HH"))).toBe(false);
  });
});

describe("imageUrl", () => {
  it("builds a URL with the _circle_200.png suffix", () => {
    expect(imageUrl("https://example.com/images", "3")).toBe(
      "https://example.com/images/3_circle_200.png",
    );
  });
});

describe("msUntilNextTick", () => {
  it("aligns to the next second when seconds are visible", () => {
    const d = new Date(2020, 0, 1, 10, 20, 30, 250);
    expect(msUntilNextTick(d, true)).toBe(750);
  });

  it("aligns to the next minute when seconds are not visible", () => {
    const d = new Date(2020, 0, 1, 10, 20, 30, 250);
    expect(msUntilNextTick(d, false)).toBe(29_750);
  });
});

describe("renderFormat", () => {
  it("substitutes HH, MM, SS with zero-padded values", () => {
    expect(renderFormat("HH:MM:SS", { h: 7, m: 5, s: 42 })).toBe("07:05:42");
  });

  it("preserves literal separators", () => {
    expect(renderFormat("HH-MM", { h: 9, m: 15, s: 0 })).toBe("09-15");
  });

  it("works with partial formats", () => {
    expect(renderFormat("HH:MM", { h: 12, m: 30, s: 45 })).toBe("12:30");
  });
});

describe("nowSnapshot", () => {
  it("returns the parsed fixed time when provided and valid", () => {
    expect(nowSnapshot("07:30:15")).toEqual({ h: 7, m: 30, s: 15 });
  });

  it("falls back to the clock when fixed is null", () => {
    const clock = new Date(2020, 0, 1, 8, 45, 12);
    expect(nowSnapshot(null, clock)).toEqual({ h: 8, m: 45, s: 12 });
  });

  it("falls back to the clock when fixed is unparseable", () => {
    const clock = new Date(2020, 0, 1, 8, 45, 12);
    expect(nowSnapshot("nope", clock)).toEqual({ h: 8, m: 45, s: 12 });
  });
});

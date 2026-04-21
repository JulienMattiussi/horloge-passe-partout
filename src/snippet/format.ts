/**
 * Pure helpers used by the snippet. Kept free of DOM access so they can be
 * unit-tested without a browser environment.
 */

export type Source = "H" | "M" | "S";
export type Position = "tens" | "ones";

export type Slot =
  | { kind: "digit"; source: Source; position: Position }
  | { kind: "literal"; char: string };

export type Time = { h: number; m: number; s: number };

export function parseFormat(format: string): Slot[] {
  const slots: Slot[] = [];
  let i = 0;
  while (i < format.length) {
    const two = format.slice(i, i + 2);
    if (two === "HH") {
      slots.push({ kind: "digit", source: "H", position: "tens" });
      slots.push({ kind: "digit", source: "H", position: "ones" });
      i += 2;
    } else if (two === "MM") {
      slots.push({ kind: "digit", source: "M", position: "tens" });
      slots.push({ kind: "digit", source: "M", position: "ones" });
      i += 2;
    } else if (two === "SS") {
      slots.push({ kind: "digit", source: "S", position: "tens" });
      slots.push({ kind: "digit", source: "S", position: "ones" });
      i += 2;
    } else {
      slots.push({ kind: "literal", char: format[i] });
      i += 1;
    }
  }
  return slots;
}

export function parseFixedTime(time: string): Time | null {
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(time.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] != null ? parseInt(match[3], 10) : 0;
  if (h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
}

export function getDigit(value: number, position: Position): string {
  const padded = value.toString().padStart(2, "0");
  return position === "tens" ? padded[0] : padded[1];
}

export function getSourceValue(now: Time, source: Source): number {
  return source === "H" ? now.h : source === "M" ? now.m : now.s;
}

export function formatHasSeconds(slots: Slot[]): boolean {
  return slots.some((s) => s.kind === "digit" && s.source === "S");
}

export function msUntilNextTick(now: Date, needsSeconds: boolean): number {
  return needsSeconds
    ? 1000 - now.getMilliseconds()
    : 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
}

export function imageUrl(base: string, digit: string): string {
  return `${base}/${digit}_circle_200.png`;
}

export function nowSnapshot(
  fixed: string | null,
  clock: Date = new Date(),
): Time {
  if (fixed) {
    const parsed = parseFixedTime(fixed);
    if (parsed) return parsed;
  }
  return { h: clock.getHours(), m: clock.getMinutes(), s: clock.getSeconds() };
}

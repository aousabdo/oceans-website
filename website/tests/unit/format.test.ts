import { describe, it, expect } from "vitest";
import { formatDate, readingTime, toSlug } from "../../src/lib/format";

describe("formatDate", () => {
  it("formats as Month D, YYYY", () => {
    expect(formatDate(new Date("2026-05-11T12:00:00Z"))).toBe("May 11, 2026");
  });
});

describe("readingTime", () => {
  it("returns 1 min for short text", () => {
    expect(readingTime("hello world")).toBe("1 min read");
  });
  it("scales linearly at ~225 wpm", () => {
    const words = Array(450).fill("word").join(" ");
    expect(readingTime(words)).toBe("2 min read");
  });
});

describe("toSlug", () => {
  it("kebabs and lowers", () => {
    expect(toSlug("Hello World!")).toBe("hello-world");
  });
  it("strips diacritics", () => {
    expect(toSlug("Café Léon")).toBe("cafe-leon");
  });
});

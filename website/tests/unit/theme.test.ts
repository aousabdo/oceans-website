import { describe, it, expect } from "vitest";
import { resolveTheme, THEMES } from "../../src/lib/theme";

describe("resolveTheme", () => {
  it("returns 'operator' when value is undefined", () => {
    expect(resolveTheme(undefined)).toBe("operator");
  });
  it("returns 'operator' when value is unknown", () => {
    expect(resolveTheme("nope")).toBe("operator");
  });
  it("returns the value when it is a valid theme", () => {
    for (const t of THEMES) expect(resolveTheme(t)).toBe(t);
  });
  it("returns 'operator' for empty string", () => {
    expect(resolveTheme("")).toBe("operator");
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MARK, MARK_W, MARK_H } from "../../src/lib/mark";

// The [~] geometry is defined in Logo.astro. src/lib/mark.ts re-exports it
// for SVG work outside that component; this test keeps the two identical.
const logo = readFileSync(
  fileURLToPath(new URL("../../src/components/Logo.astro", import.meta.url)),
  "utf8",
);

describe("MARK geometry", () => {
  it("matches Logo.astro exactly", () => {
    expect(logo).toContain(`const VB = "${MARK.VB}";`);
    expect(logo).toContain(`const D_LEFT  = "${MARK.D_LEFT}";`);
    expect(logo).toContain(`const D_RIGHT = "${MARK.D_RIGHT}";`);
    expect(logo).toContain(`const D_WAVE  = "${MARK.D_WAVE}";`);
    expect(logo).toContain(`const SW = ${MARK.SW};`);
  });

  it("exposes the viewBox size", () => {
    expect(`0 0 ${MARK_W} ${MARK_H}`).toBe(MARK.VB);
  });
});

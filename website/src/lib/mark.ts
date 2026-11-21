/**
 * The [~] mark's geometry, for SVG work outside Logo.astro.
 *
 * Logo.astro is the source of truth (the brand README points there). These
 * strings are copied from it verbatim, and tests/unit/mark.test.ts fails if
 * the two ever drift apart. Never edit these by hand without editing
 * Logo.astro too.
 */
export const MARK = {
  VB: "0 0 96 60",
  D_LEFT: "M 18 10 L 10 10 L 10 50 L 18 50",
  D_RIGHT: "M 78 10 L 86 10 L 86 50 L 78 50",
  D_WAVE: "M 22 30 Q 34 18 48 30 T 74 30",
  SW: 4,
} as const;

export const MARK_W = 96;
export const MARK_H = 60;

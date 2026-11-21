import { describe, it, expect } from "vitest";
import { waveSegments, wavePath, layoutLights, stars, WATER } from "../../src/lib/sea";

describe("waveSegments", () => {
  it("returns the canonical tilde for its own span", () => {
    expect(waveSegments(22, 74)).toEqual([
      "M 22 30 Q 34 18 48 30",
      "M 48 30 Q 62 42 74 30",
    ]);
  });

  it("continues the tilde both ways by T reflection", () => {
    const segs = waveSegments(-82, 178);
    expect(segs).toHaveLength(10);
    expect(segs[4]).toBe("M 22 30 Q 34 18 48 30");
    expect(segs[5]).toBe("M 48 30 Q 62 42 74 30");
    // One step either side: reflection of (34,18) about (22,30) is (10,42);
    // reflection of (62,42) about (74,30) is (86,18).
    expect(segs[3]).toBe("M -4 30 Q 10 42 22 30");
    expect(segs[6]).toBe("M 74 30 Q 86 18 100 30");
  });
});

describe("wavePath", () => {
  it("is the canonical tilde at unit scale", () => {
    expect(wavePath({ x0: 22, x1: 74, baseY: 30, sx: 1, sy: 1 })).toBe(
      "M 22 30 Q 34 18 48 30 Q 62 42 74 30",
    );
  });

  it("scales about the baseline", () => {
    expect(wavePath({ x0: 0, x1: 104, baseY: 100, sx: 2, sy: 0.5 })).toBe(
      "M 0 100 Q 24 94 52 100 Q 80 106 104 100",
    );
  });
});

describe("layoutLights", () => {
  for (let n = 1; n <= 12; n++) {
    it(`places ${n} lights on the water, spaced apart`, () => {
      const pts = layoutLights(n);
      expect(pts).toHaveLength(n);
      for (const p of pts) {
        expect(p.y).toBeGreaterThanOrEqual(WATER.top);
        expect(p.y).toBeLessThanOrEqual(WATER.bottom);
        expect(p.x).toBeGreaterThanOrEqual(WATER.left);
        expect(p.x).toBeLessThanOrEqual(WATER.right);
        expect(p.r).toBeGreaterThan(0);
      }
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const a = pts[i]!;
          const b = pts[j]!;
          expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(60);
        }
    });
  }
});

describe("stars", () => {
  it("is deterministic and stays in the sky", () => {
    const a = stars(10, 7);
    expect(a).toEqual(stars(10, 7));
    expect(a).toHaveLength(10);
    for (const s of a) expect(s.y).toBeLessThan(WATER.top);
  });
});

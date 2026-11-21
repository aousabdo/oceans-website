/**
 * Geometry for the OCEANS, 2026 holiday card: the mark's own wave, continued
 * into a sea.
 *
 * Nothing here is drawn by eye. The wave is read from MARK.D_WAVE
 * ("M 22 30 Q 34 18 48 30 T 74 30") and continued the way SVG's `T` command
 * continues any quadratic curve: each new control point is the previous one
 * reflected through the shared end point. The canonical tilde therefore sits,
 * unchanged, inside every sea line.
 *
 * Card coordinates use a fixed 800 × 1000 viewBox (a 4:5 portrait card), so
 * HTML labels positioned in % always line up with the SVG at any width.
 */
import { MARK } from "./mark";

export const CARD = { w: 800, h: 1000 } as const;
export const HORIZON_Y = 440;
// Lights stay inside this box. The bottom leaves room for the card's sign-off;
// the sides leave room for a centred name label under each light.
export const WATER = { top: 470, bottom: 860, left: 130, right: 670 } as const;

interface Pt {
  x: number;
  y: number;
}

function parseWave(d: string) {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  // M p0 Q c p1 T p2
  const [p0x, p0y, cx, cy, p1x, p1y] = n as [number, number, number, number, number, number];
  return { p0: { x: p0x, y: p0y }, c: { x: cx, y: cy }, p1: { x: p1x, y: p1y } };
}

const W = parseWave(MARK.D_WAVE);
/** Width of one quadratic segment (half a wavelength), in mark units. */
export const HALF = W.p1.x - W.p0.x; // 26
/** The wave's baseline in mark units. */
export const BASE = W.p0.y; // 30
/** Control-point offsets for the two alternating segments, from their start point. */
const EVEN: Pt = { x: W.c.x - W.p0.x, y: W.c.y - W.p0.y }; // (12, -12)
// T reflects c through p1, so the next control sits at p1 + (p1 − c).
const ODD: Pt = { x: W.p1.x - W.c.x, y: W.p1.y - W.c.y }; // (14, 12)

const f = (n: number) => String(Number(n.toFixed(2)) || 0);

/**
 * One quadratic segment per item, in mark units, covering [fromX, toX].
 * Segment k starts at p0.x + k·HALF; k = 0 and 1 are the canonical tilde.
 * fromX and toX should land on segment boundaries (p0.x + k·HALF).
 */
export function waveSegments(fromX: number, toX: number): string[] {
  const k0 = Math.round((fromX - W.p0.x) / HALF);
  const k1 = Math.round((toX - W.p0.x) / HALF);
  const out: string[] = [];
  for (let k = k0; k < k1; k++) {
    const sx = W.p0.x + k * HALF;
    const o = ((k % 2) + 2) % 2 === 0 ? EVEN : ODD;
    out.push(`M ${f(sx)} ${f(BASE)} Q ${f(sx + o.x)} ${f(BASE + o.y)} ${f(sx + HALF)} ${f(BASE)}`);
  }
  return out;
}

/**
 * The same continuation as a single path in card units: starts at x0 with an
 * "even" (crest-first) segment, runs until it reaches x1, and is scaled sx
 * across and sy up/down about baseY.
 */
export function wavePath(opts: { x0: number; x1: number; baseY: number; sx: number; sy: number }): string {
  const { x0, x1, baseY, sx, sy } = opts;
  const h = HALF * sx;
  let d = `M ${f(x0)} ${f(baseY)}`;
  let k = 0;
  for (let x = x0; x < x1 - 1e-9; x += h, k++) {
    const o = k % 2 === 0 ? EVEN : ODD;
    d += ` Q ${f(x + o.x * sx)} ${f(baseY + o.y * sy)} ${f(x + h)} ${f(baseY)}`;
  }
  return d;
}

/** One full wavelength of a line drawn with wavePath at scale sx. */
export const period = (sx: number) => 2 * HALF * sx;

/**
 * Positions for n lights on the water. Rows step down in depth (farther =
 * nearer the horizon = smaller); x walks a golden-ratio sequence so
 * neighbouring rows sit far apart and labels don't collide.
 */
export function layoutLights(n: number): { x: number; y: number; r: number }[] {
  const PHI = 0.6180339887;
  const span = WATER.right - WATER.left;
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.3 : i / (n - 1);
    const y = WATER.top + 10 + t * (WATER.bottom - WATER.top - 20);
    const u = (0.5 + i * PHI) % 1;
    out.push({ x: Math.round(WATER.left + u * span), y: Math.round(y), r: Number((3 + 2.6 * t).toFixed(2)) });
  }
  return out;
}

/** Deterministic star field above the horizon (mulberry32). */
export function stars(count: number, seed: number): { x: number; y: number; r: number; o: number }[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: Math.round(10 + rand() * (CARD.w - 20)),
    y: Math.round(16 + Math.pow(rand(), 1.4) * (HORIZON_Y - 60)),
    r: Number((0.6 + rand() * 1.1).toFixed(2)),
    o: Number((0.2 + rand() * 0.55).toFixed(2)),
  }));
}

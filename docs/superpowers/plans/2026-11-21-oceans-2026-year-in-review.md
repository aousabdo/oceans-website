# OCEANS, 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/2026`, a five-beat year-in-review page in Mariner that ends in an animated SVG holiday card, plus an OG image and a review packet. Everything stays on the branch.

**Architecture:** A static Astro page made of plain sections, with a day-to-night palette. The card is server-rendered SVG generated from Logo.astro's path strings. Motion is CSS-only (transform/opacity), with a few lines of JS to start it on view and to pause or replay it. One JSON flag gates the DRAFT frame, noindex and the sitemap.

**Tech Stack:** Astro 6, Tailwind 4, Vitest, Playwright (already in devDependencies). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-21-oceans-2026-year-in-review-design.md`

## Global Constraints

- Public-safe copy only: no program or contract names, no customer detail beyond what the site already publishes, no figure without a repo source listed in the review packet.
- Danny's note is always rendered inside a frame labelled DRAFT while `noteApproved` is false.
- Mark geometry comes from `VB`, `D_LEFT`, `D_RIGHT`, `D_WAVE`, `SW` exactly as in `src/components/Logo.astro`. It is never retyped by eye.
- Mark colors are Navy, Cream, White, Black or Brass only.
- AA contrast for all text: 4.5:1 for normal text, 3:1 for text ≥24px or ≥18.66px bold.
- `prefers-reduced-motion: reduce` gives the finished, static card. Without JS the finished card is also shown.
- No layout shift: every image has width and height, and the card has a fixed `aspect-ratio: 4 / 5`.
- Not linked from the nav, the ⌘K index or the sticky CTA. Never merge or push to `main`.
- Commits carry no AI attribution and no Co-Authored-By trailers.

## Review Focus

- A 320px-wide phone: no horizontal scroll, and the eight name labels don't overlap. Pinned by the e2e overflow test at 320px.
- Reduced motion: labels and lights are visible, with no animation. Pinned by the e2e reduced-motion test.
- A teammate added to or removed from /team: the light count follows the collection. Pinned by the `layoutLights` unit test for n = 1..12.
- The flag flipped to approved: the DRAFT frame and noindex go away. Pinned by a unit test on `robotsFor()`.
- JS disabled: the card shows its finished frame. Pinned by the e2e test with `javaScriptEnabled: false`.

---

### Task 1: Mark geometry and sea generator

**Files:**
- Create: `website/src/lib/mark.ts`, `website/src/lib/sea.ts`
- Test: `website/tests/unit/mark.test.ts`, `website/tests/unit/sea.test.ts`

**Interfaces:**
- Produces: `MARK = { VB, D_LEFT, D_RIGHT, D_WAVE, SW }` (strings/number), `MARK_W = 96`, `MARK_H = 60`.
- Produces: `waveSegments(fromX: number, toX: number): string[]`. Each item is one quadratic segment `"M x 30 Q cx cy ex 30"` in mark units, continuing `D_WAVE` by SVG `T` reflection in both directions. The two segments covering x 22→74 equal the canonical tilde.
- Produces: `wavePath(opts: { x0: number; x1: number; baseY: number; sx: number; sy: number }): string`. This is the same continuation as one path, scaled `sx` horizontally and `sy` vertically about the baseline, in card units.
- Produces: `layoutLights(n: number): { x: number; y: number; r: number }[]` in the card viewBox `0 0 800 1000`. Water is y 440–960, and x stays inside 110–690.
- Produces: `stars(count: number, seed: number): { x: number; y: number; r: number; o: number }[]`, deterministic.

- [ ] Test `mark.test.ts`: read `src/components/Logo.astro` as text and assert it contains `const VB = "${MARK.VB}"`, and likewise `D_LEFT`, `D_RIGHT`, `D_WAVE` and `const SW = ${MARK.SW}`.
- [ ] Test `sea.test.ts`: `waveSegments(22, 74)` joined equals `["M 22 30 Q 34 18 48 30", "M 48 30 Q 62 42 74 30"]`. `waveSegments(-82, 178)` has 10 segments, and its 5th and 6th equal those two. `wavePath({x0:22,x1:74,baseY:30,sx:1,sy:1})` equals `"M 22 30 Q 34 18 48 30 Q 62 42 74 30"`. `layoutLights(n)` for n in 1..12 returns n points inside the water bounds, and no two points are closer than 60 units. `stars(10, 7)` is deep-equal across two calls.
- [ ] Run `npx vitest run tests/unit/mark.test.ts tests/unit/sea.test.ts`. Expected: FAIL (modules missing).
- [ ] Implement. `waveSegments` steps one segment at a time, starting from the canonical first segment and its control point (34,18), and reflects with `c' = 2p − c` going forward. Going backward it does the inverse.
- [ ] Re-run. Expected: PASS. Commit `feat(2026): mark geometry + sea generator for the holiday card`.

### Task 2: Draft plumbing

**Files:**
- Create: `website/src/data/year-2026.json` (`{ "noteApproved": false }`), `website/src/lib/year2026.ts`
- Modify: `website/src/layouts/BaseLayout.astro` (props `noindex?: boolean`; `<slot name="head" />` in `<head>`), `website/src/layouts/PageLayout.astro` (forward `noindex` and the `head` slot), `website/astro.config.mjs` (sitemap filter), `website/src/components/StickyCta.astro` (add `/2026`, `/2026/` to `SUPPRESS`)
- Test: `website/tests/unit/year2026.test.ts`

**Interfaces:**
- Produces: `robotsFor(noindex: boolean): string`, returning `"noindex, nofollow"` or `"index, follow, max-image-preview:large"`.
- Produces: `isYear2026Path(pathname: string): boolean`, true for `/2026` and `/2026/`.
- Produces: `NOTE_APPROVED: boolean`, read from the JSON.

- [ ] Test the outputs of `robotsFor`, and `isYear2026Path` for `/2026`, `/2026/`, `/blog/2026-x` (false) and `/` (false).
- [ ] Implement. `astro.config.mjs` reads the JSON with `fs` and passes `sitemap({ filter: p => approved || !/\/2026\/?$/.test(new URL(p).pathname) })`.
- [ ] `npx vitest run` passes. Commit `feat(2026): draft flag — noindex, sitemap exclusion, head slot`.

### Task 3: Holiday card component

**Files:** Create `website/src/components/year/HolidayCard.astro`.

**Interfaces:**
- Consumes: Task 1 exports and `getCollection("team")` sorted by `order`.
- Props: `{ crew: { name: string }[] }`.

- [ ] SVG `viewBox="0 0 800 1000"`, `aria-hidden`. It contains a sky gradient, `stars(40, 2026)`, and the horizon `<g>` holding the canonical mark at center (400, 440) with scale 2.1. The brackets use `D_LEFT`/`D_RIGHT` and the horizon segments come from `waveSegments(-82, 178)`. It also has 12 sea lines from `wavePath` and one light per crew member from `layoutLights`.
- [ ] Names go in an HTML `<ol aria-label="Eight lights on the water, one for each of us">`, positioned by `%`, with the greeting overlaid in the sky and a Pause/Play button (`aria-pressed`) and a Replay button below.
- [ ] CSS has a final state by default, with `.is-pending` as the intro start state and `.is-playing` running the timeline (brackets open at 0.6s, segments at 1.0s + 0.08s·|k|, horizon flattens at 2.0s, sea lines at 2.4s+, lights at 3.4s + 0.18s·i, greeting at 4.8s). Ambient drift runs on `@media (prefers-reduced-motion: no-preference)` only, and `.is-paused` pauses everything.
- [ ] Inline JS: if motion is allowed, add `.is-pending`; an IntersectionObserver at 0.35 adds `.is-playing` once. Replay toggles the classes off and on, and drift pauses when the card is off screen.

### Task 4: The /2026 page

**Files:** Create `website/src/pages/2026.astro`, `website/src/data/year-2026.ts` (all copy + figures), `website/tests/e2e/year-2026.spec.ts`.

- [ ] Sections in order: hero (with a "ship's log" table of contents) → 01 Certified → 02 New hands on deck → dusk band → 03 A new home port → 04 Instruments → 05 Mission Design Library → numbers strip → card + DRAFT note.
- [ ] e2e: status 200; `h1` contains "OCEANS"; `meta[name=robots]` has `noindex`; 8 `li` under the card list, matching team names; text "DRAFT" is visible; at 320px, `scrollWidth <= clientWidth`; with `reducedMotion: 'reduce'` the first label has computed opacity 1; with JS disabled the first label has opacity 1; clicking Pause sets `aria-pressed="true"`.
- [ ] Run `npm run build && npx playwright test tests/e2e/year-2026.spec.ts`. Expected: PASS. Commit `feat(2026): year-in-review page + holiday card`.

### Task 5: OG image, review packet, verification

**Files:** Create `website/scripts/og-2026.mjs`, `website/public/og-2026.png`, `docs/year-2026/review-packet.md`.

- [ ] The OG script builds a 1200×630 HTML page in og-team style (brass mark, mono eyebrow, Cormorant title, sea + lights on the right, footer rule) and screenshots it with Playwright Chromium.
- [ ] The packet holds the beat list, every line of copy, the DRAFT note, the 3–4 sentence email, a table of figures with their sources, items to confirm, and the launch checklist.
- [ ] Check contrast for every text/background pair used (a script prints the ratios; all ≥ 4.5, or ≥ 3 for large text). Run `npm run check` and `npm run build`, then take desktop (1440) and phone (390) screenshots.
- [ ] Commit `docs(2026): review packet + OG image`.

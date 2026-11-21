# OCEANS, 2026 — review packet

For Aous to take to Danny. The page lives at `/2026` on branch
`claude/ocean-2026-e7e88a`. It is not merged, not linked from the nav, marked
noindex and kept out of the sitemap. Target: approved by about Dec 5, sent mid-December.

To view it locally:

```bash
cd website && npm install && npm run dev
```

Then open <http://localhost:4321/2026>.

---

## 1. Beats (confirmed by Aous, 2026-11-21)

| # | Beat | Source in the repo |
|---|---|---|
| — | Hero: "OCEANS, 2026." Year fourteen | Founding year 2012, site-wide (`about.astro`) |
| 01 | Certified: SBA VetCert, SDVOSB + VOSB | Badges added `2a29b82` (2026-11-12) |
| 02 | New hands on deck: Mike Matechak, Daniel Trimper, Aaron Winkler, Russell Croft | Added to `/team` `865d106`, `3c9b783`, `a9807da` (Jun–Aug 2026) |
| 03 | A new home port: the relaunched site, the `[~]` mark, the Journal, the Mission Network | `854966a` (Mariner + `[~]` locked 2026-06-24); DNS off Wix July 2026 |
| 04 | Instruments: SKYWATCH + ATLAS, live, free, no login | `/apps`, `f554d0a` (2026-10-05) |
| 05 | Mission Design Library | `9409e4f` (2026-10-26); the site calls it a concept preview |
| ~ | The card: the `[~]` becomes water, one light per person on `/team`, a DRAFT note from Danny | `src/content/team/` (8 people) |

## 2. Page copy, every line

**Hero**
- Eyebrow: YEAR IN REVIEW
- Title: **OCEANS, 2026.**
- Lede: *Our fourteenth year out of Jacksonville. Five moments from it, and a card to close it out.*
- Ship's log (table of contents): Certified · New hands on deck · A new home port · Instruments · The library · The card

**01 · Certified**
- **Certified, officially.**
- OCEANS is certified through the SBA's VetCert program as both a Service-Disabled
  Veteran-Owned Small Business and a Veteran-Owned Small Business. It puts on paper what
  has been true since 2012: a company co-founded and led by a Navy veteran, now eligible
  for SDVOSB and VOSB set-asides.
- The two SBA badges, as supplied.

**02 · Crew**
- **New hands on deck.**
- The roster grew. Four people we're glad to sail with, bringing growth strategy,
  enterprise architecture, frontend engineering and cloud infrastructure to the work.
- Cards: Mike Matechak (Executive Growth Advisor), Daniel Trimper (Sr. Solutions
  Architect), Aaron Winkler (Senior Frontend Architect), Russell Croft (Sr. Cloud
  Architect). Link: Meet the whole crew →
- No join date is stated, because Mike's own bio says he officially joined in 2025.

**03 · Home port**
- **A new home port.**
- oceansllc.com relaunched this summer, under a new mark: a wave, held in brackets. The
  site now carries the Journal, where our team writes about the work, and the Mission
  Network, an interactive map of how our services, partners and people connect.
- Links: oceansllc.com → · The Journal → · The Mission Network →

**04 · Instruments**
- **Instruments you can steer by.** (the `/apps` page's own line)
- Two tools of our own, live on the open web. Free, no login, and every number traceable to its source.
- SKYWATCH, Counter-UAS Incident Atlas: *Every FAA drone sighting report since 2016, mapped
  against the infrastructure that matters.*
- ATLAS, Traceability & Lossiness Analysis: *Requirement to hardware, and everything lost on the way.*

**05 · The library**
- **We opened the Mission Design Library.**
- Practice system-design problems drawn from federal missions, worked the way we would
  work them: requirements with thresholds, trade-offs, and the ATO and privacy layer that
  shapes a federal design. 5 problems so far, the first with a full write-up.
- The five problem titles, each linked.

**By the numbers:** 14 years since we started, in 2012 · 2 apps live on the open web · 5
problems in the Mission Design Library · 7 essays in the Journal

**The card**
- Section eyebrow: TO CLOSE THE YEAR
- On the card: SEASON'S GREETINGS · *Calm seas, bright lights.* · one light and name for
  each of the 8 people on `/team` · *Happy holidays from all of us at* OCEANS
- Buttons under the note: Visit oceansllc.com → · Get in touch

## 3. Danny's note: DRAFT, NOT HIS WORDS

These are placeholder words for Danny to rewrite or approve. On the page they sit
inside a dashed frame with a DRAFT badge until the launch flag flips.

> To our clients, partners and crew:
>
> Thank you. This year brought OCEANS new certifications, new teammates, a new home on
> the web, and tools we built to show how we work.
>
> None of it happens without the people who trust us with their missions, and the people
> who carry them out.
>
> Happy holidays from all of us. We'll see you in 2027.
>
> Danny
> Daniel Brent · CEO, OCEANS LLC

Edit in `website/src/data/year-2026.ts` → `note`.

## 4. Email for Danny to send: DRAFT

**Subject:** OCEANS, 2026

> As 2026 wraps up, we put together a short look back at the year at OCEANS: our SBA
> certifications, the people who joined us, and the tools we've put on the open web. It
> ends with a small card from all of us: https://www.oceansllc.com/2026. Thank you for
> being part of our year, and happy holidays.
>
> Danny

## 5. Figures and where each comes from

| Figure | Value | Source | Confirm? |
|---|---|---|---|
| Years | 14 | 2026 − 2012; 2012 is the founding year in Danny's bio and on the site (`7860e7e`) | ☐ |
| Live apps | 2 | `/apps`: SKYWATCH and ATLAS, both marked Live | ☐ |
| Design problems | 5 | `src/data/mission-design.ts` → `problems.length` | ☐ |
| Journal essays | 7 | Non-draft posts in `src/content/blog/` | ☐ |
| Lights on the card | 8 | People in `src/content/team/` | ☐ |
| FAA reports "since 2016" | — | `/apps` copy ("Every FAA drone sighting since 2016") | ☐ |

Every figure is computed from repo content at build time, except "2016", which is
copied from `/apps`. To drop the numbers strip, delete the `By the numbers` section in
`website/src/pages/2026.astro`.

## 6. Still to confirm with Danny (or Aous)

1. **Did the VetCert certification itself come through in 2026?** The badges went on the
   site in November. The page never states a date, but placing it in a 2026 review
   implies the certification is new this year.
2. **Mike Matechak** is under "New hands on deck". His bio says he officially joined in
   2025, so the copy avoids "joined this year".
3. **Card lights = the 8 people on `/team`.** If OCEANS has staff who aren't on the
   site, a card sent to the team would leave them out. Add them to `/team`, or say so,
   and the lights follow the roster automatically.
4. **"co-founded and led by a Navy veteran"** comes from Danny's bio ("U.S. Navy veteran
   … since founding the company in 2012") and the About page ("co-founded in 2012").
5. **Name:** the page says "OCEANS, 2026" (brand and site use OCEANS), not "Ocean, 2026".
6. **Danny's note and the email:** both are drafts.

## 7. Quality checks (run 2026-11-21)

- **Unit** (`npx vitest run`): 30 new and existing tests pass. The mark geometry in
  `src/lib/mark.ts` is pinned to `Logo.astro`, and the sea is checked to contain the
  canonical tilde exactly. The 3 failures in `tests/unit/theme.test.ts` were already
  there: that test still expects Operator as the default theme.
- **E2E** (`npx playwright test tests/e2e/year-2026.spec.ts`): 8/8 pass. Covers noindex,
  the DRAFT badge, lights vs roster, not linked from the nav, no horizontal scroll at
  320 and 390px, pause/replay, reduced motion (finished card, still, no controls) and JS off
  (finished card).
- **Layout shift:** CLS 0.004 desktop (from the font swap), 0 phone. LCP is the h1.
- **Weight:** HTML 23 KB gzipped (the card's SVG is 31 KB raw), about 775 KB total with
  images and fonts. No new npm dependencies, and one extra font (IBM Plex Mono) on this
  page only.
- **Contrast:** every text/background pair is AA (table below). Small brass text on the
  light half uses `#7A5A22` instead of Mariner's `#8C6A2C`, which only reaches 4.53:1
  on Fog and fails on the slightly darker section backgrounds.

| Text | FG | BG | Ratio | Needs |
|---|---|---|---|---|
| Hero eyebrow / "2026." / links | `#155C91` | `#EEF5FA` | 6.42 | 4.5 |
| Hero lede | `#0A2942` | `#EEF5FA` | 13.54 | 4.5 |
| Brass labels, light half | `#7A5A22` | `#E1ECF5` | 5.29 | 4.5 |
| Muted mono, light half | `#4A6480` | `#F6F9FC` | 5.80 | 4.5 |
| Body, night half | `#EBE3D0` | `#0B1F3A` | 12.92 | 4.5 |
| Brass labels, night half | `#D4A24A` | `#0B1F3A` | 7.13 | 4.5 |
| Sky labels, night half | `#7FB8E0` | `#0D2948` | 6.89 | 4.5 |
| Card name labels | `#EBE3D0` | `#0A2341` | 12.36 | 4.5 |
| Draft note text | `#EBE3D0` | `#102131` | 12.80 | 4.5 |
| Draft badge | `#061A30` | `#D4A24A` | 7.57 | 4.5 |
| Visit button | `#061A30` | `#7FB8E0` | 8.21 | 4.5 |

## 8. Launch checklist

1. Danny rewrites or approves the note → replace `note` in `website/src/data/year-2026.ts`.
2. Settle the open items in section 6.
3. Set `"noteApproved": true` in `website/src/data/year-2026.json`. That removes the
   DRAFT frame and noindex, and adds `/2026` to the sitemap.
4. If the card changes: `npm run build && node scripts/og-2026.mjs` to refresh
   `public/og-2026.png`. Optionally copy it to the brand pack's `og-images/`.
5. Optional: link `/2026` from the nav or the home page (Aous's call).
6. Merge to `main`, which deploys to production on Cloudflare Pages.
7. Danny sends the email mid-December.

# OCEANS, 2026: year in review + holiday card (design)

Status: approved by Aous 2026-11-21 ("Beats look right"). Short design.

## Intent

A scrolling page at `/2026` that Danny sends to clients, partners and the team in
mid-December. It walks through the year in five short beats and ends on an
animated holiday card. It is also meant to show Danny and Paul what the site and
brand can do beyond what has already shipped.

## Beats (approved)

1. **Certified.** SBA VetCert: SDVOSB and VOSB (badges as supplied).
2. **New hands on deck.** Daniel Trimper, Aaron Winkler, Mike Matechak, Russell Croft.
   The copy does not claim a join date, because Mike's bio says he joined in 2025.
3. **A new home port.** The relaunched oceansllc.com, the `[~]` mark, the Journal and the Mission Network.
4. **Instruments.** SKYWATCH and ATLAS on /apps, live, free, no login.
5. **Mission Design Library.** "Opened", because the site labels it a concept preview.
6. **The card.** The `[~]` becomes water, one light per teammate on /team (8), a DRAFT note from Danny.

A small numbers strip (years, live apps, design problems, essays) is computed from
repo content and listed for confirmation in the review packet.

## Goals / non-goals / anti-goals

- Goals: short and confident; reads well on a phone; AA contrast; honors reduced
  motion; fast; no layout shift; public-safe.
- Non-goals: no nav link, no merge to main, no new dependencies.
- Anti-goals: invented words presented as Danny's; any program, contract or
  customer detail the site doesn't already publish; figures without a source;
  scroll-jacking; a mark redrawn by eye.

## Approaches considered

- **Plain scrolling page, one section per beat, day-to-night palette (picked).**
  Sturdy on phones, works without JS, and reuses the site's existing scroll-reveal.
- Pinned scrollytelling (a sticky stage where beats swap as you scroll). More
  cinematic, but it fights touch scrolling and assistive tech, and it costs more for
  a page that will be seen once.
- Click-through slides. Not what was asked for, which was a scrolling page.

For the card:
- **SVG and CSS, server-rendered (picked).** The finished frame is in the HTML, so it
  works with no JS and under reduced motion, and the animation is compositor-only
  transforms and opacity. Its geometry comes straight from Logo.astro's path strings.
- Canvas 2D. Needs JS for any frame and per-frame drawing work.
- WebGL. Too heavy for the job.

## Design

- **Palette by section:** daylight Fog for the hero, Certified and Crew → a
  decorative dusk band → night Navy for Home port, Instruments and Library → the card
  at Navy Deep. Text is navy on the light half and cream on the dark half. Every
  pair is checked for AA.
- **The card is a portrait 4:5 "greeting card"** (one viewBox at every size, so the
  HTML name labels line up). The canonical `[~]` sits on the horizon. The brackets
  open out and fade, the wave repeats itself outward using the path's own `T`
  continuation, the horizon flattens, sea lines rise, then eight brass lights
  appear with names, then the greeting. The waves keep drifting slowly. A
  Pause/Play control covers WCAG 2.2.2, and there is a Replay control.
- **Draft safety:** one flag in `src/data/year-2026.json` (`noteApproved: false`).
  While it is false, the note sits in a visible DRAFT frame, the page is noindex, and
  `/2026` is left out of the sitemap. Not linked in the nav, the ⌘K index or the
  sticky CTA.
- **Fonts:** IBM Plex Mono loads on this page only, through a new `head` slot.
- **OG image:** 1200×630 in the og-images style, rendered with Playwright from
  the same sea geometry, at `public/og-2026.png`.
- **Review packet:** `docs/year-2026/review-packet.md` holds every line of copy,
  the draft note, the email, the figures and their sources, and the launch checklist.

## Left to the builder

Exact copy wording (it goes to Aous in the packet), light positions, timings.

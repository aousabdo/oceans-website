# OCEANS LLC Website Redesign — Design Spec

**Date:** 2026-05-11
**Status:** Approved for implementation planning
**Owner:** Aous Abdo (internal lead)
**Decision-maker:** Danny (company owner) — picks one of three themes
**Replaces:** [oceansllc.com](https://www.oceansllc.com/) (Wix), plus prior `website/oceans-mockup.html`

---

## 1. Purpose

Rebuild the OCEANS LLC corporate website off Wix onto a modern, expansion-ready static stack. Deliver **three distinct visual themes** for the company owner to choose from. Ship a site that materially upgrades brand presentation, supports recruiting (careers + resume submission) and thought leadership (blog), and scaffolds for future growth without rewriting the foundation.

### Success criteria
- Three meaningfully different theme directions are presentable to the owner side by side.
- The chosen theme can become canonical without rewriting components — only design tokens swap.
- All P0 pages (Section 4) ship before launch; P1 pages ship within 2 weeks of launch; P2 pages are scaffolded but not built.
- Resume submission accepts a PDF and reliably notifies `info@oceansllc.com`.
- Lighthouse: Performance ≥ 95 mobile, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- Site passes WCAG 2.1 AA on the chosen theme.

### Non-goals
- A heavy CMS for day 1. Content lives in MDX/YAML in the repo; a Git-based CMS layer can be added later.
- Application portal / ATS replacement. Resume submission delivers to email; a Greenhouse/Lever-style ATS is out of scope.
- Authenticated areas, client portals, dashboards.
- Internationalization translations day 1 (i18n routing scaffold is allowed but no second locale).

---

## 2. Theme strategy

The site ships with one design system per theme. All three are built; the owner picks one to be canonical for production. The other two remain in the repo as named branches/preview deploys for reference.

### 2.1 Theme 1 — The Operator

**Personality:** "We are operators. We ship signal in the noise."
**Reference DNA:** Palantir, Anduril, Shield AI, Scale AI.

**Palette (locked — "Slate Operations", V2):**

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#1A2840` | Page background — slate navy |
| `--surface` | `#253553` | Card / panel surface |
| `--surface-2` | `#314466` | Elevated surface, hover state |
| `--fg` | `#EAF2FB` | Body text |
| `--fg-strong` | `#F8FBFF` | Headings |
| `--muted` | `#9AB4D0` | Secondary text, labels |
| `--accent` | `#5BD4FF` | Signal cyan — primary accent |
| `--accent-go` | `#5EE6B8` | Mint, "all systems go" |
| `--accent-warn` | `#FFB454` | Amber alert |
| `--accent-critical` | `#FF6B6B` | Critical / error |
| `--border` | `rgba(91,212,255,0.18)` | Hairline borders |

**Typography:**
- Display: **Syne** (700–800, geometric)
- Body: **IBM Plex Sans** (300–500)
- Mono: **IBM Plex Mono** (data labels, eyebrows, system text)

**Motion vocabulary:**
- Particle wave field canvas in the hero
- Custom cursor (dot + tracking ring)
- Marquee scrolling capability ticker
- Section enters: fade-up with slight Y-translate
- Hovers: scan-line sweep + glow border on cards
- Page transitions: fast, technical

**Imagery direction:**
- Schematic diagrams, wireframe topographies, telemetry overlays
- B&W operational photography only — no stock photos
- Vector ornament: monospace ASCII micro-symbols

### 2.2 Theme 2 — The Institute

**Personality:** "We are the rigorous adults in the room."
**Reference DNA:** RAND Corporation, MIT Lincoln Laboratory, Mitre, Stripe Press.

**Palette (locked — "Editorial Cream"):**

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#F4F1EC` | Page background — warm off-white |
| `--surface` | `#FFFFFF` | Article / panel surface |
| `--surface-2` | `#EDE7DC` | Subdued surface |
| `--fg` | `#1A2333` | Body ink |
| `--fg-strong` | `#0F1626` | Headings |
| `--muted` | `#5A6478` | Secondary ink |
| `--margin` | `#7A6E5A` | Margin notes / Roman numerals |
| `--accent` | `#1A4477` | Federal blue (primary accent) |
| `--accent-warm` | `#B8924A` | Brass (restrained warm) |
| `--accent-sage` | `#5E7A6B` | Sage (rare positive state) |
| `--border` | `rgba(26,35,51,0.13)` | Hairline rules |

**Typography:**
- Display: **Tiempos Headline** (or **GT Sectra** as fallback) — high-contrast serif
- Body: **Inter** (or **Söhne**) — neutral sans
- Mono: **Söhne Mono** (data figures, footnotes)

**Motion vocabulary:**
- Near-zero motion. Only fade-in on scroll. No marquees, no cursor effects.
- Hairline rules animate in on section enter.
- Page transitions feel like turning a journal page.

**Imagery direction:**
- B&W reportage photography, deliberate crops with generous white margins
- Single-color technical line illustrations (drawn for the site, not stock)
- Subtle paper-grain texture in archival sections
- Drop caps, pull quotes, footnotes, endnotes as native elements

### 2.3 Theme 3 — The Mariner

**Personality:** "We are a brand. The name means something."
**Reference DNA:** Patagonia, Saildrone, J.Crew sailing collection, Hinckley Yachts, premium contemporary maritime brands.

**Palette (locked — "Open Sky", cool light mode):**

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#EEF5FA` → `#F4F9FC` | Page background — sky-to-foam vertical gradient |
| `--surface` | `#FFFFFF` | Card surface |
| `--surface-2` | `#E4EEF5` | Subdued surface, hover state |
| `--fg` | `#0A2942` | Body — deep navy ink |
| `--fg-strong` | `#061A30` | Headings |
| `--muted` | `#4A6480` | Slate-blue muted text |
| `--accent` | `#1A6FAB` | Ocean blue — primary accent |
| `--accent-2` | `#7FB8E0` | Light sky blue — tertiary |
| `--accent-warm` | `#B8924A` | Brass — warm secondary, sparing |
| `--accent-deep` | `#0A2942` | Deep navy for emphasis sections / inverse blocks |
| `--border` | `rgba(26,111,171,0.18)` | Hairline borders |

**Typography:**
- Display: **Cormorant Garamond** (300–400) and/or **Fraunces** with optical sizing
- Body: **Inter**
- Accent serif italic for eyebrows and asides

**Motion vocabulary:**
- Slow ease curves (oceanic, long durations)
- Parallax depth layers in hero
- Hero contains a looping cinematic maritime video — bright open water, sky-and-sea, above-deck
- Hover: subtle ripple/water-refraction effect on cards
- Section dividers: scroll-bound wave lines (in `--accent` ocean blue, with `--accent-warm` brass as occasional highlight)
- Page transitions: drift / slow fade

**Imagery direction:**
- Bright, atmospheric maritime photography — open water, sky and sea, above-deck scenes
- Compass and depth-sounding ornamentation rendered in ocean-blue line work (brass reserved for emphasis)
- Photographic emphasis on horizon, sail, instrumentation, weather
- No vintage / archival textures — Open Sky is contemporary, not nautical-nostalgic

**Why Open Sky and not the prior Sailcloth & Brass:** The first revision used warm cream (`#F4EDDD`), which read too close in temperature to Institute's warm cream and risked Danny seeing "two cream sites and a dark one." Open Sky shifts Mariner to a **cool** light palette, putting the three themes on a clear lightness *and* temperature spectrum: cool-dark (Operator) → warm-light (Institute) → cool-light (Mariner). Same Mariner personality (Cormorant, slow oceanic motion, brand-led), recoloured.

### 2.4 Why these three diverge meaningfully

At a glance the three sit on a clear **lightness *and* temperature spectrum**:

| Theme | Lightness | Temperature | One-word read |
| --- | --- | --- | --- |
| Operator | Dark | Cool | Slate |
| Institute | Light | Warm | Cream |
| Mariner | Lighter | Cool | Sky |

Two cool themes (Operator, Mariner) sit at opposite ends of the lightness axis. The warm cream Institute sits between them. No two themes share both axes, so they're distinguishable at thumbnail size. Beyond palette, each owns its own personality:

- **Operator** — tactical, mono-typed, kinetic; particle hero, scan-line hovers, signal-cyan accents.
- **Institute** — editorial, serif display, near-zero motion; drop caps, footnotes, paper grain.
- **Mariner** — brand-led, oceanic, atmospheric; slow motion, open-water photography, compass ornament.

This is the trio the spec was iterated to produce. Two earlier candidates were retired:
- *Mariner Sailcloth & Brass* (warm cream) — retired because it sat too close in temperature to Institute.
- *Mariner Underwater Gradient* (dark navy + cyan-light) — retired because it sat too close to Operator.

---

## 3. Information architecture

Pages are uniform across themes. Only the homepage diverges in section count and ordering (Section 5). Everything else shares structure and only re-skins visually.

### 3.1 Sitemap

```
/                                  Home (theme-divergent)
/services                          Services index
/services/requirements             Requirements Development
/services/systems-engineering      Systems Engineering & Architecture
/services/rdte                     Research, Development, Test & Evaluation
/services/mission-data             Mission Data, COPs & Ontologies
/experience                        Relevant Experience (case studies)
/experience/[slug]                 Case study detail
/about                             About + values + story
/team                              Leadership + team
/careers                           Open roles + general resume submission
/careers/[slug]                    Role detail + apply form
/blog                              Blog index (tag filter)
/blog/[slug]                       Blog post
/contact                           Contact form + address + CAGE/NAICS
/capabilities                      Capabilities Statement (HTML mirror + PDF link)
/privacy                           Privacy policy
/terms                             Terms of use
/404                               Designed 404
```

### 3.2 Priority

| Priority | Meaning |
| --- | --- |
| **P0** | Ships at launch |
| **P1** | Ships within 2 weeks of launch |
| **P2** | Scaffolded but not built — phase 2 |

**P0:** Home, Services index + 4 detail pages, Experience index, About, Team, Careers index (with general resume submission), Role detail pages (with per-role apply form), Blog index + post, Contact, 404.

**P1:** 2–3 seed case studies, Capabilities Statement page, Privacy + Terms, RSS feed for blog, image-optimized assets, OG cards, designed 404 + 500.

**P2:** Press/News (`/press`), Resources/Whitepapers (`/resources`), Pagefind search, i18n locale switcher, Git-based CMS (Keystatic or TinaCMS), newsletter integration.

### 3.3 Navigation

Primary nav (in order): Services · Experience · About · Team · Careers · Blog · Contact.

Footer columns: Services · Company · Resources · Contact. Footer also carries CAGE/NAICS/UEI, social links, capabilities-statement download CTA, and last-updated timestamp.

---

## 4. Component inventory

Components live in `src/components/` and are theme-agnostic — they read CSS variables and theme attributes. Some components have **theme-only variants** for things that don't translate (e.g., Operator's terminal cursor, Mariner's underwater video hero).

### 4.1 Shared (all three themes)

- `Nav` — fixed top, backdrop-blur on scroll, active-section state
- `Footer` — column grid, social, capabilities CTA
- `SectionLabel` — small uppercase eyebrow + leading rule
- `Eyebrow` — mono/serif/italic per theme
- `Button` — primary, outline, ghost; same prop interface across themes
- `Card` — base card with hover state and optional accent edge
- `ServiceCard` — capability tile (4 used on home, full grid on Services index)
- `CaseStudyCard` — past performance card
- `RoleCard` — careers listing tile
- `BlogPostCard` — blog index tile (compact + expanded)
- `Hero` — theme-specific variants (see 4.2)
- `MarqueeStrip` — capability/tech ticker (Operator only)
- `Pipeline` — methodology diagram
- `Tag` / `Badge`
- `FormField`, `Form`, `FileUpload`, `Turnstile`
- `ImageWithCaption` — used in Institute and Mariner
- `PullQuote` — Institute primary, Mariner secondary
- `Stat` — numeric callout
- `LogoGrid` — client/agency logos
- `ThemeSwitcher` — preview-only utility for the theme selection phase (removed before production)

### 4.2 Theme-only components

| Theme | Component | Purpose |
| --- | --- | --- |
| Operator | `ParticleHeroCanvas` | Wave-field canvas behind hero |
| Operator | `CustomCursor` | Dot + tracking ring cursor |
| Operator | `ScanLineHover` | Animated underline used on Card hover |
| Institute | `DropCap` | First-letter treatment for article intros |
| Institute | `Footnote`, `Endnotes` | Article footnotes with numbered refs |
| Institute | `FigureCaption` | Captioned single-color illustration |
| Mariner | `MaritimeVideoHero` | Looping cinematic video hero |
| Mariner | `RippleHover` | Card hover ripple effect |
| Mariner | `WaveDivider` | Scroll-bound SVG wave between sections |
| Mariner | `Compass` | Compass/pelorus ornament glyph |

### 4.3 Theming mechanism

A single `data-theme="operator|institute|mariner"` attribute on `<html>` flips the entire site. CSS variable sets are defined in `src/styles/themes/{operator,institute,mariner}.css` and imported by `src/styles/global.css`. Tailwind reads from these variables via theme extension (`tailwind.config` `theme.extend.colors` mapped to `var(--…)`).

For the selection phase, all three themes are deployed as preview branches:
- `main` → canonical theme (after Danny picks)
- `theme/operator`, `theme/institute`, `theme/mariner` → preview deploys (Cloudflare Pages previews)

After selection: merge chosen branch to `main`, archive the other two.

---

## 5. Homepage wireframes

The homepage is where the three themes diverge most aggressively. Sub-pages share structure (Section 6).

### 5.1 Operator homepage

1. **Hero** — particle wave canvas; mono eyebrow; large display title with one stroke-only word; sub-copy; primary CTA "Explore Capabilities" + outline CTA "Download Capabilities Statement"; stats column right; "Scroll" indicator
2. **Capability marquee** — full-width ticker of services + tech stack
3. **Capabilities** — 4-up grid of numbered (01–04) scan-cards; hover scan-line; mono tags
4. **Methodology** — vertical 5-step pipeline diagram + traceability list right
5. **Past performance** — 3-up case-study grid with badges; "Request Full Past Performance" CTA
6. **Leadership** — 2-up founder cards, terminal-style metadata
7. **CTA band** — bold mono caps "BRING RIGOR TO YOUR PROGRAM"; primary + outline CTAs; CAGE/NAICS micro-strip
8. **Footer** — 4-column

### 5.2 Institute homepage

1. **Masthead** — full-width B&W photograph with overlaid serif headline + drop-cap intro
2. **On Defensible Engineering** — ~150-word founder essay with signed pull quote
3. **Capabilities** — four editorial "page spreads," one per capability (Roman numeral + title + abstract + methods)
4. **Methodology** — single-color line-art figure with caption "Fig. 1: Engagement lifecycle"
5. **Client register** — quiet single-row logo list bordered by hairline rules
6. **Recent thinking** — 3 latest blog posts styled as journal articles
7. **Leadership** — B&W portraits with signed-name treatment
8. **Correspondence** — restrained "Begin a conversation" CTA, address presented like a letter
9. **Colophon footer** — type credits, last-updated, "Set in Tiempos & Inter"

### 5.3 Mariner homepage

1. **Hero (Depth 01)** — full-bleed cinematic maritime video — bright open water, sky and sea, above-deck (Open Sky is cool light mode — no underwater, no archival); slow serif statement "Depth. Discipline. Direction."; compass-glyph nav
2. **Depth 02 — "What we make possible"** — single emotional statement leading into capability area
3. **Depth 03 — Capabilities as compass headings** — 4-up cards labeled N · NE · E · SE with brass line work and ripple-on-hover
4. **Depth 04 — Journey** — horizontal sideways scroll telling the 5-stage methodology as a maritime journey
5. **Depth 05 — Past performance** — client logos arranged as constellation points on a brass navigation chart
6. **Depth 06 — Voices** — testimonials placed over still maritime photographs
7. **Depth 07 — Founders at the dock** — environmental portraits with maritime typography for bios
8. **Depth 08 — "Plot a course"** — wave-curtain CTA with drift hover
9. **Depth 09 — Wave-divider footer** — tide-line at top, links, social, signature

---

## 6. Sub-page structures (uniform across themes)

### 6.1 Services index
Hero → 4-capability grid → "How we work" methodology link → CTA. Each card links to detail.

### 6.2 Service detail (4 pages, same template)
Hero with capability number → Overview → "What this looks like in practice" methods list → "Recent engagements" linked case studies → CTA.

### 6.3 Experience index
Hero → Filter chips (domain, agency, year) → Case-study card grid → CTA.

### 6.4 Case study detail
Hero (client, title, year, outcome) → Challenge → Approach → Outcome → Sanitized metrics → Related capabilities → CTA.

### 6.5 About
Hero → Founder story (long-form) → Values (4-up) → Locations + contact → Leadership preview → CTA.

### 6.6 Team
Hero → Leadership grid (large) → Team grid (compact) → "We're hiring" CTA → Footer.

### 6.7 Careers index
Hero → Why OCEANS (3 values) → **Open roles** grid (RoleCard) → **General application** block (drop-in resume form) → FAQ → Footer.

### 6.8 Role detail
Hero (title, location, level, type) → About the role → Responsibilities → Qualifications → Bonus qualifications → **Apply form** (name, email, phone, LinkedIn, cover note, PDF upload, Turnstile) → "Or send to careers@oceansllc.com".

### 6.9 Blog index
Hero → Tag filter strip → Featured post → Recent posts grid → Subscribe (P1) → Footer.

### 6.10 Blog post
Article hero (title, author, date, read time, tags) → MDX body → Author card → Related posts → Subscribe → Footer.

### 6.11 Contact
Hero → Two-column: left (address, phone, email, CAGE, NAICS, UEI), right (contact form with subject categories + Turnstile) → Map (P1).

### 6.12 Capabilities Statement
HTML mirror of the printed one-pager with a "Download PDF" button. The PDF is generated from the same content via a build step.

---

## 7. Tech stack

### 7.1 Locked decisions

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | **Astro 4** + TypeScript | Static-first, MDX-native, content collections, zero-JS default, partial hydration islands |
| Styling | **Tailwind CSS** + CSS-variable theme tokens | Tokens enable one-attribute theme swap; Tailwind keeps authoring fast |
| Hosting | **Cloudflare Pages** | Free tier covers it; Pages Functions for forms; fastest global CDN |
| Forms backend | **Cloudflare Pages Functions** + **Resend** (email) + **Cloudflare R2** (resume PDF) + **Cloudflare Turnstile** (anti-spam) | No vendor lock-in; full control; covers PDF uploads which third-party form services don't on free tiers |
| Analytics | **Cloudflare Web Analytics** | Cookie-less, no GDPR banner required |
| Content | **MDX** for blog posts; **YAML** content collections for jobs, team, services, case studies | No CMS day-1; "publish" = git commit; clean upgrade path |
| CI/CD | **GitHub Actions** → Cloudflare Pages | One workflow; branch deploys for theme previews |

### 7.2 Repository layout

```
/oceans-website/
├── website/                    Astro app
│   ├── src/
│   │   ├── components/         Shared + theme-only components
│   │   ├── content/            MDX (blog) + YAML (jobs, team, services, case studies)
│   │   ├── layouts/            Page layouts
│   │   ├── pages/              File-based routes
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── tokens.css      Base CSS variables
│   │   │   └── themes/
│   │   │       ├── operator.css
│   │   │       ├── institute.css
│   │   │       └── mariner.css
│   │   └── lib/                Helpers, schemas
│   ├── functions/              Cloudflare Pages Functions
│   │   ├── api/contact.ts
│   │   ├── api/apply.ts        Resume upload handler
│   │   └── api/newsletter.ts   (P1)
│   ├── public/                 Static assets, OG images, favicons
│   ├── astro.config.mjs
│   ├── tailwind.config.ts
│   ├── content.config.ts       Content collection schemas
│   └── package.json
├── docs/
│   └── superpowers/specs/      This file
├── .github/workflows/
│   └── deploy.yml
└── README.md
```

### 7.3 External services

| Service | Purpose | Tier | Setup |
| --- | --- | --- | --- |
| Cloudflare account | Hosting + R2 + Turnstile + Analytics | Free | Pages project linked to GitHub |
| Resend account | Transactional email for form submissions | Free (3000/mo) | Verified sending domain (oceansllc.com) — SPF/DKIM/DMARC |
| Cloudflare R2 bucket | Resume PDF storage | Free up to 10 GB / 1M reads | One bucket: `oceans-applications` |
| Cloudflare Turnstile | Bot prevention on forms | Free | Sitekey embedded; secret in env |
| Google Fonts or Fontshare | Hosted typefaces (Syne, IBM Plex, Cormorant, Inter) | Free | Astro `<font>` integration |
| Tiempos / GT Sectra | Institute display serif (paid) | Paid foundry licence | Buy if Institute selected; otherwise free-font fallback |

### 7.4 Domain & DNS

- Apex `oceansllc.com` and `www.oceansllc.com` point to Cloudflare Pages
- Cutover plan: build site → preview deploy → DNS swap from Wix → soft-launch window. Wix data export captured beforehand.
- Email DNS (SPF, DKIM, DMARC) updated to authorize Resend for transactional sends.

---

## 8. Data flows

### 8.1 Contact form

```
User → POST /api/contact (Pages Function)
  ↳ Turnstile token verified server-side
  ↳ Resend → info@oceansllc.com (subject = category)
  ↳ Confirmation page (or inline success)
```

Fields: first name, last name, email, phone (optional), organization, subject category, message, Turnstile.

### 8.2 Resume submission (role-specific or general)

```
User → POST /api/apply (Pages Function, multipart/form-data)
  ↳ Turnstile token verified server-side
  ↳ PDF validated (mime, size ≤ 10 MB, content sniff)
  ↳ R2 PUT: applications/<role-slug>/<ulid>-<safe-filename>.pdf
  ↳ Resend → careers@oceansllc.com with metadata + signed R2 URL (7-day expiry)
  ↳ Confirmation page
```

Fields: name, email, phone, LinkedIn URL (optional), cover note, resume PDF, Turnstile, role slug (hidden if from role page; "general" if from careers index).

### 8.3 Blog publishing

```
Author writes MDX in /website/src/content/blog/<slug>.mdx
  ↳ Push to main branch
  ↳ GitHub Actions: install → build → deploy to Cloudflare Pages
  ↳ Post live, RSS regenerated
```

Schema (enforced by Astro content collection):

```ts
{
  title: string,
  slug: string,         // auto from filename
  date: Date,
  author: string,       // matches /team entry
  tags: string[],
  excerpt: string,
  hero?: ImageMetadata,
  draft?: boolean
}
```

### 8.4 Open roles

```
YAML file in /website/src/content/jobs/<slug>.yml
  ↳ Astro generates /careers index + /careers/[slug] pages at build
  ↳ Role detail wires apply form with hidden role slug field
```

---

## 9. Non-functional requirements

### 9.1 Performance
- Lighthouse mobile Performance ≥ 95 on home, services, blog index, blog post, careers.
- Largest Contentful Paint ≤ 2.0s on 4G.
- All images served as AVIF/WebP with responsive `srcset`. Hero videos (Mariner) lazy-loaded with poster image.
- No client JS shipped on pages that don't need it. Theme-only interactive components are islands.

### 9.2 Accessibility
- WCAG 2.1 AA on all P0 pages of the chosen theme.
- Color contrast verified per theme (cyan-on-slate, navy-on-cream, navy-on-sailcloth all already pass AA in body sizes).
- Keyboard navigable; visible focus rings respect each theme's accent.
- Custom cursor (Operator) MUST coexist with system cursor — implemented as visual overlay only.
- Reduced-motion preference disables marquees, parallax, ripple, particle field.

### 9.3 SEO
- Per-page meta titles + descriptions.
- OG / Twitter cards per page (auto-generated from frontmatter).
- `sitemap.xml`, `robots.txt`, structured data (`Organization`, `BreadcrumbList`, `Article` on posts, `JobPosting` on roles).
- Canonical tags. Open Graph image generation script for blog posts.

### 9.4 Security & compliance
- Forms validate input server-side; reject non-PDF uploads, oversized files, malicious filenames.
- R2 bucket is private; access via signed URLs only.
- Resend domain authentication (SPF/DKIM/DMARC).
- HTTPS-only; HSTS preload eligible.
- Privacy policy covers form data, analytics, third-party services.
- No third-party scripts beyond Cloudflare Web Analytics and Turnstile.

### 9.5 Browser support
- Last two versions of Chrome, Firefox, Safari, Edge.
- iOS Safari 15+, Android Chrome 100+.
- Graceful degradation on JS-disabled (content remains readable; forms hard-fail with mailto fallback).

---

## 10. Phasing

### Phase 0 — Setup (Week 1)
- Repo created, Astro scaffolded, Cloudflare Pages project linked, GitHub Actions deploying preview branches.
- Tailwind + theme tokens scaffold for all three.
- Shared component library skeleton.
- Content collection schemas defined.

### Phase 1 — Theme builds in parallel (Weeks 2–4)
- Each theme implemented on its own branch (`theme/operator`, `theme/institute`, `theme/mariner`).
- All P0 pages built on all three themes with seed content.
- Three preview-deploy URLs produced.

### Phase 2 — Owner selection (Week 5)
- Danny is shown all three preview deploys side by side.
- Selection captured. Chosen branch merged to `main`.
- Other two branches archived (retained for reference).

### Phase 3 — Hardening (Week 5–6)
- Real content replaces seed copy on the canonical theme.
- Photography/illustration finalized.
- P1 items shipped (case studies, capabilities, legal pages, RSS).
- A11y + perf audits, Lighthouse runs, manual QA across breakpoints.

### Phase 4 — Launch (Week 6)
- DNS cutover from Wix.
- Wix content archived.
- Post-launch monitoring window.

### Phase 5+ — Phase 2 work (post-launch)
- P2 features as needed: search, press section, CMS, i18n, newsletter integration.

---

## 11. Open questions (decisions to capture during implementation)

1. **Typography licenses.** Tiempos and GT Sectra (Institute display serif) are paid. Free fallbacks include EB Garamond, Source Serif, Newsreader. Decision deferred until theme selection.
2. **Photography sourcing.** Operator can use schematic/wireframe imagery (no photos needed at launch). Institute needs B&W reportage photography — license stock or commission. Mariner needs cinematic above-deck maritime imagery — license stock or commission.
3. **Existing client logo permissions.** Wix site shows DoD/DHS/ICE/CBP and others. Confirm each logo's use rights before reproducing.
4. **Founder photography.** Current Wix site has team portraits — confirm they can be re-used or commission new ones.
5. **Blog seed content.** At least 2–3 posts ready at launch. Source: founders, technical staff. Topics defined separately.
6. **Capabilities Statement source.** Where does the current PDF live? Likely needs a refresh once theme chosen.
7. **Email destination per form.** Currently assuming: contact → `info@oceansllc.com`, careers → `careers@oceansllc.com`. Confirm the careers alias exists or use `info@`.
8. **Cookie / consent banner.** Cloudflare Web Analytics is cookie-less, so we expect no banner. Confirm with legal once privacy policy is drafted.
9. **Press/news source.** Phase 2 — likely a tag filter on the blog.
10. **Newsletter platform.** Phase 2 — Buttondown vs. self-rolled R2/KV-backed list vs. ConvertKit.

---

## 12. Risks & mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Danny picks Institute but its paid serif licence isn't approved | Medium | Ship with free fallback (Newsreader) until licence is secured |
| Resume PDF uploads abused as spam vector | Medium | Turnstile + size limits + mime sniffing + rate limiting on the Pages Function |
| Cloudflare R2 free-tier exceeded by traffic | Low | Cost cap alerts; R2 paid-tier costs are pennies |
| Theme-only components diverge so far they break the shared design system | Medium | Strict prop interface for shared components; theme-only components are isolated and clearly named |
| Scope creep into "we should also build X" mid-implementation | High | This spec is the line. Anything not in P0/P1 goes to P2 backlog |
| Migration from Wix breaks SEO for ranked pages | Medium | Audit current ranked pages; add 301 redirects in Cloudflare for any renamed URLs |

---

## 13. Glossary

- **CAGE / NAICS / UEI** — federal contracting identifiers; appear in footer and capabilities statement.
- **COP** — Common Operating Picture.
- **CONOPS** — Concept of Operations.
- **RDT&E** — Research, Development, Test & Evaluation.
- **OT&E** — Operational Test & Evaluation.
- **TRL** — Technology Readiness Level.
- **Theme token** — a CSS custom property (e.g., `--bg`, `--accent`) whose value differs per theme.
- **Theme-only component** — a component used by only one theme (e.g., `ParticleHeroCanvas` in Operator).
- **Canonical theme** — the theme Danny chooses to become production; the other two are archived.

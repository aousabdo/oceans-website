# What we need from Danny — full checklist

Live as of last deploy. Group A = blocks launch. Group B = should-have before launch. Group C = nice-to-have.

---

## Group A — Blocks launch

### A1. Decide on the theme
**Where it lands:** which of the three preview URLs becomes the canonical site.

- `https://theme-operator.oceans-website.pages.dev` (defense-tech / mission console, dark)
- `https://theme-institute.oceans-website.pages.dev` (editorial / scientific, cream)
- `https://theme-mariner.oceans-website.pages.dev` (cinematic / brand-led, sky-light)

**Once decided:** I switch `main` to build the chosen theme + archive the other two branches.

---

### A2. Decide on the logo
**Where it lands:** Nav, Footer, favicon, OG card, capabilities statement header.

5 concepts at: `https://oceans-website.pages.dev/preview/logos`

**Once decided:** the favicon is already the chosen one (Concept 05 — Special-O); Nav + Footer + every page swap to the picked mark.

---

### A3. Federal identifiers
**Where they land:** `/capabilities` and `/contact` (currently show `[TBD]`).

Need from Danny:
- **CAGE Code** (5-character commercial/government identifier)
- **UEI** (12-character SAM.gov unique entity identifier)
- Confirm **business size status** (currently set to "Small Business")
- Confirm **NAICS codes** (currently set to 541330, 541715, 541512 — verify these are the primary 3)

**Files to update:** `src/pages/capabilities.astro` lines around `[TBD]`, `src/pages/contact.astro` lines 43, 45.

---

### A4. Resend domain verification + API key
**Why:** Currently the contact form returns success but does not deliver email. Once Resend is verified for `oceansllc.com`, the form delivers to `info@oceansllc.com`.

Steps (~10 min):
1. Sign up at resend.com (free 3000 emails/mo)
2. Add `oceansllc.com` as a verified domain
3. Add 3 DNS records to Wix's DNS panel (SPF + DKIM + MX bounce)
4. Generate API key, send it to me
5. I wire `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` as Cloudflare Pages secrets

Detailed walk-through is in our chat history.

---

### A5. LinkedIn account
**Currently linking to:** `linkedin.com/company/o.c.e.a.n.s.-llc` (per scraped Wix site)

**Confirm:** is this the active OCEANS LinkedIn? If you've moved to a different account, give me the URL and I'll update Footer + Contact + Schema-LD.

---

## Group B — Should-have before launch

### B1. Real case studies (sanitized)
**Currently 2 seed entries:**
- `dod-c2-ote.yml` — DoD Command & Control OT&E
- `dhs-sensor-architecture.yml` — DHS sensor integration

These are generic / safe placeholders pulled from the Wix scrape. For real launch, we want 3–5 actual engagements with:
- Real client (sanitized as needed)
- Real year
- Real challenge, approach, outcome narrative
- Sanitized metrics where allowed (e.g., "evaluated 12+ subsystems against 35 operational threshold criteria")

**Owner:** Danny + the two founders. Could be done as a 30-min interview session — I capture the narrative and write it up.

---

### B2. Open job postings
**Currently 2 seed entries** (matching the JD pattern we'd expect):
- Senior Systems Engineer (Jacksonville, FL, hybrid)
- Operational T&E Engineer (Jacksonville, FL, hybrid)

**Confirm:** are either of these actually open right now? Replace with real positions, or remove the file and the careers page handles 0 open roles gracefully.

---

### B3. Capabilities Statement PDF
The HTML version at `/capabilities` is good. For prime contractor / agency procurement, you'll want a downloadable one-page PDF too.

**Two options:**
- I generate the PDF from the HTML page (export-on-build, lives at `/capabilities.pdf`)
- Danny provides an existing PDF, we host it as-is

---

### B4. Cloudflare Turnstile real keys
**Currently using:** Cloudflare's "always pass" test sitekey (`1x...AA`) — fine for development, leaves the form unprotected against spam.

**Steps:** Cloudflare dashboard → Turnstile → create a sitekey for `oceansllc.com`. Send me the sitekey + secret. I update env vars and redeploy.

---

### B5. Cloudflare Web Analytics token
The site tracks no analytics right now. To turn it on:
1. Cloudflare → Analytics → Web Analytics → Add site `oceansllc.com`
2. Copy the beacon token
3. I add the snippet to `BaseLayout.astro`

Cookie-less, so no GDPR banner needed.

---

### B6. Cookie / privacy banner decision
We're not setting any cookies and using cookie-less analytics — so no banner is required. But Danny may want a small disclosure on the privacy page or footer for federal-customer optics.

**Confirm:** keep as-is, or add a one-line disclosure ("This site uses no cookies. Analytics: Cloudflare Web Analytics (anonymous).")?

---

### B7. Photography — Institute
Institute theme is type-led editorial. It would benefit from one or two B&W reportage shots in the masthead area (founder portrait scene, archival research scene, etc.).

I can source from Unsplash (free for commercial, with attribution) and you approve 2-3 picks. Or Danny provides licensed imagery.

---

### B8. Photography — Mariner
Mariner has an above-deck ocean shot in the "DEPTH 02" section. We could add 1-2 more maritime images on the hero or as section dividers. Same approval flow.

---

## Group C — Nice-to-have

### C1. Founder direct emails
Currently all team members list `info@oceansllc.com`. If Danny / Paul / Jamie / Momena want their direct addresses on `/team`, just provide them.

### C2. Phone number policy
Phone `727-455-9383` was removed from the site per the Wix scrape audit (it wasn't in the scrape so we assumed outdated). If there IS a current main-line phone Danny wants public, give me the number and I'll add it back to Footer + Contact + Capabilities.

### C3. Headshot updates
The four team portraits in `public/team/` are the ones you sent. Danny may want updated headshots for any of the team members — drop new AVIFs in `website/public/team/` with the same filenames and they swap in automatically.

### C4. About-page founder photography
The About page has a portrait stack of the two co-founders. Could be expanded with environmental shots (e.g., at the SRI office, at a port, at a control room) for narrative depth.

### C5. Newsletter signup
Currently the blog has an RSS feed but no email subscription. If you want a "Subscribe to updates" form, we'd add Buttondown or ConvertKit (free tiers) — Danny picks platform, I integrate.

### C6. Real OG default image
The Open Graph card image is a placeholder PNG. A proper one (1200×630 with the logo + tagline) takes ~30 min once the logo is locked.

### C7. Press / News section
P2 in the original spec. Once there's actual press coverage of OCEANS, we wire `/press` page that filters blog posts with a `press` tag.

### C8. Search
P2. Pagefind ships ~50KB and gives full-text search across the site. Worth adding before the site has more than ~30 pages.

### C9. Capabilities Statement: contract vehicles
The `/capabilities` page mentions "Contract Vehicles" in the Operator CTA. We don't have any listed yet. If OCEANS is on any GSA schedules, GWACs, or BPAs, list them and I'll add a section.

### C10. Certifications / compliance posture
For some federal customers, listing SOC 2, ISO 27001, or CMMC posture matters. If OCEANS has any active certifications or audit programs, list them and I'll add a "Compliance" panel to `/capabilities`.

---

## What's already real and confirmed

For Danny's reassurance — the following content is pulled from the live Wix site or directly approved:

- All 4 team member names, roles, and bios
- All 57 mission partners on `/experience` (verbatim from the Wix scrape)
- Founder origin story on `/about`
- 4 core competencies + 3 core values
- 4 service descriptions with method bullet lists
- Address: Jacksonville, FL
- LinkedIn: dotted-form URL per scraped Wix
- Email: `info@oceansllc.com`

---

## Quick yes/no list for Danny

If sending Danny a single message, asking these in order would unblock everything:

1. **Theme:** Operator / Institute / Mariner — which one?
2. **Logo:** Concept 1–5 from the preview page — which one?
3. **CAGE + UEI**: please send the codes
4. **NAICS codes**: confirm 541330, 541715, 541512 or send updates
5. **Resend domain:** do you want me to walk you through the 5-min DNS setup so the form delivers email?
6. **LinkedIn:** confirm `linkedin.com/company/o.c.e.a.n.s.-llc` is current
7. **Case studies:** can we book a 30-min interview to capture 3-5 real engagements (sanitized)?
8. **Open roles:** are the two posted positions (Senior Systems Engineer, OT&E Engineer) actually open, or should I remove them until you have real openings?

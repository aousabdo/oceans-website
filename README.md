# OCEANS LLC Website

Marketing site for OCEANS LLC. Built with Astro 4 + Cloudflare Pages.

- **Spec:** [docs/superpowers/specs/2026-05-11-oceans-website-redesign-design.md](docs/superpowers/specs/2026-05-11-oceans-website-redesign-design.md)
- **Plan:** [docs/superpowers/plans/2026-05-11-oceans-website-redesign.md](docs/superpowers/plans/2026-05-11-oceans-website-redesign.md)

## Quick start

```bash
cd website
npm install
npm run dev
```

## Themes

The site builds in one of three themes via `PUBLIC_THEME`:

```bash
PUBLIC_THEME=operator  npm run dev
PUBLIC_THEME=institute npm run dev
PUBLIC_THEME=mariner   npm run dev
```

## Deployment

GitHub Actions builds the active branch and deploys to Cloudflare Pages. Three preview deploys (`theme/operator`, `theme/institute`, `theme/mariner`) run continuously during the selection phase.
